import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Smartphone, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  Loader2, 
  ChevronRight, 
  Coins,
  DollarSign,
  Receipt,
  FileCheck,
  Zap
} from 'lucide-react';
import { apiFetch } from '../utils/api.ts';
import { claimMpesaReceiptCode } from '../lib/dataStore';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageName: string;
  price: number;
  packageId: string | number;
  packageSlug: string;
  packageType: 'vip' | 'jackpot' | 'odds';
  onPaymentSuccess?: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  packageName,
  price,
  packageId,
  packageSlug,
  packageType,
  onPaymentSuccess
}: PaymentModalProps) {
  const [paymentMode, setPaymentMode] = useState<'stk' | 'paybill_claim'>('stk');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [receiptCode, setReceiptCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Real transaction and simulation states
  const [step, setStep] = useState<'input' | 'stk-sent' | 'pin-prompt' | 'success'>('input');
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const [showSandboxSuccessBtn, setShowSandboxSuccessBtn] = useState(false);
  const [claimedReceipt, setClaimedReceipt] = useState('');

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setPaymentMode('stk');
      setStep('input');
      setPhoneNumber('');
      setAccountName('');
      setReceiptCode('');
      setPin('');
      setErrorMessage('');
      setIsSubmitting(false);
      setCheckoutRequestId('');
      setPollingAttempts(0);
      setShowSandboxSuccessBtn(false);
      setClaimedReceipt('');
    }
  }, [isOpen]);

  // Polling database for transaction status
  useEffect(() => {
    let timeoutId: any;
    
    const checkStatus = async () => {
      if (step !== 'stk-sent' || !checkoutRequestId) return;

      try {
        const response = await apiFetch(`/api/mpesa/status/${checkoutRequestId}`);
        
        if (response.status === 'completed') {
          setStep('success');
          if (onPaymentSuccess) {
            onPaymentSuccess();
          }
          return;
        } else if (response.status === 'failed') {
          setErrorMessage(response.resultDesc || 'M-Pesa payment was cancelled or failed.');
          setStep('input');
          return;
        }

        setPollingAttempts((prev) => {
          const next = prev + 1;
          if (next >= 4) {
            setShowSandboxSuccessBtn(true);
          }
          return next;
        });

        // Continue polling every 2.5 seconds
        timeoutId = setTimeout(checkStatus, 2500);
      } catch (err) {
        console.error('Error polling transaction status:', err);
        timeoutId = setTimeout(checkStatus, 3000);
      }
    };

    if (step === 'stk-sent' && checkoutRequestId) {
      timeoutId = setTimeout(checkStatus, 2500);
    }

    return () => clearTimeout(timeoutId);
  }, [step, checkoutRequestId, onPaymentSuccess]);

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\s/g, '');
    const regex = /^(07\d{8}|01\d{8}|7\d{8}|1\d{8}|\+254\d{9}|254\d{9})$/;
    return regex.test(cleaned);
  };

  const handleInitiateSTK = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!phoneNumber) {
      setErrorMessage('Please enter your M-Pesa Phone Number.');
      return;
    }
    if (!validatePhone(phoneNumber)) {
      setErrorMessage('Please enter a valid Kenyan Safaricom Number (e.g. 0712345678 or 0112345678).');
      return;
    }
    if (!accountName.trim()) {
      setErrorMessage('Please enter your Account/Subscribers Name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiFetch('/api/mpesa/stkpush', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber,
          amount: price,
          itemType: packageType,
          itemId: String(packageId),
        }),
      });

      const reqId = response.checkoutRequestId || response.CheckoutRequestID;
      setCheckoutRequestId(reqId);
      setIsSubmitting(false);
      setStep('stk-sent');
      setPollingAttempts(0);
      setShowSandboxSuccessBtn(false);
    } catch (err: any) {
      console.error('STK Push initialization error:', err);
      setErrorMessage(err.message || 'Failed to initiate M-Pesa payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handlePinSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setErrorMessage('M-Pesa PIN must be exactly 4 digits.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await apiFetch('/api/mpesa/simulate-callback', {
        method: 'POST',
        body: JSON.stringify({
          checkoutRequestId,
          success: true
        })
      });
      setIsSubmitting(false);
      setStep('success');
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (err: any) {
      console.error('PIN submit simulation error:', err);
      setErrorMessage(err.message || 'Failed to complete transaction.');
      setIsSubmitting(false);
    }
  };

  const handleClaimCode = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!receiptCode.trim()) {
      setErrorMessage('Please enter your 10-character M-Pesa Receipt Code (e.g. RJK382910A).');
      return;
    }
    if (!phoneNumber) {
      setErrorMessage('Please enter your M-Pesa Mobile Number.');
      return;
    }
    if (!validatePhone(phoneNumber)) {
      setErrorMessage('Please enter a valid Kenyan Safaricom Number (e.g. 0712345678).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await claimMpesaReceiptCode(
        receiptCode.trim(), 
        phoneNumber.trim(), 
        String(packageId),
        packageType,
        packageName
      );
      if (res.success) {
        setClaimedReceipt(res.receiptCode || receiptCode.trim().toUpperCase());
        setStep('success');
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      } else {
        setErrorMessage(res.error || res.message || 'Verification failed. Check code and try again.');
      }
    } catch (err: any) {
      console.error('Claim code error:', err);
      setErrorMessage(err.message || 'Failed to verify M-Pesa transaction code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/35 dark:bg-black/45 backdrop-blur-[2px] transition-opacity duration-200">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] shadow-2xl overflow-hidden text-xs relative"
      >
        {/* Modal Close Button */}
        <button 
          onClick={onClose}
          id="modalClose"
          aria-label="Close payment modal"
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[var(--background)] hover:bg-opacity-80 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-5 border-b border-[var(--border)] bg-[var(--background)] bg-opacity-50">
          <span className="text-[9px] font-mono font-extrabold text-[var(--primary)] uppercase tracking-wider block mb-1">
            Secure checkout gateway
          </span>
          <h2 className="text-base font-extrabold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
            <Coins className="w-5 h-5 text-[var(--primary)]" />
            Unlock: {packageName}
          </h2>
          <p className="text-[var(--text-muted)] mt-1">
            Double-chance mathematical selections delivered directly via SMS & WhatsApp.
          </p>

          {/* Payment Method Switcher Tabs */}
          {step === 'input' && (
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[var(--border)] font-mono text-[11px]">
              <button
                type="button"
                onClick={() => { setPaymentMode('stk'); setErrorMessage(''); }}
                className={`py-2 px-3 rounded flex items-center justify-center gap-1.5 border font-bold cursor-pointer transition-all ${
                  paymentMode === 'stk'
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                    : 'bg-[var(--card)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>M-PESA</span>
              </button>
              <button
                type="button"
                onClick={() => { setPaymentMode('paybill_claim'); setErrorMessage(''); }}
                className={`py-2 px-3 rounded flex items-center justify-center gap-1.5 border font-bold cursor-pointer transition-all ${
                  paymentMode === 'paybill_claim'
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                    : 'bg-[var(--card)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Manual Payment</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            {/* STEP 1: INPUT CREDENTIALS */}
            {step === 'input' && paymentMode === 'stk' && (
              <motion.form 
                key="input-form-stk"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleInitiateSTK}
                className="space-y-4"
              >
                {/* Billing Summary */}
                <div className="p-3.5 rounded-[var(--radius)] bg-[var(--background)] border border-[var(--border)] flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-[var(--text-muted)] uppercase block font-mono font-bold">Package Name</span>
                    <strong className="text-[var(--text)] text-xs font-bold">{packageName}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-[var(--text-muted)] uppercase block font-mono font-bold">Total Bill</span>
                    <strong className="text-[var(--primary)] text-sm font-black font-mono">KES {price}</strong>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-[var(--radius)] bg-rose-500 bg-opacity-10 border border-rose-500 border-opacity-30 text-rose-700 font-bold">
                    {errorMessage}
                  </div>
                )}

                {/* Form Inputs */}
                <div className="space-y-3">
                  <div>
                    <label htmlFor="mPesaPhoneNumber" className="block text-[10px] text-[var(--text-muted)] font-mono font-bold uppercase mb-1.5">
                      M-Pesa Mobile Number
                    </label>
                    <input 
                      id="mPesaPhoneNumber"
                      type="text"
                      placeholder="e.g. 0712345678 or 0112345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-3.5 py-3 rounded-[var(--radius)] border border-[var(--border)] bg-white dark:bg-slate-900 text-[var(--text)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="subscriberName" className="block text-[10px] text-[var(--text-muted)] font-mono font-bold uppercase mb-1.5">
                      Subscriber Name / Alias
                    </label>
                    <input 
                      id="subscriberName"
                      type="text"
                      placeholder="e.g. Samuel Kamau"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-3.5 py-3 rounded-[var(--radius)] border border-[var(--border)] bg-white dark:bg-slate-900 text-[var(--text)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Payment Instructions list */}
                <div className="p-3 rounded-[var(--radius)] bg-[var(--background)] bg-opacity-40 border border-[var(--border)] space-y-1.5 text-[10px] text-[var(--text-muted)]">
                  <div className="font-bold text-[var(--text)] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[var(--secondary)]" /> STK Push Instructions:
                  </div>
                  <p>1. Enter your active mobile phone line.</p>
                  <p>2. Keep your handset unlocked to receive the payment prompt.</p>
                  <p>3. Authorize the prompt on your phone screen to instantly unlock access.</p>
                </div>

                {/* Trigger Button */}
                <button
                  type="submit"
                  id="payButton"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[var(--primary)] text-white font-extrabold text-xs rounded-[var(--radius)] shadow-lg hover:opacity-95 flex items-center justify-center gap-2 transition-all cursor-pointer border-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Connecting Mobile Gateway...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" />
                      <span>Proceed to Instant STK Payment</span>
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {/* STEP 1 - PAYBILL / CLAIM M-PESA CODE MODE */}
            {step === 'input' && paymentMode === 'paybill_claim' && (
              <motion.form 
                key="input-form-paybill"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleClaimCode}
                className="space-y-4"
              >
                {/* Paybill Instructions Card & How-to-pay Guide */}
                <div className="p-3.5 rounded-[var(--radius)] bg-slate-100 dark:bg-slate-800/80 border border-[var(--border)] space-y-2.5 text-[11px]">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold uppercase text-[var(--text-muted)] text-[10px]">Lipa na M-Pesa</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                        packageType === 'jackpot' ? 'bg-amber-500 text-white' :
                        packageType === 'odds' ? 'bg-purple-600 text-white' : 'bg-emerald-600 text-white'
                      }`}>
                        {packageType}
                      </span>
                    </div>
                    <span className="font-mono font-black text-[var(--primary)] text-xs">KES {price}</span>
                  </div>

                  <div className="text-xs font-extrabold text-[var(--text)] flex items-center justify-between">
                    <span>{packageName}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Manual Paybill</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1.5 border-t border-[var(--border)] border-dashed">
                    <div className="p-2 rounded bg-white dark:bg-slate-900 border border-[var(--border)]">
                      <span className="text-[9px] text-[var(--text-muted)] uppercase block font-bold">Business No (Paybill):</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-black text-sm">400200</strong>
                    </div>
                    <div className="p-2 rounded bg-white dark:bg-slate-900 border border-[var(--border)]">
                      <span className="text-[9px] text-[var(--text-muted)] uppercase block font-bold">Account Name:</span>
                      <strong className="text-[var(--text)] font-black text-sm">SOKAKING</strong>
                    </div>
                  </div>

                  {/* Step-by-Step Payment Instructions */}
                  <div className="p-2.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 space-y-1 text-[10px] text-amber-900 dark:text-amber-200 font-sans">
                    <div className="font-bold flex items-center gap-1 text-[11px] text-amber-900 dark:text-amber-100">
                      <Zap className="w-3.5 h-3.5 text-amber-600" /> How to Pay via M-PESA:
                    </div>
                    <ol className="list-decimal pl-4 space-y-0.5 leading-relaxed">
                      <li>Go to <strong>M-PESA</strong> on your SIM Toolkit or M-PESA App.</li>
                      <li>Select <strong>Lipa na M-PESA</strong> ➔ <strong>Pay Bill</strong>.</li>
                      <li>Enter Business Number: <strong>400200</strong>.</li>
                      <li>Enter Account Number: <strong>SOKAKING</strong>.</li>
                      <li>Enter Amount: <strong>KES {price}</strong>.</li>
                      <li>Enter your <strong>M-PESA PIN</strong> and press Send.</li>
                      <li>Copy the 10-character code (e.g., <strong>RJK382910A</strong>) from your M-PESA SMS and paste it below.</li>
                    </ol>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-[var(--radius)] bg-rose-500 bg-opacity-10 border border-rose-500 border-opacity-30 text-rose-700 font-bold">
                    {errorMessage}
                  </div>
                )}

                {/* Claim Inputs */}
                <div className="space-y-3">
                  <div>
                    <label htmlFor="receiptCodeInput" className="block text-[10px] text-[var(--text-muted)] font-mono font-bold uppercase mb-1.5">
                      M-Pesa Transaction Code
                    </label>
                    <input 
                      id="receiptCodeInput"
                      type="text"
                      placeholder="e.g. RJK382910A"
                      value={receiptCode}
                      onChange={(e) => setReceiptCode(e.target.value.toUpperCase())}
                      disabled={isSubmitting}
                      maxLength={12}
                      className="w-full px-3.5 py-3 rounded-[var(--radius)] border border-[var(--border)] bg-white dark:bg-slate-900 text-[var(--text)] text-xs font-mono font-black tracking-widest focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] uppercase"
                    />
                  </div>

                  <div>
                    <label htmlFor="claimPhone" className="block text-[10px] text-[var(--text-muted)] font-mono font-bold uppercase mb-1.5">
                      Your Mobile Phone Line
                    </label>
                    <input 
                      id="claimPhone"
                      type="text"
                      placeholder="e.g. 0712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-3.5 py-3 rounded-[var(--radius)] border border-[var(--border)] bg-white dark:bg-slate-900 text-[var(--text)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !receiptCode.trim() || !phoneNumber.trim()}
                  className="w-full py-3.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs rounded-[var(--radius)] shadow-lg hover:opacity-95 flex items-center justify-center gap-2 transition-all cursor-pointer border-none disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Transaction Code...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Verify Code & Unlock VIP SMS</span>
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {/* STEP 2: STK SENT LOADING SCREEN */}
            {step === 'stk-sent' && (
              <motion.div 
                key="stk-sent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-8 text-center space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--primary)] bg-opacity-10 text-[var(--primary)] flex items-center justify-center mx-auto border border-[var(--primary)] border-opacity-20">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm mb-1">STK Push Broadcasted!</h3>
                  <p className="text-[var(--text-muted)] text-xs max-w-sm mx-auto leading-relaxed">
                    An M-Pesa prompt has been sent to your phone line <strong className="text-[var(--text)]">{phoneNumber}</strong>. Please check your phone screen and enter your M-Pesa PIN to complete payment.
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 3: INTERACTIVE M-PESA POPUP SIMULATOR */}
            {step === 'pin-prompt' && (
              <motion.div 
                key="pin-prompt"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-4 flex flex-col items-center"
              >
                {/* Simulated Phone Shell */}
                <div className="w-full max-w-[280px] bg-neutral-900 border-4 border-neutral-700 rounded-[32px] p-3.5 shadow-2xl relative overflow-hidden text-[11px] text-black">
                  {/* Camera notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-black rounded-full" />
                  
                  {/* Phone screen canvas */}
                  <div className="bg-neutral-800 rounded-2xl p-3 min-h-[320px] flex flex-col justify-between pt-6">
                    {/* Phone stats header */}
                    <div className="flex justify-between text-[8px] text-gray-400 font-mono mb-2">
                      <span>Safaricom LTE</span>
                      <span>12:00 PM</span>
                    </div>

                    {/* Simulating STK Prompt Window overlay */}
                    <div className="bg-white rounded-xl p-3.5 border-t-4 border-emerald-500 shadow-xl space-y-3.5 mt-8">
                      <div className="font-extrabold text-[12px] text-emerald-600 flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" /> M-PESA
                      </div>
                      <p className="text-[9px] text-gray-700 font-semibold leading-relaxed">
                        Do you want to pay KES {price} to <strong className="text-black">SOKA KING</strong> for Account <strong className="text-black">{accountName}</strong>? Enter M-PESA PIN:
                      </p>

                      <form onSubmit={handlePinSubmit} className="space-y-3">
                        <input 
                          id="stkPin"
                          type="password"
                          maxLength={4}
                          placeholder="••••"
                          aria-label="Enter M-Pesa PIN"
                          value={pin}
                          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                          disabled={isSubmitting}
                          className="w-full text-center tracking-[8px] font-black text-sm border-b-2 border-emerald-500 pb-1 focus:outline-none text-black bg-transparent"
                        />

                        {errorMessage && (
                          <div className="text-[8px] text-rose-500 font-bold text-center">
                            {errorMessage}
                          </div>
                        )}

                        <div className="flex gap-2 pt-1 font-mono">
                          <button 
                            type="button"
                            onClick={async () => {
                              try {
                                if (checkoutRequestId) {
                                  await apiFetch('/api/mpesa/simulate-callback', {
                                    method: 'POST',
                                    body: JSON.stringify({
                                      checkoutRequestId,
                                      success: false
                                    })
                                  });
                                }
                              } catch (e) {
                                console.error(e);
                              }
                              setStep('input');
                              setErrorMessage('M-Pesa transaction cancelled by user.');
                            }}
                            className="flex-1 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded cursor-pointer border-none text-[9px]"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            disabled={isSubmitting || pin.length !== 4}
                            className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded cursor-pointer border-none text-[9px] flex items-center justify-center gap-1"
                          >
                            {isSubmitting ? <Loader2 className="w-2.5 h-2.5 animate-spin text-white" /> : 'Send'}
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="text-center text-[7px] text-gray-500 mt-4">
                      Simulated Safaricom SIM-Toolkit Window
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-3.5 text-center max-w-xs">
                  Type any 4-digit mock PIN (e.g. 1234) on the simulated Safaricom phone above and press Send to complete the transaction mockup!
                </p>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS TRANSACTION RECEIPT */}
            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-6 text-center space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500 bg-opacity-10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500 border-opacity-30">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base mb-1 text-emerald-600">Payment Confirmed!</h3>
                  <p className="text-[var(--text-muted)] text-xs max-w-sm mx-auto leading-relaxed">
                    Thank you <strong className="text-[var(--text)]">{accountName}</strong>. Your payment of <strong className="text-[var(--primary)]">KES {price}</strong> has been successfully processed by Safaricom M-Pesa.
                  </p>
                </div>

                {/* Simulated payment invoice receipt */}
                <div className="p-4 rounded-[var(--radius)] bg-[var(--background)] bg-opacity-80 border border-[var(--border)] max-w-xs mx-auto text-left space-y-2 font-mono text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Receipt Ref:</span>
                    <strong className="text-[var(--text)] uppercase">{claimedReceipt || `MPESA-${Math.random().toString(36).substring(2, 9).toUpperCase()}`}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Phone:</span>
                    <strong className="text-[var(--text)]">{phoneNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Locked item:</span>
                    <strong className="text-[var(--text)]">{packageName}</strong>
                  </div>
                  <div className="flex justify-between border-t border-[var(--border)] pt-2 mt-1">
                    <span className="text-[var(--text-muted)]">Status:</span>
                    <strong className="text-emerald-700 uppercase font-black">Verified & SMS Dispatched</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-[var(--primary)] hover:bg-opacity-95 text-white font-bold text-xs rounded-[var(--radius)] transition-all cursor-pointer border-none"
                  >
                    View Unlocked Tips Now
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
