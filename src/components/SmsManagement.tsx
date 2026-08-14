import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Clock, CheckCircle2, AlertTriangle, MessageSquare, ShieldCheck, RefreshCw, Zap, Smartphone, Play, Database } from 'lucide-react';
import { fetchSmsSubscriptions, fetchSmsDispatchLogs, triggerSmsCronJob, sendTestSms } from '../lib/dataStore';

export default function SmsManagement() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cronRunning, setCronRunning] = useState(false);
  const [cronResult, setCronResult] = useState<any>(null);

  // Test SMS Form
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subsData, logsData] = await Promise.all([
        fetchSmsSubscriptions(),
        fetchSmsDispatchLogs(),
      ]);
      setSubscriptions(Array.isArray(subsData) ? subsData : []);
      setLogs(Array.isArray(logsData) ? logsData : []);
    } catch (e) {
      console.error('Failed loading SMS management data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-6 rounded-full bg-[var(--primary)] badge-glow block" />
            <h1 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
              Automated SMS Delivery & VIP Dispatch Engine
            </h1>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            East Africa's Talking Gateway integration for VIP Tips & Jackpot predictions (+254 East Africa standard)
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-[var(--background)] hover:bg-slate-200 dark:hover:bg-slate-800 text-[var(--text)] rounded-md border border-[var(--border)] font-mono text-xs font-bold cursor-pointer transition-all self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[var(--primary)]' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Gateway & Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Africa's Talking Gateway Status */}
        <div className="p-4 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-black text-[var(--text-muted)] flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Gateway Provider
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Africa's Talking
            </span>
          </div>
          <div className="font-mono text-xs font-extrabold text-[var(--text)]">Sender ID: SOKAKING</div>
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            API Endpoint: <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">/version1/messaging</code>. Formats phone numbers to international <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">+2547...</code> standard.
          </p>
        </div>

        {/* Daily 10:00 AM Cron Schedule */}
        <div className="p-4 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-black text-[var(--text-muted)] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-500" /> Cron Schedule
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-sky-500/10 text-sky-600 border border-sky-500/20">
              10:00 AM EAT Daily
            </span>
          </div>
          <div className="font-mono text-xs font-extrabold text-[var(--text)]">07:00 UTC Scheduled Dispatch</div>
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            Automated daily query of active subscribers, assembling VIP banker predictions & active non-locked Jackpot picks.
          </p>
        </div>

        {/* First-Time STK Instant Trigger */}
        <div className="p-4 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-black text-[var(--text-muted)] flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-emerald-500" /> M-Pesa STK Trigger
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-purple-500/10 text-purple-600 border border-purple-500/20">
              Instant Callback
            </span>
          </div>
          <div className="font-mono text-xs font-extrabold text-[var(--text)]">ResultCode: 0 Auto-Activate</div>
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            Upon successful M-Pesa STK payment, subscription activates immediately and sends the first VIP tips pass via SMS.
          </p>
        </div>
      </div>

      {/* Action Controls: Trigger Cron & Send Test SMS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 10:00 AM Cron Trigger Box */}
        <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-4">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-[var(--primary)]" />
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider">Manual 10:00 AM Dispatch Trigger</h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Simulate or execute the daily 10:00 AM EAT automated dispatch task immediately across all active subscribers in <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">user_subscriptions</code> table.
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
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded text-xs font-mono border ${cronResult.error ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}
            >
              {cronResult.error ? (
                <div>❌ {cronResult.error}</div>
              ) : (
                <div className="space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {cronResult.message}
                  </div>
                  <div>Processed Subscribers: <strong>{cronResult.subscribersProcessed}</strong></div>
                  <div>Sent Count: <strong>{cronResult.sentCount}</strong> | Failed: <strong>{cronResult.failCount}</strong></div>
                  {cronResult.expiredNotified !== undefined && (
                    <div>Expired Reminders Sent: <strong>{cronResult.expiredNotified}</strong></div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Send Test SMS Form */}
        <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-4">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-[var(--primary)]" />
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider">Test SMS Gateway Dispatch</h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Send a test SMS to any Kenyan phone line to test Africa's Talking API connection and message formatting.
          </p>

          <form onSubmit={handleSendTest} className="space-y-3">
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] mb-1">
                Kenyan Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g. 0740841375 or 254712345678"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded border border-[var(--border)] bg-[var(--background)] text-[var(--text)] font-mono focus:outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] mb-1">
                Custom Message (Optional)
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
                  Sending SMS...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Dispatch Test SMS
                </>
              )}
            </button>
          </form>

          {testResult && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded text-xs font-mono border ${testResult.error ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}
            >
              {testResult.error ? (
                <div>❌ {testResult.error}</div>
              ) : (
                <div className="space-y-1">
                  <div className="font-bold flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> SMS Dispatched to {testResult.phoneNumber}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] bg-slate-100 dark:bg-slate-800 p-2 rounded whitespace-pre-wrap mt-1">
                    {testResult.message}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Active Subscriptions Table (`user_subscriptions`) */}
      <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[var(--primary)]" />
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider">
              Active VIP Subscriptions <span className="text-[10px] font-normal text-[var(--text-muted)]">(user_subscriptions)</span>
            </h2>
          </div>
          <span className="text-xs font-mono font-extrabold text-[var(--primary)] px-2 py-0.5 rounded bg-[var(--primary)] bg-opacity-10">
            {subscriptions.length} Registered
          </span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs font-mono text-[var(--text-muted)] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[var(--primary)]" /> Loading subscriptions...
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-[var(--text-muted)]">
            No active subscriptions found. Subscriptions will appear automatically when users make M-Pesa payments.
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

      {/* SMS Dispatch Logs Table (`sms_dispatch_logs`) */}
      <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider">
              SMS Dispatch Audit Logs <span className="text-[10px] font-normal text-[var(--text-muted)]">(sms_dispatch_logs)</span>
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
            Last {logs.length} dispatches
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
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Recipient</th>
                  <th className="py-2.5 px-3">Message Snippet</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-500/5 transition-all">
                    <td className="py-3 px-3 text-[var(--text-muted)] text-[11px] whitespace-nowrap">
                      {log.sent_at ? new Date(log.sent_at).toLocaleString() : '-'}
                    </td>
                    <td className="py-3 px-3 font-bold text-[var(--text)] whitespace-nowrap">{log.phone_number}</td>
                    <td className="py-3 px-3 text-[var(--text-muted)] text-[11px] max-w-md truncate">
                      {log.message_body}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
