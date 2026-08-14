import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, MessageSquare, Database, ShieldCheck, Trophy, 
  RefreshCw, Send, Zap, Phone, CreditCard, Layers, Flame, 
  Globe, Code, CheckCircle2, AlertTriangle, Play, HelpCircle, Save, Check
} from 'lucide-react';
import { 
  fetchSmsSubscriptions, fetchSmsDispatchLogs, triggerSmsCronJob, sendTestSms,
  fetchSmsSettings, updateSmsSettings, fetchDeliverablesSummary,
  fetchSiteSettings, updateSiteSettings, claimMpesaReceiptCode
} from '../lib/dataStore';
import SmsManagement from './SmsManagement';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'sms' | 'mpesa' | 'predictions' | 'settings'>('sms');

  // Site settings state
  const [siteSettings, setSiteSettings] = useState<any>({
    siteName: 'SOKA KING',
    email: 'support@sokaking.com',
    phone: '+254740841375',
    whatsapp: '+254740841375',
    telegram: 'https://t.me/sokapredictions',
    facebook: 'https://facebook.com/sokaking',
    twitter: 'https://x.com/sokaking',
    instagram: 'https://instagram.com/sokaking',
    paybillNumber: '247247',
    paybillAccountName: 'SOKAKING VIP',
    tillNumber: '889900'
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState<string | null>(null);

  // M-Pesa claim simulator
  const [claimReceiptCode, setClaimReceiptCode] = useState('');
  const [claimPhone, setClaimPhone] = useState('');
  const [claimPkgName, setClaimPkgName] = useState('VIP Weekly Pass');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimResult, setClaimResult] = useState<any>(null);

  useEffect(() => {
    fetchSiteSettings().then((data) => {
      if (data) setSiteSettings((prev: any) => ({ ...prev, ...data }));
    });
  }, []);

  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsStatus(null);
    try {
      const res = await updateSiteSettings(siteSettings);
      setSettingsStatus(res.success ? '✅ Site settings updated successfully!' : '❌ Failed to save settings');
    } catch (e: any) {
      setSettingsStatus(`❌ Error: ${e?.message || 'Update failed'}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleClaimCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimReceiptCode.trim() || !claimPhone.trim()) return;

    setClaimLoading(true);
    setClaimResult(null);
    try {
      const res = await claimMpesaReceiptCode(
        claimReceiptCode.trim(),
        claimPhone.trim(),
        'VIP_PASS',
        'vip',
        claimPkgName
      );
      setClaimResult(res);
    } catch (err: any) {
      setClaimResult({ error: err?.message || 'Failed claiming code' });
    } finally {
      setClaimLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-4 text-left">
      {/* Top Admin Banner */}
      <div className="p-6 rounded-[var(--radius)] bg-slate-900 text-white border border-slate-800 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)] opacity-10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded bg-[var(--primary)] text-white text-[10px] font-mono font-black uppercase tracking-wider">
                System Administration
              </span>
              <span className="text-xs text-slate-400 font-mono">v3.5 High-Speed Engine</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              SOKA KING Master Control Center
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Configure SMS Gateway providers (TextSMS & Africa's Talking), manage prediction deliverables, audit M-Pesa claims, and update site configurations.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <a
              href="/"
              className="px-3.5 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" /> View Public Site
            </a>
          </div>
        </div>
      </div>

      {/* Main Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sms')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-mono text-xs font-bold transition-all cursor-pointer border-b-2 ${
            activeTab === 'sms'
              ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--card)] shadow-xs'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-[var(--primary)]" />
          SMS Gateway & Switcher
        </button>

        <button
          onClick={() => setActiveTab('mpesa')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-mono text-xs font-bold transition-all cursor-pointer border-b-2 ${
            activeTab === 'mpesa'
              ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--card)] shadow-xs'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-500" />
          M-Pesa Receipts & Claims
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-mono text-xs font-bold transition-all cursor-pointer border-b-2 ${
            activeTab === 'settings'
              ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--card)] shadow-xs'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <Settings className="w-4 h-4 text-sky-500" />
          Site Settings & Paybill Config
        </button>
      </div>

      {/* TAB 1: SMS MANAGEMENT COMPONENT */}
      {activeTab === 'sms' && (
        <SmsManagement />
      )}

      {/* TAB 2: M-PESA CLAIMS & AUDIT */}
      {activeTab === 'mpesa' && (
        <div className="space-y-6">
          <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold font-mono uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-500" /> Manual M-Pesa Receipt Code Verification & SMS Dispatch
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Verify guest M-Pesa SMS transaction codes (e.g. <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">QK78XX992</code>) to immediately unlock prediction content and dispatch SMS picks.
                </p>
              </div>
            </div>

            <form onSubmit={handleClaimCode} className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] mb-1">
                  M-Pesa Code (10 Chars)
                </label>
                <input
                  type="text"
                  placeholder="e.g. SH91XX4021"
                  value={claimReceiptCode}
                  onChange={(e) => setClaimReceiptCode(e.target.value.toUpperCase())}
                  required
                  className="w-full px-3 py-2 text-xs rounded border border-[var(--border)] bg-[var(--background)] font-mono text-[var(--text)] uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] mb-1">
                  Recipient Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0740841375"
                  value={claimPhone}
                  onChange={(e) => setClaimPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded border border-[var(--border)] bg-[var(--background)] font-mono text-[var(--text)]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] mb-1">
                  Package Category
                </label>
                <select
                  value={claimPkgName}
                  onChange={(e) => setClaimPkgName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-[var(--border)] bg-[var(--background)] font-mono text-[var(--text)]"
                >
                  <option value="VIP Weekly Pass">VIP Weekly Pass (KES 500)</option>
                  <option value="SportPesa Mega Jackpot Picks">SportPesa Mega Jackpot (KES 100)</option>
                  <option value="Betika Grand Jackpot Picks">Betika Grand Jackpot (KES 100)</option>
                  <option value="5+ High Odds Multi-Bet Pack">5+ High Odds Multi-Bet (KES 250)</option>
                </select>
              </div>

              <div className="md:col-span-3 pt-2">
                <button
                  type="submit"
                  disabled={claimLoading || !claimReceiptCode.trim() || !claimPhone.trim()}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs rounded-md border-none cursor-pointer flex items-center gap-2"
                >
                  {claimLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Verify Code & Dispatch Package SMS
                </button>
              </div>
            </form>

            {claimResult && (
              <div className={`p-4 rounded border text-xs font-mono mt-3 ${
                claimResult.error ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              }`}>
                {claimResult.error ? (
                  <div>❌ {claimResult.error}</div>
                ) : (
                  <div className="space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {claimResult.message}
                    </div>
                    <div>Receipt: <strong>{claimResult.receiptCode}</strong> | Phone: <strong>{claimResult.phoneNumber}</strong></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SITE SETTINGS & PAYBILL CONFIG */}
      {activeTab === 'settings' && (
        <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4 text-sky-500" /> Public Site Settings & Safaricom Credentials
            </h2>
            {settingsStatus && (
              <span className="text-xs font-mono font-bold">{settingsStatus}</span>
            )}
          </div>

          <form onSubmit={handleSaveSiteSettings} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] mb-1">
                  Site Brand Name
                </label>
                <input
                  type="text"
                  value={siteSettings.siteName || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-[var(--border)] bg-[var(--background)] font-mono text-[var(--text)]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={siteSettings.email || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-[var(--border)] bg-[var(--background)] font-mono text-[var(--text)]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={siteSettings.phone || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-[var(--border)] bg-[var(--background)] font-mono text-[var(--text)]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] mb-1">
                  WhatsApp Support Line
                </label>
                <input
                  type="text"
                  value={siteSettings.whatsapp || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-[var(--border)] bg-[var(--background)] font-mono text-[var(--text)]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] mb-1">
                  M-Pesa Paybill Number
                </label>
                <input
                  type="text"
                  value={siteSettings.paybillNumber || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, paybillNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-[var(--border)] bg-[var(--background)] font-mono text-[var(--text)]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] mb-1">
                  M-Pesa Account Name / Instruction
                </label>
                <input
                  type="text"
                  value={siteSettings.paybillAccountName || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, paybillAccountName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-[var(--border)] bg-[var(--background)] font-mono text-[var(--text)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="px-5 py-2.5 bg-[var(--primary)] hover:opacity-90 text-white font-mono font-bold text-xs rounded-md border-none cursor-pointer flex items-center gap-2"
            >
              {savingSettings ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Configuration Settings
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
