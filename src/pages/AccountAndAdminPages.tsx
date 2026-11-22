import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Database, Download, LogOut, RefreshCw, RotateCcw, Shield, ShieldAlert, Trash2 } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { BirthInputForm } from '../components/BirthInputForm';
import type { BirthInput } from '../engine/ephemeris';

export const AuthPage: React.FC<{ mode: 'login' | 'register' }> = ({ mode }) => {
  const { loginSession, t } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'login' ? { email, password } : { email, password, fullName }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error || 'Authentication failed.');
      } else {
        loginSession(data.token, data.user);
        navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
      }
    } catch {
      setError('Network error while contacting server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <SeoHead title={mode === 'login' ? 'Sign In' : 'Create Account'} description="Sign in or register for a free GOO ASTROLOGY account to save Kundli profiles and reports." />
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 sm:p-8 space-y-5">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          {mode === 'login' ? t('Sign In', 'लॉग इन करें') : t('Create Free Account', 'निःशुल्क खाता बनाएं')}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs text-slate-500 mb-1">Full Name</label>
              <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]" />
            </div>
          )}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Password (min 8 chars)</label>
            <input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]" />
          </div>
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <button disabled={loading} type="submit" className="w-full py-2.5 text-sm font-semibold rounded-lg bg-amber-500 text-slate-950 cursor-pointer">
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <p className="text-xs text-slate-500 text-center">
          {mode === 'login' ? (
            <>New here? <Link to="/register" className="text-amber-500 hover:underline">Register free</Link></>
          ) : (
            <>Already registered? <Link to="/login" className="text-amber-500 hover:underline">Sign In</Link></>
          )}
        </p>
      </div>
    </div>
  );
};

export const UserDashboardPage: React.FC<{ initialTab?: 'overview' | 'profile' | 'reports' }> = ({ initialTab = 'overview' }) => {
  const { user, token, logoutSession, setActiveKundli, t } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState(initialTab);
  const [birthProfiles, setBirthProfiles] = useState<{ id: number; full_name: string; birth_date: string; birth_time: string; place_name: string; latitude: number; longitude: number; timezone_offset_minutes: number }[]>([]);
  const [savedReadings, setSavedReadings] = useState<{ id: number; reading_type: string; title: string; created_at: string; payload_json: string }[]>([]);
  const [consultations, setConsultations] = useState<{ id: number; astrologer_name: string; mode: string; status: string; scheduled_for: string }[]>([]);
  const [showAddBirth, setShowAddBirth] = useState(false);
  const [msg, setMsg] = useState('');

  const loadDashboard = async () => {
    if (!token) return;
    const resp = await fetch('/api/user/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resp.ok) {
      const data = await resp.json();
      setBirthProfiles(data.birthProfiles || []);
      setSavedReadings(data.savedReadings || []);
      setConsultations(data.consultations || []);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [token]);

  if (!user || !token) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <SeoHead title="User Dashboard" description="Manage saved birth profiles, Kundli reports, Tarot readings, and consultations." />
        <h1 className="font-display text-3xl font-bold">Sign In to Access Your Dashboard</h1>
        <p className="text-sm text-slate-500">All public calculators work without an account. Sign in to save multiple birth profiles and export reports.</p>
        <div className="flex justify-center gap-3">
          <Link to="/login" className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-amber-500 text-slate-950">Sign In</Link>
          <Link to="/register" className="px-5 py-2.5 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700">Register</Link>
        </div>
      </div>
    );
  }

  const handleSaveBirthProfile = async (inp: BirthInput) => {
    const resp = await fetch('/api/user/birth-profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        fullName: inp.name,
        birthDate: inp.date,
        birthTime: inp.time,
        placeName: inp.placeName,
        latitude: inp.latitude,
        longitude: inp.longitude,
        timezoneOffsetMinutes: inp.timezoneOffsetMinutes,
        timezoneName: inp.timezoneName,
        ayanamsha: inp.ayanamsha,
      }),
    });
    if (resp.ok) {
      setShowAddBirth(false);
      setMsg('Birth profile saved.');
      loadDashboard();
    }
  };

  const handleExportMyData = async () => {
    const resp = await fetch('/api/user/export', { headers: { Authorization: `Bearer ${token}` } });
    if (resp.ok) {
      const blob = new Blob([JSON.stringify(await resp.json(), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `goo-astrology-user-data-${user.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDeleteAccount = async () => {
    const resp = await fetch('/api/user/account', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resp.ok) {
      logoutSession();
      navigate('/');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoHead title="User Dashboard & Saved Reports" description="Manage your birth charts, saved readings, consultations, and privacy settings." />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
            {t('Welcome,', 'स्वागत है,')} {user.fullName}
          </h1>
          <p className="text-xs text-slate-500">{user.email} · Role: {user.role}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleExportMyData} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer">
            <Download className="w-3.5 h-3.5" /> Export My Data
          </button>
          <button type="button" onClick={() => { logoutSession(); navigate('/'); }} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {(['overview', 'reports', 'profile'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg capitalize cursor-pointer ${
              tab === k ? 'bg-amber-500 text-slate-950' : 'border border-slate-200 dark:border-slate-800'
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {msg && <p className="text-xs text-amber-500">{msg}</p>}

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Saved Birth Profiles ({birthProfiles.length})</h2>
            <button type="button" onClick={() => setShowAddBirth((v) => !v)} className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 cursor-pointer">
              + Add Birth Profile
            </button>
          </div>
          {showAddBirth && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6">
              <BirthInputForm onSubmit={handleSaveBirthProfile} submitLabel="Save Profile" />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {birthProfiles.map((bp) => (
              <div key={bp.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-4 space-y-2">
                <p className="font-semibold">{bp.full_name}</p>
                <p className="text-xs font-mono text-slate-500">{bp.birth_date} · {bp.birth_time} · {bp.place_name}</p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      const resp = await fetch('/api/kundli', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({
                          name: bp.full_name,
                          date: bp.birth_date,
                          time: bp.birth_time,
                          latitude: bp.latitude,
                          longitude: bp.longitude,
                          timezoneOffsetMinutes: bp.timezone_offset_minutes,
                          placeName: bp.place_name,
                        }),
                      });
                      if (resp.ok) {
                        setActiveKundli(await resp.json());
                        navigate('/free-kundli');
                      }
                    }}
                    className="text-xs font-semibold text-amber-500 hover:underline cursor-pointer"
                  >
                    Open Kundli →
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5">
            <h2 className="font-display text-2xl font-bold mb-3">Consultation History ({consultations.length})</h2>
            {consultations.length === 0 ? (
              <p className="text-xs text-slate-500">No consultation requests booked yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {consultations.map((c) => (
                  <div key={c.id} className="py-2 flex justify-between">
                    <span>{c.astrologer_name} ({c.mode})</span>
                    <span className="font-mono">{c.scheduled_for} · {c.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedReadings.length === 0 ? (
            <p className="text-sm text-slate-500">No saved reports yet. Save a Kundli, Tarot reading, or Numerology report from any tool.</p>
          ) : (
            savedReadings.map((sr) => (
              <div key={sr.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-mono text-amber-500">{sr.reading_type}</p>
                  <p className="font-semibold text-sm">{sr.title}</p>
                  <p className="text-xs text-slate-500">{sr.created_at}</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await fetch(`/api/user/saved-readings/${sr.id}`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    loadDashboard();
                  }}
                  className="p-2 text-slate-400 hover:text-rose-500 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'profile' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
          <h2 className="font-display text-2xl font-bold">Account &amp; Privacy Controls</h2>
          <p className="text-xs text-slate-500">Download your complete JSON archive or permanently delete your account and saved records.</p>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Permanently Delete My Account
          </button>
        </div>
      )}
    </div>
  );
};

export const AdminDashboardPage: React.FC = () => {
  const { user, token, loginSession } = useApp();
  const [bootstrapStatus, setBootstrapStatus] = useState<{ needsAdminSetup: boolean; envPasscodeActive: boolean } | null>(null);
  const [setupForm, setSetupForm] = useState({ email: '', password: '', fullName: '', envPasscode: '' });
  const [setupError, setSetupError] = useState('');
  const [adminTab, setAdminTab] = useState<'analytics' | 'sync' | 'features' | 'users' | 'astrologers' | 'articles' | 'settings' | 'logs'>('analytics');
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [usersList, setUsersList] = useState<{ id: number; email: string; full_name: string; role: string }[]>([]);
  const [astrosList, setAstrosList] = useState<{ id: number; display_name: string; specializations: string; approval_status: string }[]>([]);
  const [articlesList, setArticlesList] = useState<{ id: number; title: string; category: string; status: string }[]>([]);
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});
  const [adsList, setAdsList] = useState<{ placement: string; enabled: number; network_code: string; ad_slot_id: string }[]>([]);
  const [auditLogs, setAuditLogs] = useState<{ id: number; action: string; target: string; details: string; created_at: string }[]>([]);
  const [syncOverview, setSyncOverview] = useState<{
    sources: { slug: string; name: string; category: string; license: string; refresh_interval_hours: number }[];
    datasets: { dataset_key: string; title: string; version: string; previous_version: string | null; checksum_sha256: string; record_count: number; integrity_status: string; updated_at: string }[];
    history: { id: number; dataset_key: string; action: string; status: string; version: string; message: string; created_at: string }[];
  }>({ sources: [], datasets: [], history: [] });
  const [featureFlags, setFeatureFlags] = useState<{ feature_code: string; title: string; category: string; route: string; enabled: number }[]>([]);
  const [featureCatFilter, setFeatureCatFilter] = useState('All');
  const [syncBusy, setSyncBusy] = useState(false);
  const [newArticle, setNewArticle] = useState({ title: '', hindiTitle: '', category: 'Kundli Guides', excerpt: '', body: '' });
  const [notice, setNotice] = useState('');

  useEffect(() => {
    fetch('/api/admin/bootstrap-status')
      .then((r) => r.json())
      .then((d) => setBootstrapStatus(d))
      .catch(() => {});
  }, []);

  const loadAdminData = async () => {
    if (!token || user?.role !== 'admin') return;
    const headers = { Authorization: `Bearer ${token}` };
    const [ov, us, as, ar, st, sy, ff] = await Promise.all([
      fetch('/api/admin/overview', { headers }).then((r) => r.json()),
      fetch('/api/admin/users', { headers }).then((r) => r.json()),
      fetch('/api/admin/astrologers', { headers }).then((r) => r.json()),
      fetch('/api/admin/articles', { headers }).then((r) => r.json()),
      fetch('/api/admin/settings', { headers }).then((r) => r.json()),
      fetch('/api/sync/status').then((r) => r.json()),
      fetch('/api/features').then((r) => r.json()),
    ]);
    setMetrics(ov.metrics || {});
    setUsersList(us.users || []);
    setAstrosList(as.astrologers || []);
    setArticlesList(ar.articles || []);
    const sMap: Record<string, string> = {};
    for (const row of st.settings || []) sMap[row.key] = row.value;
    setSettingsMap(sMap);
    setAdsList(st.ads || []);
    setAuditLogs(st.auditLogs || []);
    setSyncOverview({
      sources: sy.sources || [],
      datasets: sy.datasets || [],
      history: sy.history || [],
    });
    setFeatureFlags(ff.features || []);
  };

  useEffect(() => {
    loadAdminData();
  }, [token, user]);

  // First-Run Secure Admin Setup (no hardcoded default password!)
  if (bootstrapStatus?.needsAdminSetup) {
    const submitBootstrap = async (e: React.FormEvent) => {
      e.preventDefault();
      setSetupError('');
      const resp = await fetch('/api/admin/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setupForm),
      });
      const data = await resp.json();
      if (!resp.ok) setSetupError(data.error || 'Setup failed.');
      else {
        loginSession(data.token, data.user);
        setBootstrapStatus({ needsAdminSetup: false, envPasscodeActive: bootstrapStatus.envPasscodeActive });
      }
    };

    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <SeoHead title="First-Time Admin Setup" description="Initialize your first administrator account securely." />
        <div className="rounded-xl border border-amber-500/40 bg-white dark:bg-[#0C1226] p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-amber-500">
            <Shield className="w-5 h-5" />
            <h1 className="font-display text-2xl font-bold">First-Admin Secure Setup</h1>
          </div>
          <p className="text-xs text-slate-500">
            No administrator exists yet. Claim the first admin role with a strong password (this route locks permanently once claimed).
          </p>
          <form onSubmit={submitBootstrap} className="space-y-3">
            <input required type="text" placeholder="Admin Name" value={setupForm.fullName} onChange={(e) => setSetupForm({ ...setupForm, fullName: e.target.value })} className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]" />
            <input required type="email" placeholder="Admin Email" value={setupForm.email} onChange={(e) => setSetupForm({ ...setupForm, email: e.target.value })} className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]" />
            <input required minLength={8} type="password" placeholder="Strong Password (8+ chars)" value={setupForm.password} onChange={(e) => setSetupForm({ ...setupForm, password: e.target.value })} className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]" />
            {bootstrapStatus.envPasscodeActive && (
              <input required type="password" placeholder="Server ADMIN_PASSCODE" value={setupForm.envPasscode} onChange={(e) => setSetupForm({ ...setupForm, envPasscode: e.target.value })} className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]" />
            )}
            {setupError && <p className="text-xs text-rose-500">{setupError}</p>}
            <button type="submit" className="w-full py-2.5 text-sm font-semibold rounded-lg bg-amber-500 text-slate-950 cursor-pointer">
              Create First Administrator
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin' || !token) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <SeoHead title="Admin Control Panel" description="Protected administrator console." />
        <h1 className="font-display text-3xl font-bold">Administrator Sign-In Required</h1>
        <p className="text-sm text-slate-500">This panel enforces server-side role verification.</p>
        <Link to="/login" className="inline-block px-5 py-2.5 text-sm font-semibold rounded-lg bg-amber-500 text-slate-950">
          Sign In as Admin
        </Link>
      </div>
    );
  }

  const handleBackupDownload = async () => {
    const resp = await fetch('/api/admin/export', { headers: { Authorization: `Bearer ${token}` } });
    if (resp.ok) {
      const blob = new Blob([JSON.stringify(await resp.json(), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `goo-astrology-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoHead title="Admin Control Panel" description="Enterprise astrology administration console." />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
            Enterprise Admin Control Panel
          </h1>
          <p className="text-xs text-slate-500">Signed in as {user.email} (Admin)</p>
        </div>
        <button type="button" onClick={handleBackupDownload} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer">
          <Download className="w-3.5 h-3.5" /> Database Backup JSON
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[#E7DEC8] dark:border-slate-800 pb-3">
        {(['analytics', 'sync', 'features', 'users', 'astrologers', 'articles', 'settings', 'logs'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setAdminTab(k)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize cursor-pointer ${
              adminTab === k
                ? 'bg-[#C59326] text-white'
                : 'border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226]'
            }`}
          >
            {k === 'sync' ? 'Open Data Sync' : k === 'features' ? `Feature Flags (${featureFlags.length})` : k}
          </button>
        ))}
      </div>

      {notice && (
        <p className="text-xs font-medium px-3.5 py-2 rounded-lg bg-[#F7F2E4] dark:bg-amber-500/10 border border-[#E7DEC8] dark:border-amber-500/30 text-[#9A6D12] dark:text-amber-300">
          {notice}
        </p>
      )}

      {adminTab === 'analytics' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(metrics).map(([k, v]) => (
            <div key={k} className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-4">
              <p className="text-xs text-[#6B5B3E] dark:text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}</p>
              <p className="text-2xl font-mono font-bold tabular-nums mt-1 text-[#0D1B3E] dark:text-white">{v}</p>
            </div>
          ))}
        </div>
      )}

      {adminTab === 'sync' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-[#0D1B3E] dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-[#C59326]" />
                Automated Open-Data Sync &amp; Recovery Engine (F-79..82)
              </h2>
              <p className="text-xs text-[#4A5568] dark:text-slate-400 mt-0.5">
                Cloudflare D1 binding target: <span className="font-mono font-semibold">u-tv</span> · SHA-256 verified MIT/CC0 open datasets with atomic rollback snapshots.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={syncBusy}
                onClick={async () => {
                  setSyncBusy(true);
                  const resp = await fetch('/api/admin/sync/run', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({}),
                  });
                  const data = await resp.json();
                  if (resp.ok && data.overview) {
                    setSyncOverview(data.overview);
                    setNotice(`Synced ${(data.results || []).length} open datasets cleanly.`);
                  }
                  setSyncBusy(false);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#C59326] text-white cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncBusy ? 'animate-spin' : ''}`} />
                Run Sync All
              </button>
              <button
                type="button"
                disabled={syncBusy}
                onClick={async () => {
                  setSyncBusy(true);
                  const resp = await fetch('/api/admin/sync/run', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ simulateCorruptPayload: true }),
                  });
                  const data = await resp.json();
                  if (resp.ok && data.overview) {
                    setSyncOverview(data.overview);
                    setNotice('Simulated corrupt batch rejected by Zod validator; cached verified versions retained safely.');
                  }
                  setSyncBusy(false);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-amber-500/50 text-amber-700 dark:text-amber-300 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Simulate Corrupt Batch Recovery
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 overflow-x-auto">
            <h3 className="font-display text-lg font-bold mb-3">Managed Open Datasets &amp; Snapshots</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#E7DEC8] dark:border-slate-800 text-left text-[#6B5B3E] dark:text-slate-400">
                  <th className="py-2 pr-3">Dataset Key</th>
                  <th className="py-2 pr-3">Version</th>
                  <th className="py-2 pr-3">Records</th>
                  <th className="py-2 pr-3">SHA-256 Prefix</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8D6] dark:divide-slate-800">
                {syncOverview.datasets.map((ds) => (
                  <tr key={ds.dataset_key}>
                    <td className="py-2.5 pr-3 font-semibold">{ds.title} <span className="block font-mono text-[10px] text-slate-400">{ds.dataset_key}</span></td>
                    <td className="py-2.5 pr-3 font-mono">{ds.version}{ds.previous_version ? ` (prev: ${ds.previous_version})` : ''}</td>
                    <td className="py-2.5 pr-3 font-mono tabular-nums">{ds.record_count}</td>
                    <td className="py-2.5 pr-3 font-mono text-[11px] text-slate-500">{ds.checksum_sha256.slice(0, 14)}…</td>
                    <td className="py-2.5 pr-3 font-mono">
                      <span className={ds.integrity_status === 'verified' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                        {ds.integrity_status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right space-x-2">
                      <button
                        type="button"
                        disabled={!ds.previous_version || syncBusy}
                        onClick={async () => {
                          setSyncBusy(true);
                          const resp = await fetch('/api/admin/sync/rollback', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ datasetKey: ds.dataset_key }),
                          });
                          const data = await resp.json();
                          if (resp.ok && data.overview) {
                            setSyncOverview(data.overview);
                            setNotice(`Rolled back ${ds.dataset_key} to v${data.restoredVersion}.`);
                          } else {
                            setNotice(data.error || 'Rollback unavailable.');
                          }
                          setSyncBusy(false);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#E7DEC8] dark:border-slate-700 disabled:opacity-40 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" /> Rollback
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 overflow-x-auto">
            <h3 className="font-display text-lg font-bold mb-3">Sync Execution History</h3>
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-[#E7DEC8] dark:border-slate-800 text-left text-slate-500">
                  <th className="py-2 pr-3">Time</th><th className="py-2 pr-3">Dataset</th><th className="py-2 pr-3">Action</th><th className="py-2 pr-3">Version</th><th className="py-2">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8D6] dark:divide-slate-800">
                {syncOverview.history.slice(0, 15).map((h) => (
                  <tr key={h.id}>
                    <td className="py-2 pr-3 text-slate-500">{h.created_at}</td>
                    <td className="py-2 pr-3">{h.dataset_key}</td>
                    <td className="py-2 pr-3">{h.action} ({h.status})</td>
                    <td className="py-2 pr-3">{h.version}</td>
                    <td className="py-2">{h.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'features' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-[#0D1B3E] dark:text-white">
                100 Advanced Feature Flags Governance
              </h2>
              <p className="text-xs text-[#4A5568] dark:text-slate-400">
                Enable or inspect any Category A–G module dynamically across the platform.
              </p>
            </div>
            <select
              value={featureCatFilter}
              onChange={(e) => setFeatureCatFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-[#E7DEC8] dark:border-slate-700 bg-white dark:bg-[#0D1326]"
            >
              <option value="All">All Categories ({featureFlags.length})</option>
              {Array.from(new Set(featureFlags.map((f) => f.category))).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {featureFlags
              .filter((f) => featureCatFilter === 'All' || f.category === featureCatFilter)
              .map((f) => (
                <div key={f.feature_code} className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-4 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] text-[#9A6D12] dark:text-amber-400">{f.feature_code} · {f.category}</p>
                    <p className="font-semibold text-[#0D1B3E] dark:text-white truncate">{f.title}</p>
                    <p className="font-mono text-[10px] text-slate-400">{f.route}</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch(`/api/admin/features/${f.feature_code}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ enabled: !f.enabled }),
                      });
                      setNotice(`Feature ${f.feature_code} ${!f.enabled ? 'enabled' : 'disabled'}.`);
                      loadAdminData();
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-semibold shrink-0 cursor-pointer ${
                      f.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {f.enabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {adminTab === 'users' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500">
                <th className="py-2 pr-3">ID</th><th className="py-2 pr-3">Name</th><th className="py-2 pr-3">Email</th><th className="py-2">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {usersList.map((u) => (
                <tr key={u.id}>
                  <td className="py-2 pr-3 font-mono">{u.id}</td>
                  <td className="py-2 pr-3">{u.full_name}</td>
                  <td className="py-2 pr-3">{u.email}</td>
                  <td className="py-2">
                    <select
                      value={u.role}
                      onChange={async (e) => {
                        await fetch(`/api/admin/users/${u.id}/role`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ role: e.target.value }),
                        });
                        setNotice(`Updated ${u.email} role.`);
                        loadAdminData();
                      }}
                      className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-transparent"
                    >
                      <option value="user">user</option>
                      <option value="astrologer">astrologer</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {adminTab === 'astrologers' && (
        <div className="space-y-3">
          {astrosList.length === 0 ? (
            <p className="text-sm text-slate-500">No astrologer applications submitted yet.</p>
          ) : (
            astrosList.map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{a.display_name} ({a.approval_status})</p>
                  <p className="text-xs text-slate-500">{a.specializations}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch(`/api/admin/astrologers/${a.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ approvalStatus: 'approved', isAvailable: true }),
                      });
                      loadAdminData();
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 text-white cursor-pointer"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch(`/api/admin/astrologers/${a.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ approvalStatus: 'rejected', isAvailable: false }),
                      });
                      loadAdminData();
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded bg-rose-600 text-white cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {adminTab === 'articles' && (
        <div className="space-y-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await fetch('/api/admin/articles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ...newArticle, status: 'published' }),
              });
              setNewArticle({ title: '', hindiTitle: '', category: 'Kundli Guides', excerpt: '', body: '' });
              setNotice('Article published.');
              loadAdminData();
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-3"
          >
            <h2 className="font-display text-xl font-bold">Publish New Article</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input required placeholder="Title" value={newArticle.title} onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })} className="px-3 py-2 text-xs rounded border border-slate-300 dark:border-slate-700 bg-transparent" />
              <input placeholder="Hindi Title" value={newArticle.hindiTitle} onChange={(e) => setNewArticle({ ...newArticle, hindiTitle: e.target.value })} className="px-3 py-2 text-xs rounded border border-slate-300 dark:border-slate-700 bg-transparent" />
              <input placeholder="Category" value={newArticle.category} onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })} className="px-3 py-2 text-xs rounded border border-slate-300 dark:border-slate-700 bg-transparent" />
            </div>
            <input required placeholder="Short Excerpt" value={newArticle.excerpt} onChange={(e) => setNewArticle({ ...newArticle, excerpt: e.target.value })} className="w-full px-3 py-2 text-xs rounded border border-slate-300 dark:border-slate-700 bg-transparent" />
            <textarea required rows={3} placeholder="Article paragraphs (separate with blank lines)" value={newArticle.body} onChange={(e) => setNewArticle({ ...newArticle, body: e.target.value })} className="w-full px-3 py-2 text-xs rounded border border-slate-300 dark:border-slate-700 bg-transparent" />
            <button type="submit" className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 cursor-pointer">Publish Article</button>
          </form>

          <div className="space-y-2">
            {articlesList.map((ar) => (
              <div key={ar.id} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-3.5 flex items-center justify-between text-xs">
                <span>{ar.title} · {ar.category} · <strong>{ar.status}</strong></span>
                <button
                  type="button"
                  onClick={async () => {
                    await fetch(`/api/admin/articles/${ar.id}`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    loadAdminData();
                  }}
                  className="text-rose-500 hover:underline cursor-pointer"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-3">
            <h2 className="font-display text-xl font-bold">Website &amp; SEO Settings</h2>
            {Object.entries(settingsMap).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 text-xs">
                <span className="font-mono text-slate-500">{k}</span>
                <input
                  value={v}
                  onChange={(e) => setSettingsMap({ ...settingsMap, [k]: e.target.value })}
                  className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-transparent w-56"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={async () => {
                await fetch('/api/admin/settings', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ settings: settingsMap }),
                });
                setNotice('Website settings saved.');
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 cursor-pointer"
            >
              Save Settings
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-3">
            <h2 className="font-display text-xl font-bold">Advertisement Placements (Disabled by Default)</h2>
            {adsList.map((ad) => (
              <div key={ad.placement} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="capitalize font-semibold">{ad.placement} Banner</span>
                <button
                  type="button"
                  onClick={async () => {
                    await fetch('/api/admin/ads', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ placement: ad.placement, enabled: !ad.enabled, networkCode: ad.network_code, adSlotId: ad.ad_slot_id }),
                    });
                    loadAdminData();
                  }}
                  className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${ad.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}
                >
                  {ad.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminTab === 'logs' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 overflow-x-auto">
          <h2 className="font-display text-xl font-bold mb-3">Security &amp; Admin Audit Logs</h2>
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500">
                <th className="py-2 pr-3">Time</th><th className="py-2 pr-3">Action</th><th className="py-2 pr-3">Target</th><th className="py-2">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditLogs.map((l) => (
                <tr key={l.id}>
                  <td className="py-2 pr-3 text-slate-500">{l.created_at}</td>
                  <td className="py-2 pr-3 font-semibold">{l.action}</td>
                  <td className="py-2 pr-3">{l.target}</td>
                  <td className="py-2">{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
