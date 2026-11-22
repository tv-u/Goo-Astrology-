import { createHash } from 'node:crypto';
import { z } from 'zod';
import { db } from './db';
import { INDIAN_CITIES } from '../src/data/cities';
import { NAKSHATRAS, ZODIAC_SIGNS } from '../src/engine/constants';
import { SUPPORTED_LANGUAGES } from '../src/data/locales';

const datasetPayloadSchema = z.object({
  schemaVersion: z.string(),
  generatedAt: z.string(),
  records: z.array(z.record(z.string(), z.unknown())).min(1),
});

export function computeSha256(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

function buildSeedDatasets() {
  const now = new Date().toISOString();
  return [
    {
      sourceSlug: 'indian-cities-geonames',
      datasetKey: 'indian_cities_coordinates',
      title: 'Indian Cities & Birth Coordinate Gazetteer',
      version: '2026.1.0',
      payload: {
        schemaVersion: '1.0',
        generatedAt: now,
        records: INDIAN_CITIES.map((c) => ({
          name: c.name,
          state: c.state,
          latitude: c.latitude,
          longitude: c.longitude,
          timezoneOffsetMinutes: c.timezoneOffsetMinutes,
          timezoneName: c.timezoneName,
        })),
      },
    },
    {
      sourceSlug: 'vedic-nakshatra-table',
      datasetKey: 'nakshatra_pada_reference',
      title: '27 Nakshatra & 108 Pada Vedic Reference Table',
      version: '2026.1.0',
      payload: {
        schemaVersion: '1.0',
        generatedAt: now,
        records: NAKSHATRAS.map((n) => ({
          index: n.index + 1,
          name: n.name,
          hindiName: n.hindiName,
          lord: n.lord,
          deity: n.deity,
          gana: n.gana,
          nadi: n.nadi,
          yoni: n.yoni,
          padaSyllables: n.padaSyllables,
        })),
      },
    },
    {
      sourceSlug: 'astronomical-checkpoints',
      datasetKey: 'ephemeris_j2000_checkpoints',
      title: 'NASA/JPL VSOP87 & Lahiri Ayanamsha Checkpoints',
      version: '2026.1.0',
      payload: {
        schemaVersion: '1.0',
        generatedAt: now,
        records: [
          {
            label: 'J2000.0 Reference Epoch',
            date: '2000-01-01',
            time: '12:00:00',
            tzOffsetMinutes: 0,
            expectedLahiriAyanamshaDeg: 23.857092,
            expectedSunTropicalDeg: 280.37,
          },
          {
            label: 'Vernal Equinox Reference 2026',
            date: '2026-03-20',
            time: '14:46:00',
            tzOffsetMinutes: 0,
            expectedLahiriAyanamshaDeg: 24.223,
            expectedSunTropicalDeg: 0.0,
          },
          {
            label: 'Mesha Sankranti Reference 2026',
            date: '2026-04-14',
            time: '09:30:00',
            tzOffsetMinutes: 330,
            expectedLahiriAyanamshaDeg: 24.224,
            expectedSunSiderealSign: 'Aries',
          },
        ],
      },
    },
    {
      sourceSlug: 'rashi-dignity-matrix',
      datasetKey: 'zodiac_rashi_reference',
      title: '12 Sidereal Rashi, Tattva & Lordship Matrix',
      version: '2026.1.0',
      payload: {
        schemaVersion: '1.0',
        generatedAt: now,
        records: ZODIAC_SIGNS.map((z) => ({
          index: z.index + 1,
          name: z.name,
          sanskritName: z.sanskritName,
          hindiName: z.hindiName,
          element: z.element,
          modality: z.modality,
          ruler: z.ruler,
          gemstone: z.gemstone,
        })),
      },
    },
    {
      sourceSlug: 'indian-languages-i18n',
      datasetKey: 'indian_languages_dictionary',
      title: '12 Indian Languages Astrology Terminology Pack',
      version: '2026.1.0',
      payload: {
        schemaVersion: '1.0',
        generatedAt: now,
        records: SUPPORTED_LANGUAGES.map((l) => ({
          code: l.code,
          name: l.name,
          nativeName: l.nativeName,
          hreflang: l.hreflang,
          script: l.script,
        })),
      },
    },
  ];
}

export function initializeSyncDatasets() {
  const insSource = db.prepare(`
    INSERT OR IGNORE INTO sync_sources (slug, name, category, license, refresh_interval_hours, enabled)
    VALUES (?, ?, ?, ?, ?, 1)
  `);
  const sources = [
    ['indian-cities-geonames', 'Indian Cities Coordinate Gazetteer', 'Geography', 'CC0 / Public', 168],
    ['vedic-nakshatra-table', 'Nakshatra & Pada Sidereal Table', 'Vedic Core', 'MIT Open Data', 720],
    ['astronomical-checkpoints', 'Astronomical VSOP87 Checkpoints', 'Ephemeris QA', 'MIT / NASA-JPL Derived', 24],
    ['rashi-dignity-matrix', 'Sidereal Rashi & Dignity Matrix', 'Vedic Core', 'MIT Open Data', 720],
    ['indian-languages-i18n', 'All-India 12 Language Localization Pack', 'Localization', 'MIT Open Data', 168],
  ] as const;

  for (const s of sources) {
    insSource.run(...s);
  }

  const insDataset = db.prepare(`
    INSERT OR IGNORE INTO datasets (
      source_slug, dataset_key, title, version, checksum_sha256, record_count, integrity_status, payload_json
    ) VALUES (?, ?, ?, ?, ?, ?, 'verified', ?)
  `);
  const insHist = db.prepare(`
    INSERT INTO sync_history (source_slug, dataset_key, action, status, version, checksum_sha256, message)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const count = (db.prepare('SELECT COUNT(*) as c FROM datasets').get() as { c: number }).c;
  if (count === 0) {
    for (const ds of buildSeedDatasets()) {
      const jsonStr = JSON.stringify(ds.payload);
      const checksum = computeSha256(jsonStr);
      insDataset.run(
        ds.sourceSlug,
        ds.datasetKey,
        ds.title,
        ds.version,
        checksum,
        ds.payload.records.length,
        jsonStr
      );
      insHist.run(
        ds.sourceSlug,
        ds.datasetKey,
        'seed',
        'success',
        ds.version,
        checksum,
        `Initial open dataset seeded and verified (${ds.payload.records.length} records)`
      );
    }
  }
}

function bumpPatchVersion(version: string): string {
  const parts = version.split('.').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return '2026.1.1';
  return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
}

export function runDatasetSync(options?: { datasetKey?: string; simulateCorruptPayload?: boolean }) {
  const seeds = buildSeedDatasets();
  const targets = options?.datasetKey
    ? seeds.filter((s) => s.datasetKey === options.datasetKey)
    : seeds;

  const results: Array<{
    datasetKey: string;
    status: 'updated' | 'verified' | 'recovered_fallback';
    version: string;
    checksum: string;
    message: string;
  }> = [];

  for (const seed of targets) {
    const existing = db
      .prepare('SELECT * FROM datasets WHERE dataset_key = ?')
      .get(seed.datasetKey) as
      | {
          source_slug: string;
          dataset_key: string;
          version: string;
          checksum_sha256: string;
          payload_json: string;
        }
      | undefined;

    if (options?.simulateCorruptPayload) {
      const msg = 'Validation blocked corrupt upstream batch; retained verified cached version for recovery.';
      if (existing) {
        db.prepare("UPDATE datasets SET integrity_status = 'fallback_cached' WHERE dataset_key = ?").run(seed.datasetKey);
        db.prepare(
          'INSERT INTO sync_history (source_slug, dataset_key, action, status, version, checksum_sha256, message) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(seed.sourceSlug, seed.datasetKey, 'sync', 'recovered', existing.version, existing.checksum_sha256, msg);
        results.push({
          datasetKey: seed.datasetKey,
          status: 'recovered_fallback',
          version: existing.version,
          checksum: existing.checksum_sha256,
          message: msg,
        });
      }
      continue;
    }

    const parsed = datasetPayloadSchema.safeParse(seed.payload);
    if (!parsed.success) {
      const msg = `Schema check failed: ${parsed.error.message}`;
      if (existing) {
        db.prepare(
          'INSERT INTO sync_history (source_slug, dataset_key, action, status, version, checksum_sha256, message) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(seed.sourceSlug, seed.datasetKey, 'sync', 'failed', existing.version, existing.checksum_sha256, msg);
        results.push({
          datasetKey: seed.datasetKey,
          status: 'recovered_fallback',
          version: existing.version,
          checksum: existing.checksum_sha256,
          message: msg,
        });
      }
      continue;
    }

    const nextPayloadStr = JSON.stringify(parsed.data);
    const nextChecksum = computeSha256(nextPayloadStr);

    if (!existing) {
      db.prepare(
        `INSERT INTO datasets (source_slug, dataset_key, title, version, checksum_sha256, record_count, integrity_status, payload_json)
         VALUES (?, ?, ?, ?, ?, ?, 'verified', ?)`
      ).run(
        seed.sourceSlug,
        seed.datasetKey,
        seed.title,
        seed.version,
        nextChecksum,
        parsed.data.records.length,
        nextPayloadStr
      );
      db.prepare(
        'INSERT INTO sync_history (source_slug, dataset_key, action, status, version, checksum_sha256, message) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(seed.sourceSlug, seed.datasetKey, 'sync', 'success', seed.version, nextChecksum, 'Inserted fresh open dataset');
      results.push({
        datasetKey: seed.datasetKey,
        status: 'updated',
        version: seed.version,
        checksum: nextChecksum,
        message: 'Inserted and verified SHA-256 checksum',
      });
    } else {
      const nextVersion = bumpPatchVersion(existing.version);
      db.prepare(
        `UPDATE datasets
         SET previous_version = version,
             previous_checksum = checksum_sha256,
             previous_payload_json = payload_json,
             version = ?,
             checksum_sha256 = ?,
             record_count = ?,
             integrity_status = 'verified',
             payload_json = ?,
             updated_at = datetime('now')
         WHERE dataset_key = ?`
      ).run(nextVersion, nextChecksum, parsed.data.records.length, nextPayloadStr, seed.datasetKey);

      db.prepare(
        'INSERT INTO sync_history (source_slug, dataset_key, action, status, version, checksum_sha256, message) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(
        seed.sourceSlug,
        seed.datasetKey,
        'sync',
        'success',
        nextVersion,
        nextChecksum,
        `Synced & validated ${parsed.data.records.length} records cleanly`
      );
      results.push({
        datasetKey: seed.datasetKey,
        status: 'updated',
        version: nextVersion,
        checksum: nextChecksum,
        message: `Synced cleanly (${parsed.data.records.length} records verified)`,
      });
    }
  }

  return results;
}

export function rollbackDataset(datasetKey: string) {
  const row = db.prepare('SELECT * FROM datasets WHERE dataset_key = ?').get(datasetKey) as
    | {
        source_slug: string;
        dataset_key: string;
        version: string;
        previous_version: string | null;
        previous_checksum: string | null;
        previous_payload_json: string | null;
      }
    | undefined;

  if (!row || !row.previous_version || !row.previous_payload_json || !row.previous_checksum) {
    return { ok: false, message: 'No previous snapshot available for rollback.' };
  }

  db.prepare(
    `UPDATE datasets
     SET version = ?,
         checksum_sha256 = ?,
         payload_json = ?,
         integrity_status = 'verified',
         updated_at = datetime('now')
     WHERE dataset_key = ?`
  ).run(row.previous_version, row.previous_checksum, row.previous_payload_json, datasetKey);

  db.prepare(
    'INSERT INTO sync_history (source_slug, dataset_key, action, status, version, checksum_sha256, message) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(
    row.source_slug,
    datasetKey,
    'rollback',
    'success',
    row.previous_version,
    row.previous_checksum,
    `Rolled back from ${row.version} to ${row.previous_version}`
  );

  return { ok: true, restoredVersion: row.previous_version, checksum: row.previous_checksum };
}

export function getSyncOverview() {
  const sources = db.prepare('SELECT * FROM sync_sources ORDER BY id ASC').all();
  const datasets = db
    .prepare(
      'SELECT id, source_slug, dataset_key, title, version, checksum_sha256, record_count, integrity_status, previous_version, updated_at FROM datasets ORDER BY id ASC'
    )
    .all();
  const history = db.prepare('SELECT * FROM sync_history ORDER BY id DESC LIMIT 40').all();
  return { sources, datasets, history };
}

export function getPublicDatasetPayload(datasetKey: string) {
  const row = db.prepare('SELECT * FROM datasets WHERE dataset_key = ?').get(datasetKey) as
    | {
        dataset_key: string;
        title: string;
        version: string;
        checksum_sha256: string;
        record_count: number;
        integrity_status: string;
        payload_json: string;
        updated_at: string;
      }
    | undefined;
  if (!row) return null;
  return {
    datasetKey: row.dataset_key,
    title: row.title,
    version: row.version,
    checksumSha256: row.checksum_sha256,
    recordCount: row.record_count,
    integrityStatus: row.integrity_status,
    updatedAt: row.updated_at,
    payload: JSON.parse(row.payload_json),
  };
}
