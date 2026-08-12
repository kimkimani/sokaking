import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Clock, CheckCircle2, AlertTriangle, MessageSquare, ShieldCheck, 
  RefreshCw, Zap, Smartphone, Play, Database, Settings, ChevronRight, 
  Layers, Trophy, Flame, Code, X, Check, Globe, Edit3, Plus, Trash2, HelpCircle
} from 'lucide-react';
import { 
  fetchSmsSubscriptions, fetchSmsDispatchLogs, triggerSmsCronJob, sendTestSms,
  fetchSmsSettings, updateSmsSettings, fetchDeliverablesSummary,
  saveDeliverableItem, deleteDeliverableItem
} from '../lib/dataStore';

export default function SmsManagement() {
  const [activeTab, setActiveTab] = useState<'gateway' | 'deliverables' | 'subscriptions' | 'logs'>('gateway');
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [deliverables, setDeliverables] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Gateway Settings
  const [smsProvider, setSmsProvider] = useState<'africastalking' | 'textsms'>('textsms');
  const [atUsername, setAtUsername] = useState('sandbox');
  const [atApiKey, setAtApiKey] = useState('');
  const [atSenderId, setAtSenderId] = useState('SOKAKING');
  const [textSmsPartnerId, setTextSmsPartnerId] = useState('');
  const [textSmsApiKey, setTextSmsApiKey] = useState('');
  const [textSmsShortcode, setTextSmsShortcode] = useState('TEXTSMS');
  const [envStatus, setEnvStatus] = useState<any>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cron State
  const [cronRunning, setCronRunning] = useState(false);
  const [cronResult, setCronResult] = useState<any>(null);

  // Test SMS Form & Validation
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Deliverables CRUD State
  const [editingDeliverable, setEditingDeliverable] = useState<any | null>(null);
  const [savingDeliverable, setSavingDeliverable] = useState(false);
  const [deletingDeliverable, setDeletingDeliverable] = useState(false);
  const [deliverableMsg, setDeliverableMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deliverableTestPhone, setDeliverableTestPhone] = useState('');
  const [deliverableTestResult, setDeliverableTestResult] = useState<any | null>(null);
  const [sendingDeliverableTest, setSendingDeliverableTest] = useState(false);

  // Modal for Response Data
  const [selectedLogResponse, setSelectedLogResponse] = useState<any | null>(null);

  const validatePhone = (num: string) => {
    const cleaned = num.replace(/[^0-9]/g, '');
    let core = cleaned;
    if (core.startsWith('254')) core = core.slice(3);
    else if (core.startsWith('0')) core = core.slice(1);
    return /^(7|1)[0-9]{8}$/.test(core);
  };

  const getPhoneFormats = (num: string) => {
    const cleaned = num.replace(/[^0-9]/g, '');
    let core = cleaned;
    if (core.startsWith('254')) core = core.slice(3);
    else if (core.startsWith('0')) core = core.slice(1);

    if (!/^(7|1)[0-9]{8}$/.test(core)) return null;

    return {
      plus: `+254${core}`,
      c254: `254${core}`,
      local: `0${core}`
    };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [subsData, logsData, settingsData, delivData] = await Promise.all([
        fetchSmsSubscriptions(),
        fetchSmsDispatchLogs(),
        fetchSmsSettings(),
        fetchDeliverablesSummary()
      ]);

      setSubscriptions(Array.isArray(subsData) ? subsData : []);
      setLogs(Array.isArray(logsData) ? logsData : []);
      setDeliverables(delivData);

      if (settingsData) {
        setSmsProvider(settingsData.smsProvider === 'africastalking' ? 'africastalking' : 'textsms');
        setAtUsername(settingsData.atUsername || 'sandbox');
        setAtApiKey(settingsData.atApiKey || '');
        setAtSenderId(settingsData.atSenderId || 'SOKAKING');
        setTextSmsPartnerId(settingsData.textSmsPartnerId || '');
        setTextSmsApiKey(settingsData.textSmsApiKey || '');
        setTextSmsShortcode(settingsData.textSmsShortcode || 'TEXTSMS');
        if (settingsData.envStatus) {
          setEnvStatus(settingsData.envStatus);
        }
      }
    } catch (e) {
      console.error('Failed loading SMS management data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg(null);
    try {
      const res = await updateSmsSettings({
        smsProvider,
        atUsername,
        atApiKey,
        atSenderId,
        textSmsPartnerId,
        textSmsApiKey,
        textSmsShortcode
      });
      setSettingsMsg({
        type: 'success',
        text: `Active Gateway updated to ${smsProvider === 'textsms' ? 'TextSMS (textsms.co.ke)' : "Africa's Talking"}`
      });
      await loadData();
    } catch (err: any) {
      setSettingsMsg({ type: 'error', text: err?.message || 'Failed to save gateway settings' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleRunCron = async () => {
    setCronRunning(true);
    setCronResult(null);
    try {
      const res = await triggerSmsCronJob();
      setCronResult(res);
      await loadData();
    } catch (e: any) {
      setCronResult({ error: e?.message || 'Failed triggering SMS cron' });
    } finally {
      setCronRunning(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim()) return;

    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await sendTestSms(testPhone.trim(), testMessage.trim() || undefined);
      setTestResult(res);
      await loadData();
    } catch (e: any) {
      setTestResult({ error: e?.message || 'Failed to send test SMS' });
    } finally {
      setSendingTest(false);
    }
  };

  const handleOpenEditDeliverable = (item?: any, cat: 'vip' | 'odds_pack' | 'jackpot' = 'vip') => {
    setDeliverableMsg(null);
    setDeliverableTestResult(null);
    if (item) {
      const sampleStr = Array.isArray(item.samplePicks) 
        ? item.samplePicks.join('\n') 
        : (Array.isArray(item.samplePredictions) ? item.samplePredictions.join('\n') : (item.samplePicks || ''));

      setEditingDeliverable({
        id: item.id,
        category: item.category || cat,
        package_id: item.packageId || item.package_id || `${cat}_custom`,
        title: item.title || item.name || item.pack || 'Custom Deliverable',
        odds_or_prize: item.oddsOrPrize || item.cashPrize || item.targetOdds || '3.00 Odds',
        win_rate_or_category: item.winRateOrCategory || item.winProbability || item.category || '90% Win Rate',
        description: item.description || '',
        sms_template: item.smsTemplate || item.sms_template || `SOKA KING ${item.title || 'DELIVERABLE'}:\n1. Man City vs Liverpool -> 1\n2. Real Madrid vs Barca -> GG\nGood luck!`,
        sample_picks: sampleStr,
        status: item.status || 'ACTIVE'
      });
    } else {
      setEditingDeliverable({
        category: cat,
        package_id: `${cat}_${Date.now().toString().slice(-4)}`,
        title: cat === 'jackpot' ? 'New Jackpot Package' : (cat === 'odds_pack' ? '5+ Odds Custom Pack' : 'VIP Special Pass'),
        odds_or_prize: cat === 'jackpot' ? 'KES 50,000,000' : '5.50 Odds',
        win_rate_or_category: cat === 'jackpot' ? '15 Matches' : '88% Win Rate',
        description: 'Package description and inclusions.',
        sms_template: "SOKA KING TIPS:\n1. Match 1 vs Match 2 -> Tip\n2. Match 3 vs Match 4 -> Tip\nGood luck!",
        sample_picks: "1. Match 1 vs Match 2 (Tip)\n2. Match 3 vs Match 4 (Tip)",
        status: 'ACTIVE'
      });
    }
  };

  const handleSaveDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeliverable) return;

    setSavingDeliverable(true);
    setDeliverableMsg(null);
    try {
      const res = await saveDeliverableItem(editingDeliverable);
      if (res.success) {
        setDeliverableMsg({ type: 'success', text: 'Deliverable saved successfully to MySQL database!' });
        await loadData();
        setTimeout(() => setEditingDeliverable(null), 1200);
      } else {
        setDeliverableMsg({ type: 'error', text: res.error || 'Failed to save deliverable' });
      }
    } catch (err: any) {
      setDeliverableMsg({ type: 'error', text: err?.message || 'Error saving deliverable' });
    } finally {
      setSavingDeliverable(false);
    }
  };

  const handleDeleteDeliverable = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this deliverable from the database?')) return;
    setDeletingDeliverable(true);
    try {
      await deleteDeliverableItem(id);
      await loadData();
      setEditingDeliverable(null);
    } catch (err) {
      console.error('Error deleting deliverable:', err);
    } finally {
      setDeletingDeliverable(false);
    }
  };

  const handleSendDeliverableTestSms = async () => {
    if (!deliverableTestPhone.trim() || !editingDeliverable?.sms_template) return;
    setSendingDeliverableTest(true);
    setDeliverableTestResult(null);
    try {
      const res = await sendTestSms(deliverableTestPhone.trim(), editingDeliverable.sms_template);
      setDeliverableTestResult(res);
      await loadData();
    } catch (err: any) {
      setDeliverableTestResult({ error: err?.message || 'Failed to send test deliverable SMS' });
    } finally {
      setSendingDeliverableTest(false);
    }
  };

  const formats = getPhoneFormats(testPhone);

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-6 rounded-full bg-[var(--primary)] badge-glow block" />
            <h1 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
              Automated SMS Delivery & Gateway Manager
            </h1>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Primary Gateway: <strong className="text-[var(--primary)]">TextSMS.co.ke</strong> &amp; Africa's Talking with Dynamic Database Deliverables &amp; SMS Length Control
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-[var(--background)] hover:bg-slate-200 dark:hover:bg-slate-800 text-[var(--text)] rounded-md border border-[var(--border)] font-mono text-xs font-bold cursor-pointer transition-all self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[var(--primary)]' : ''}`} />
          Refresh Engine
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('gateway')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-md font-mono text-xs font-bold transition-all cursor-pointer border-b-2 ${
            activeTab === 'gateway'
              ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--card)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <Settings className="w-4 h-4" /> Gateway Provider & Switcher
        </button>
        <button
          onClick={() => setActiveTab('deliverables')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-md font-mono text-xs font-bold transition-all cursor-pointer border-b-2 ${
            activeTab === 'deliverables'
              ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--card)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" /> Deliverables Table (Jackpots, Odds, VIP)
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-md font-mono text-xs font-bold transition-all cursor-pointer border-b-2 ${
            activeTab === 'subscriptions'
              ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--card)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <Database className="w-4 h-4 text-sky-500" /> Active Subscriptions ({subscriptions.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-md font-mono text-xs font-bold transition-all cursor-pointer border-b-2 ${
            activeTab === 'logs'
              ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--card)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> Dispatched SMS Logs ({logs.length})
        </button>
      </div>

      {/* TAB 1: GATEWAY SETTINGS & SWITCHER */}
      {activeTab === 'gateway' && (
        <div className="space-y-6">
          {/* Live Provider Selector Card */}
          <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[var(--primary)]" />
                <h2 className="text-sm font-bold font-mono uppercase tracking-wider">SMS Gateway Selector</h2>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-extrabold uppercase border ${
                smsProvider === 'textsms'
                  ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              }`}>
                Active: {smsProvider === 'textsms' ? 'TextSMS (textsms.co.ke)' : "Africa's Talking"}
              </span>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Switch between <strong>Africa's Talking</strong> and <strong>TextSMS.co.ke</strong> instantly. All automated dispatches, instant M-Pesa trigger SMS, and daily 10:00 AM cron tasks will automatically route through your active gateway.
            </p>

            {/* Provider Cards Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div 
                onClick={() => setSmsProvider('africastalking')}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  smsProvider === 'africastalking'
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm'
                    : 'border-[var(--border)] bg-[var(--background)] opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-black uppercase text-[var(--text)] flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" /> Africa's Talking
                  </span>
                  {smsProvider === 'africastalking' && (
                    <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs">✓</span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-normal">
                  Standard East Africa SMS gateway. Uses <code className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1 rounded">+2547...</code> international format with Sandbox or Live API keys.
                </p>
              </div>

              <div 
                onClick={() => setSmsProvider('textsms')}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  smsProvider === 'textsms'
                    ? 'border-sky-500 bg-sky-500/5 shadow-sm'
                    : 'border-[var(--border)] bg-[var(--background)] opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-black uppercase text-[var(--text)] flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-sky-500" /> TextSMS.co.ke
                  </span>
                  {smsProvider === 'textsms' && (
                    <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs">✓</span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-normal">
                  Kenyan Bulk SMS provider (https://textsms.co.ke). Requires Partner ID, API key, and Sender ID / Shortcode. Uses <code className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1 rounded">2547...</code> format.
                </p>
              </div>
            </div>

            {/* Provider Configuration Forms */}
            <form onSubmit={handleSaveSettings} className="space-y-4 pt-3 border-t border-[var(--border)]">
              {smsProvider === 'africastalking' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] mb-1">
                      AT Username
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. sandbox or live_username"
                      value={atUsername}
                      onChange={(e) => setAtUsername(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded border border-[var(--border)] bg-[var(--background)] text-[var(--text)] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] mb-1">
                      AT API Key
                    </label>
                    <input
                      type="password"
                      placeholder="Africa's Talking API key"
                      value={atApiKey}
                      onChange={(e) => setAtApiKey(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded border border-[var(--border)] bg-[var(--background)] text-[var(--text)] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] mb-1">
                      Sender ID / Shortcode
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SOKAKING"
                      value={atSenderId}
                      onChange={(e) => setAtSenderId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded border border-[var(--border)] bg-[var(--background)] text-[var(--text)] font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] mb-1">
                      TextSMS Partner ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1234"
                      value={textSmsPartnerId}
                      onChange={(e) => setTextSmsPartnerId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded border border-[var(--border)] bg-[var(--background)] text-[var(--text)] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] mb-1">
                      TextSMS API Key
                    </label>
                    <input
                      type="password"
                      placeholder="TextSMS API key"
                      value={textSmsApiKey}
                      onChange={(e) => setTextSmsApiKey(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded border border-[var(--border)] bg-[var(--background)] text-[var(--text)] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] mb-1">
                      Shortcode / Sender Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TEXTSMS or SOKAKING"
                      value={textSmsShortcode}
                      onChange={(e) => setTextSmsShortcode(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded border border-[var(--border)] bg-[var(--background)] text-[var(--text)] font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-4 py-2 bg-[var(--primary)] hover:opacity-90 text-white font-mono font-bold text-xs rounded-md border-none cursor-pointer flex items-center gap-2"
                >
                  {savingSettings ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Settings className="w-3.5 h-3.5" />}
                  Save Gateway Settings
                </button>

                {settingsMsg && (
                  <span className={`text-xs font-mono font-bold ${settingsMsg.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {settingsMsg.text}
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Controls: Trigger Cron & Send Test SMS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 10:00 AM Cron Trigger Box */}
            <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-4">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-[var(--primary)]" />
                <h2 className="text-sm font-bold font-mono uppercase tracking-wider">Manual 10:00 AM Dispatch Trigger</h2>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Trigger the daily 10:00 AM EAT automated dispatch task across all active subscribers in <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">user_subscriptions</code> using the active <strong>{smsProvider === 'textsms' ? 'TextSMS.co.ke' : "Africa's Talking"}</strong> gateway.
              </p>

              <button
                onClick={handleRunCron}
                disabled={cronRunning}
                className="w-full py-2.5 px-4 bg-[var(--primary)] hover:opacity-90 text-white rounded-[var(--radius)] font-mono font-extrabold text-xs flex items-center justify-center gap-2 border-none cursor-pointer transition-all shadow-sm"
              >
                {cronRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing 10:00 AM Dispatch...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    Execute 10:00 AM SMS Dispatch Cron
                  </>
                )}
              </button>

              {cronResult && (
                <div className={`p-3 rounded text-xs font-mono border ${cronResult.error ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
                  {cronResult.error ? (
                    <div>❌ {cronResult.error}</div>
                  ) : (
                    <div className="space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {cronResult.message}
                      </div>
                      <div>Processed Subscribers: <strong>{cronResult.subscribersProcessed}</strong></div>
                      <div>Sent Count: <strong>{cronResult.sentCount}</strong> | Failed: <strong>{cronResult.failCount}</strong></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Send Test SMS Form & Live Phone Validation */}
            <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-[var(--primary)]" />
                  <h2 className="text-sm font-bold font-mono uppercase tracking-wider">Test SMS Dispatch & Verification</h2>
                </div>
                {testPhone && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    validatePhone(testPhone) ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                  }`}>
                    {validatePhone(testPhone) ? 'Valid Kenyan Line' : 'Invalid Phone Format'}
                  </span>
                )}
              </div>

              <form onSubmit={handleSendTest} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] mb-1">
                    Kenyan Mobile Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 0740841375 or 254712345678"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded border border-[var(--border)] bg-[var(--background)] text-[var(--text)] font-mono focus:outline-none focus:border-[var(--primary)]"
                  />
                  {formats && (
                    <div className="mt-1.5 p-2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-[var(--text-muted)] space-y-0.5">
                      <div className="font-bold text-[var(--text)]">Phone Format Output:</div>
                      <div>Africa's Talking format: <code className="font-extrabold text-[var(--primary)]">{formats.plus}</code></div>
                      <div>TextSMS.co.ke format: <code className="font-extrabold text-sky-500">{formats.c254}</code></div>
                      <div>Local SMS format: <code>{formats.local}</code></div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] mb-1">
                    Custom Message
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Leave blank to send auto-assembled VIP + Jackpot picks..."
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-[var(--border)] bg-[var(--background)] text-[var(--text)] font-mono focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingTest || !testPhone.trim()}
                  className="w-full py-2.5 px-4 bg-slate-900 dark:bg-slate-100 hover:opacity-90 text-white dark:text-slate-900 rounded-[var(--radius)] font-mono font-extrabold text-xs flex items-center justify-center gap-2 border-none cursor-pointer transition-all disabled:opacity-50"
                >
                  {sendingTest ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Dispatching via {smsProvider === 'textsms' ? 'TextSMS.co.ke' : "Africa's Talking"}...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Dispatch Test SMS via {smsProvider === 'textsms' ? 'TextSMS' : 'AT Gateway'}
                    </>
                  )}
                </button>
              </form>

              {testResult && (
                <div className={`p-3 rounded text-xs font-mono border ${testResult.error ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
                  {testResult.error ? (
                    <div>❌ {testResult.error}</div>
                  ) : (
                    <div className="space-y-1">
                      <div className="font-bold flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Dispatched to {testResult.phoneNumber} ({testResult.provider || smsProvider})
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] bg-slate-100 dark:bg-slate-800 p-2 rounded whitespace-pre-wrap mt-1">
                        {testResult.message}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DELIVERABLES MANAGEMENT & SMS TEMPLATES */}
      {activeTab === 'deliverables' && (
        <div className="space-y-6">
          <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
              <div>
                <h2 className="text-sm font-bold font-mono uppercase tracking-wider flex items-center gap-2 text-[var(--text)]">
                  <Trophy className="w-4 h-4 text-amber-500" /> Database-Backed Deliverables &amp; SMS Template Control
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Manage VIP passes, Odds Packs, and Jackpots in MySQL. Control SMS text formatting &amp; message length.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditDeliverable(null, 'vip')}
                  className="px-3 py-1.5 bg-[var(--primary)] hover:opacity-90 text-slate-950 font-mono text-xs font-bold rounded-md flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Deliverable
                </button>
              </div>
            </div>

            {/* 1. VIP Banker Tips Deliverables */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-extrabold uppercase text-[var(--primary)] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> 1. VIP Package Deliverables
                </h3>
                <button
                  onClick={() => handleOpenEditDeliverable(null, 'vip')}
                  className="text-[11px] font-mono text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add VIP Pass
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border border-[var(--border)] rounded-md">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-[var(--border)] text-[10px] uppercase font-bold text-[var(--text-muted)]">
                    <tr>
                      <th className="py-2.5 px-3">Title / Package</th>
                      <th className="py-2.5 px-3">Target Odds / Win Rate</th>
                      <th className="py-2.5 px-3">SMS Template Preview</th>
                      <th className="py-2.5 px-3">SMS Length</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {deliverables?.vip?.map((v: any, i: number) => {
                      const tpl = v.smsTemplate || v.sms_template || '';
                      const charCount = tpl.length;
                      const units = Math.ceil(charCount / 160) || 1;
                      return (
                        <tr key={v.id || i} className="hover:bg-slate-500/5 transition-all">
                          <td className="py-3 px-3">
                            <div className="font-bold text-[var(--text)]">{v.title || v.name || v.match}</div>
                            <div className="text-[10px] text-[var(--text-muted)]">{v.packageId || v.league}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-[var(--primary)]">{v.oddsOrPrize || v.odds}</span>
                            <div className="text-[10px] text-emerald-600 font-bold">{v.winRateOrCategory || v.confidence}</div>
                          </td>
                          <td className="py-3 px-3 max-w-xs">
                            <div className="text-[10px] text-[var(--text-muted)] bg-slate-100 dark:bg-slate-800 p-1.5 rounded truncate font-mono">
                              {tpl || 'Default Auto-Assembly'}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${units === 1 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'}`}>
                              {charCount} chars ({units} SMS)
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleOpenEditDeliverable(v, 'vip')}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[var(--text)] rounded font-mono text-[11px] font-bold border border-[var(--border)] cursor-pointer inline-flex items-center gap-1 transition-all"
                            >
                              <Edit3 className="w-3 h-3 text-[var(--primary)]" /> Edit SMS &amp; Tips
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Odds Packs Deliverables */}
            <div className="space-y-2 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-extrabold uppercase text-[var(--primary)] flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-sky-500" /> 2. Odds Packs Deliverables
                </h3>
                <button
                  onClick={() => handleOpenEditDeliverable(null, 'odds_pack')}
                  className="text-[11px] font-mono text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Odds Pack
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border border-[var(--border)] rounded-md">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-[var(--border)] text-[10px] uppercase font-bold text-[var(--text-muted)]">
                    <tr>
                      <th className="py-2.5 px-3">Pack Name</th>
                      <th className="py-2.5 px-3">Target Odds</th>
                      <th className="py-2.5 px-3">Win Probability</th>
                      <th className="py-2.5 px-3">SMS Template Preview</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {deliverables?.oddsPacks?.map((o: any, i: number) => {
                      const tpl = o.smsTemplate || o.sms_template || '';
                      const charCount = tpl.length;
                      const units = Math.ceil(charCount / 160) || 1;
                      return (
                        <tr key={o.id || i} className="hover:bg-slate-500/5 transition-all">
                          <td className="py-3 px-3 font-bold text-[var(--text)]">{o.title || o.pack}</td>
                          <td className="py-3 px-3 font-extrabold text-[var(--primary)]">{o.oddsOrPrize || o.targetOdds}</td>
                          <td className="py-3 px-3 text-emerald-600 font-bold">{o.winRateOrCategory || o.winProbability}</td>
                          <td className="py-3 px-3 max-w-xs">
                            <div className="text-[10px] text-[var(--text-muted)] bg-slate-100 dark:bg-slate-800 p-1.5 rounded truncate font-mono">
                              {tpl || 'Default Auto-Assembly'}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleOpenEditDeliverable(o, 'odds_pack')}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[var(--text)] rounded font-mono text-[11px] font-bold border border-[var(--border)] cursor-pointer inline-flex items-center gap-1 transition-all"
                            >
                              <Edit3 className="w-3 h-3 text-[var(--primary)]" /> Edit SMS &amp; Tips
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Jackpot Predictions Deliverables */}
            <div className="space-y-2 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-extrabold uppercase text-[var(--primary)] flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500" /> 3. Jackpot Predictions Deliverables
                </h3>
                <button
                  onClick={() => handleOpenEditDeliverable(null, 'jackpot')}
                  className="text-[11px] font-mono text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Jackpot Deliverable
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border border-[var(--border)] rounded-md">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-[var(--border)] text-[10px] uppercase font-bold text-[var(--text-muted)]">
                    <tr>
                      <th className="py-2.5 px-3">Jackpot Name</th>
                      <th className="py-2.5 px-3">Cash Prize</th>
                      <th className="py-2.5 px-3">SMS Template / Sample Predictions</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {deliverables?.jackpots?.map((j: any, i: number) => {
                      const tpl = j.smsTemplate || j.sms_template || '';
                      return (
                        <tr key={j.id || i} className="hover:bg-slate-500/5 transition-all">
                          <td className="py-3 px-3 font-bold text-[var(--text)]">{j.title || j.name}</td>
                          <td className="py-3 px-3 font-bold text-emerald-600">{j.oddsOrPrize || j.cashPrize}</td>
                          <td className="py-3 px-3 max-w-md">
                            <div className="text-[10px] text-[var(--text-muted)] bg-slate-100 dark:bg-slate-800 p-1.5 rounded truncate font-mono">
                              {tpl || (j.samplePredictions?.join(' | ') ?? 'Auto-assembled')}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleOpenEditDeliverable(j, 'jackpot')}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[var(--text)] rounded font-mono text-[11px] font-bold border border-[var(--border)] cursor-pointer inline-flex items-center gap-1 transition-all"
                            >
                              <Edit3 className="w-3 h-3 text-[var(--primary)]" /> Edit SMS &amp; Tips
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELIVERABLE EDITOR MODAL */}
      <AnimatePresence>
        {editingDeliverable && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] w-full max-w-2xl p-6 shadow-xl space-y-4 font-mono my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[var(--primary)]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text)]">
                    {editingDeliverable.id ? 'Edit Package Deliverable & SMS Template' : 'Add New Deliverable to Database'}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingDeliverable(null)}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-[var(--text-muted)] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDeliverable} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Category</label>
                    <select
                      value={editingDeliverable.category}
                      onChange={(e) => setEditingDeliverable({ ...editingDeliverable, category: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--text)] font-mono"
                    >
                      <option value="vip">VIP Package</option>
                      <option value="odds_pack">Odds Pack</option>
                      <option value="jackpot">Jackpot Predictions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Package ID</label>
                    <input
                      type="text"
                      value={editingDeliverable.package_id}
                      onChange={(e) => setEditingDeliverable({ ...editingDeliverable, package_id: e.target.value })}
                      placeholder="e.g. vip_daily, 2_odds, sportpesa_mega"
                      required
                      className="w-full px-3 py-2 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--text)] font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Title / Deliverable Name</label>
                    <input
                      type="text"
                      value={editingDeliverable.title}
                      onChange={(e) => setEditingDeliverable({ ...editingDeliverable, title: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--text)] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Odds or Prize</label>
                    <input
                      type="text"
                      value={editingDeliverable.odds_or_prize}
                      onChange={(e) => setEditingDeliverable({ ...editingDeliverable, odds_or_prize: e.target.value })}
                      placeholder="e.g. 3.50 Odds or KES 385M"
                      className="w-full px-3 py-2 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--text)] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Win Rate or Category Details</label>
                  <input
                    type="text"
                    value={editingDeliverable.win_rate_or_category}
                    onChange={(e) => setEditingDeliverable({ ...editingDeliverable, win_rate_or_category: e.target.value })}
                    placeholder="e.g. 95% Win Rate or 17 Matches"
                    className="w-full px-3 py-2 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--text)] font-mono"
                  />
                </div>

                {/* SMS TEMPLATE WITH LENGTH ANALYZER */}
                <div className="p-4 rounded border border-[var(--primary)]/30 bg-[var(--primary)]/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold uppercase text-[var(--primary)] flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" /> Custom SMS Template (Dispatched to Users)
                    </label>

                    {(() => {
                      const len = (editingDeliverable.sms_template || '').length;
                      const units = Math.ceil(len / 160) || 1;
                      return (
                        <div className="flex items-center gap-2 text-[10px] font-bold">
                          <span className={`px-2 py-0.5 rounded ${units === 1 ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-500/20 text-amber-600'}`}>
                            {len} / 160 Chars
                          </span>
                          <span className={`px-2 py-0.5 rounded ${units === 1 ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-500/20 text-amber-600'}`}>
                            {units} SMS {units > 1 ? 'Units (Cost 2x)' : 'Unit (Standard)'}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  <textarea
                    rows={4}
                    value={editingDeliverable.sms_template}
                    onChange={(e) => setEditingDeliverable({ ...editingDeliverable, sms_template: e.target.value })}
                    placeholder="Enter the exact SMS text sent to subscriber phones upon payment or automated daily dispatch..."
                    required
                    className="w-full px-3 py-2 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--text)] font-mono text-xs focus:outline-none focus:border-[var(--primary)]"
                  />

                  {/* 1-Click Test Send inside Modal */}
                  <div className="pt-2 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="text"
                        placeholder="Test phone (e.g. 0740841375)"
                        value={deliverableTestPhone}
                        onChange={(e) => setDeliverableTestPhone(e.target.value)}
                        className="px-2.5 py-1.5 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--text)] text-xs font-mono w-full sm:w-48"
                      />
                      <button
                        type="button"
                        onClick={handleSendDeliverableTestSms}
                        disabled={sendingDeliverableTest || !deliverableTestPhone.trim()}
                        className="px-3 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded font-bold text-xs flex items-center gap-1 hover:opacity-90 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                      >
                        {sendingDeliverableTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        Send Test SMS
                      </button>
                    </div>

                    <span className="text-[10px] text-[var(--text-muted)]">
                      Instant gateway test verification
                    </span>
                  </div>

                  {deliverableTestResult && (
                    <div className={`mt-2 p-2 rounded text-[11px] font-mono border ${deliverableTestResult.error ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
                      {deliverableTestResult.error ? `❌ ${deliverableTestResult.error}` : `✅ SMS dispatched to ${deliverableTestResult.phoneNumber} (${deliverableTestResult.provider || 'textsms'})`}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Sample Picks (Web Display)</label>
                  <textarea
                    rows={3}
                    value={editingDeliverable.sample_picks}
                    onChange={(e) => setEditingDeliverable({ ...editingDeliverable, sample_picks: e.target.value })}
                    placeholder="Enter 1 match pick per line..."
                    className="w-full px-3 py-2 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--text)] font-mono text-xs"
                  />
                </div>

                {deliverableMsg && (
                  <div className={`p-3 rounded text-xs border ${deliverableMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'}`}>
                    {deliverableMsg.text}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                  {editingDeliverable.id ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteDeliverable(editingDeliverable.id)}
                      disabled={deletingDeliverable}
                      className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/30 rounded font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  ) : <div />}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingDeliverable(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[var(--text)] rounded font-bold text-xs cursor-pointer transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingDeliverable}
                      className="px-5 py-2 bg-[var(--primary)] hover:opacity-90 text-slate-950 font-bold text-xs rounded shadow-md flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {savingDeliverable ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Save to Database
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TAB 3: ACTIVE SUBSCRIPTIONS */}
      {activeTab === 'subscriptions' && (
        <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[var(--primary)]" />
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider">
                Active VIP Subscriptions <span className="text-[10px] font-normal text-[var(--text-muted)]">(user_subscriptions)</span>
              </h2>
            </div>
            <span className="text-xs font-mono font-extrabold text-[var(--primary)] px-2 py-0.5 rounded bg-[var(--primary)] bg-opacity-10">
              {subscriptions.length} Subscribers
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs font-mono text-[var(--text-muted)] flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[var(--primary)]" /> Loading subscriptions...
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[var(--text-muted)]">
              No active subscriptions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[10px] uppercase font-bold text-[var(--text-muted)]">
                    <th className="py-2.5 px-3">Phone Number</th>
                    <th className="py-2.5 px-3">Package</th>
                    <th className="py-2.5 px-3">Start Time</th>
                    <th className="py-2.5 px-3">End Time</th>
                    <th className="py-2.5 px-3">Last SMS Sent</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {subscriptions.map((sub: any) => {
                    const isActive = sub.status === 'active' && new Date(sub.end_time) > new Date();
                    return (
                      <tr key={sub.id} className="hover:bg-slate-500/5 transition-all">
                        <td className="py-3 px-3 font-bold text-[var(--text)]">{sub.phone_number}</td>
                        <td className="py-3 px-3 font-bold text-[var(--primary)]">{sub.package_id}</td>
                        <td className="py-3 px-3 text-[var(--text-muted)] text-[11px]">
                          {sub.start_time ? new Date(sub.start_time).toLocaleString() : '-'}
                        </td>
                        <td className="py-3 px-3 text-[var(--text-muted)] text-[11px]">
                          {sub.end_time ? new Date(sub.end_time).toLocaleString() : '-'}
                        </td>
                        <td className="py-3 px-3 text-[var(--text-muted)] text-[11px]">
                          {sub.last_sms_sent_at ? new Date(sub.last_sms_sent_at).toLocaleString() : 'Pending'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isActive
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {isActive ? 'Active' : 'Expired'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ENHANCED DISPATCH LOGS */}
      {activeTab === 'logs' && (
        <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider">
                SMS Dispatch Audit Trail & Response Logs
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
              {logs.length} dispatches logged
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs font-mono text-[var(--text-muted)] flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[var(--primary)]" /> Loading SMS logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[var(--text-muted)]">
              No SMS dispatch logs recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[10px] uppercase font-bold text-[var(--text-muted)]">
                    <th className="py-2.5 px-3">Sent Time</th>
                    <th className="py-2.5 px-3">Recipient</th>
                    <th className="py-2.5 px-3">Package / Category</th>
                    <th className="py-2.5 px-3">SMS Gateway</th>
                    <th className="py-2.5 px-3">Message Snippet</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">API Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-500/5 transition-all">
                      <td className="py-3 px-3 text-[var(--text-muted)] text-[11px] whitespace-nowrap">
                        {log.sent_at ? new Date(log.sent_at).toLocaleString() : '-'}
                      </td>
                      <td className="py-3 px-3 font-bold text-[var(--text)] whitespace-nowrap">{log.phone_number}</td>
                      <td className="py-3 px-3 font-bold text-[var(--primary)] whitespace-nowrap">
                        {log.package_name || log.package_type || 'VIP Pass'}
                      </td>
                      <td className="py-3 px-3 uppercase text-[10px] font-bold text-slate-500 whitespace-nowrap">
                        {log.provider || 'africastalking'}
                      </td>
                      <td className="py-3 px-3 text-[var(--text-muted)] text-[11px] max-w-xs truncate">
                        {log.message_body}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.status === 'sent'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLogResponse(log)}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[var(--text)] rounded text-[10px] font-mono cursor-pointer border border-[var(--border)]"
                        >
                          View Response
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal for Raw API Response Data */}
      <AnimatePresence>
        {selectedLogResponse && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-6 max-w-xl w-full space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <h3 className="font-mono font-bold text-sm flex items-center gap-2">
                  <Code className="w-4 h-4 text-[var(--primary)]" />
                  Gateway Response Log #{selectedLogResponse.id}
                </h3>
                <button
                  onClick={() => setSelectedLogResponse(null)}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text)] rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div>Recipient: <strong>{selectedLogResponse.phone_number}</strong></div>
                <div>Provider: <strong className="uppercase">{selectedLogResponse.provider || 'africastalking'}</strong></div>
                <div>Package: <strong>{selectedLogResponse.package_name || selectedLogResponse.package_type}</strong></div>
                <div>Status: <strong className="uppercase text-emerald-500">{selectedLogResponse.status}</strong></div>
                
                <div className="pt-2">
                  <div className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Full API Response JSON</div>
                  <pre className="p-3 bg-slate-900 text-emerald-400 rounded text-[11px] overflow-x-auto max-h-60 leading-relaxed font-mono">
                    {selectedLogResponse.response_data || JSON.stringify(selectedLogResponse, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedLogResponse(null)}
                  className="px-4 py-2 bg-[var(--background)] hover:bg-slate-200 dark:hover:bg-slate-800 text-[var(--text)] font-mono text-xs font-bold rounded border border-[var(--border)] cursor-pointer"
                >
                  Close Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
