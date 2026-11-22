import { jsPDF } from 'jspdf';
import Papa from 'papaparse';

export interface ReportSection {
  heading: string;
  rows: string[];
}

export interface ReportSpec {
  title: string;
  subtitle: string;
  metadataLines: string[];
  sections: ReportSection[];
  filename: string;
}

export function validateReportSpec(options: ReportSpec): void {
  if (!options.title || !options.title.trim()) {
    throw new Error('Report title is required.');
  }
  if (!Array.isArray(options.sections) || options.sections.length === 0) {
    throw new Error('At least one report section is required.');
  }
  const hasAnyRow = options.sections.some((s) => Array.isArray(s.rows) && s.rows.length > 0);
  if (!hasAnyRow) {
    throw new Error('Report cannot be generated with empty sections.');
  }
}

export function containsNonLatinScript(text: string): boolean {
  return /[^\u0000-\u024F\s\d\p{P}\p{S}]/u.test(text);
}

export function sanitizeTextForStandardPdfFont(text: string): string {
  // jsPDF built-in Helvetica supports WinAnsi/Latin-1 cleanly; preserve ° ′ ″ safely
  return text
    .replace(/′/g, "'")
    .replace(/″/g, '"')
    .replace(/→/g, '->')
    .replace(/·/g, '|')
    .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '?');
}

export function buildUnicodePrintableHtml(options: ReportSpec): string {
  validateReportSpec(options);
  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const metaHtml = options.metadataLines.map((m) => `<li>${escapeHtml(m)}</li>`).join('');
  const secHtml = options.sections
    .map(
      (s) => `
      <section style="margin-top:18px;">
        <h2 style="font-size:15px;color:#0D1B3E;border-bottom:1px solid #C59326;padding-bottom:4px;">${escapeHtml(s.heading)}</h2>
        <ul style="font-size:12px;line-height:1.6;color:#1F2937;padding-left:18px;">
          ${s.rows.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}
        </ul>
      </section>`
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(options.title)}</title>
</head>
<body style="font-family:'Plus Jakarta Sans','Noto Sans Devanagari',sans-serif;background:#FCFBF7;color:#0D1B3E;padding:28px;max-width:820px;margin:0 auto;">
  <header style="border-bottom:2px solid #C59326;padding-bottom:12px;">
    <div style="font-size:18px;font-weight:700;letter-spacing:0.04em;">GOO ASTROLOGY UNLIMITED FREE</div>
    <h1 style="font-size:20px;margin:6px 0 4px;color:#9A6D12;">${escapeHtml(options.title)}</h1>
    <div style="font-size:12px;color:#475569;">${escapeHtml(options.subtitle)}</div>
  </header>
  ${metaHtml ? `<ul style="font-size:11px;color:#475569;margin-top:12px;padding-left:18px;">${metaHtml}</ul>` : ''}
  ${secHtml}
  <footer style="margin-top:24px;border-top:1px solid #E7DEC8;padding-top:8px;font-size:10px;color:#64748B;">
    Generated locally by GOO ASTROLOGY UNLIMITED FREE (Lahiri Sidereal / Astronomy Engine MIT). Educational &amp; cultural astrology reference.
  </footer>
</body>
</html>`;
}

export function downloadTextFile(filename: string, content: string, mime = 'application/json') {
  if (!filename.trim()) throw new Error('Filename is required.');
  const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportRowsToCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('Cannot export empty CSV rows.');
  }
  const csv = Papa.unparse(rows);
  downloadTextFile(filename, csv, 'text/csv');
}

export function buildKundliPdfDocument(options: ReportSpec): jsPDF {
  validateReportSpec(options);
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 48;

  // Header band (Ivory + Gold + Navy)
  doc.setFillColor(252, 251, 247);
  doc.rect(0, 0, pageWidth, 86, 'F');
  doc.setDrawColor(197, 147, 38);
  doc.setLineWidth(1.5);
  doc.line(36, 82, pageWidth - 36, 82);

  doc.setTextColor(13, 27, 62);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('GOO ASTROLOGY UNLIMITED FREE', 40, y);

  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(154, 109, 18);
  doc.text(sanitizeTextForStandardPdfFont(options.title), 40, y);

  y += 28;
  doc.setTextColor(55, 65, 81);
  doc.setFontSize(10);
  doc.text(sanitizeTextForStandardPdfFont(options.subtitle), 40, y);
  y += 18;

  for (const line of options.metadataLines) {
    if (y > 770) {
      doc.addPage();
      y = 48;
    }
    doc.text(sanitizeTextForStandardPdfFont(line), 40, y, { maxWidth: pageWidth - 80 });
    y += 14;
  }

  y += 10;
  for (const sec of options.sections) {
    if (y > 740) {
      doc.addPage();
      y = 48;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(13, 27, 62);
    doc.text(sanitizeTextForStandardPdfFont(sec.heading), 40, y);
    y += 16;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(31, 41, 55);
    for (const row of sec.rows) {
      const wrapped = doc.splitTextToSize(sanitizeTextForStandardPdfFont(row), pageWidth - 90) as string[];
      for (const wLine of wrapped) {
        if (y > 780) {
          doc.addPage();
          y = 48;
        }
        doc.text(`- ${wLine}`, 48, y);
        y += 13;
      }
    }
    y += 10;
  }

  return doc;
}

export function exportKundliReportPdf(options: ReportSpec) {
  const doc = buildKundliPdfDocument(options);
  doc.save(options.filename);
}

export function exportSvgElementToPng(svgElement: SVGSVGElement, filename: string, background = '#FCFBF7') {
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgElement);
  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const width = svgElement.viewBox.baseVal?.width || svgElement.clientWidth || 800;
    const height = svgElement.viewBox.baseVal?.height || svgElement.clientHeight || 800;
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = filename;
      a.click();
    }
    URL.revokeObjectURL(url);
  };
  img.src = url;
}
