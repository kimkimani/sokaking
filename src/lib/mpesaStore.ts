/**
 * In-Memory Transaction & Subscription Store for Next.js App Router
 * Tracks real Safaricom M-Pesa STK Pushes, callbacks, polling status, and VIP activations.
 */

export interface MpesaTxn {
  checkoutRequestId: string;
  merchantRequestId?: string;
  phoneNumber: string;
  amount: number;
  itemType: string;
  itemId: string;
  status: 'pending' | 'completed' | 'failed';
  mpesaReceiptCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VipSubscription {
  id: string;
  phoneNumber: string;
  packageId: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'expired';
  mpesaReceiptCode?: string;
  createdAt: string;
}

const globalForMpesa = globalThis as unknown as {
  mpesaTxnsMap: Map<string, MpesaTxn>;
  vipSubsMap: Map<string, VipSubscription>;
};

if (!globalForMpesa.mpesaTxnsMap) {
  globalForMpesa.mpesaTxnsMap = new Map<string, MpesaTxn>();
}

if (!globalForMpesa.vipSubsMap) {
  globalForMpesa.vipSubsMap = new Map<string, VipSubscription>();
}

export const mpesaTxnsMap = globalForMpesa.mpesaTxnsMap;
export const vipSubsMap = globalForMpesa.vipSubsMap;

export function recordMpesaTxn(txn: {
  checkoutRequestId: string;
  merchantRequestId?: string;
  phoneNumber: string;
  amount: number;
  itemType: string;
  itemId: string;
  status?: 'pending' | 'completed' | 'failed';
  mpesaReceiptCode?: string;
}): MpesaTxn {
  const now = new Date().toISOString();
  const existing = mpesaTxnsMap.get(txn.checkoutRequestId);

  const fullTxn: MpesaTxn = {
    checkoutRequestId: txn.checkoutRequestId,
    merchantRequestId: txn.merchantRequestId || existing?.merchantRequestId,
    phoneNumber: txn.phoneNumber || existing?.phoneNumber || '254700000000',
    amount: txn.amount || existing?.amount || 0,
    itemType: txn.itemType || existing?.itemType || 'vip',
    itemId: txn.itemId || existing?.itemId || 'daily-vip',
    status: txn.status || existing?.status || 'pending',
    mpesaReceiptCode: txn.mpesaReceiptCode || existing?.mpesaReceiptCode,
    createdAt: existing ? existing.createdAt : now,
    updatedAt: now,
  };

  mpesaTxnsMap.set(txn.checkoutRequestId, fullTxn);
  return fullTxn;
}

export function getMpesaTxn(checkoutRequestId: string): MpesaTxn | undefined {
  return mpesaTxnsMap.get(checkoutRequestId);
}

export function markMpesaTxnCompleted(
  checkoutRequestId: string,
  receiptCode: string,
  phoneOverride?: string
): MpesaTxn {
  const existing = mpesaTxnsMap.get(checkoutRequestId);
  const now = new Date().toISOString();
  const phone = phoneOverride || existing?.phoneNumber || '254700000000';
  const itemId = existing?.itemId || 'daily-vip';

  const updatedTxn: MpesaTxn = {
    checkoutRequestId,
    merchantRequestId: existing?.merchantRequestId || `MR_${Date.now()}`,
    phoneNumber: phone,
    amount: existing?.amount || 100,
    itemType: existing?.itemType || 'vip',
    itemId,
    status: 'completed',
    mpesaReceiptCode: receiptCode,
    createdAt: existing ? existing.createdAt : now,
    updatedAt: now,
  };

  mpesaTxnsMap.set(checkoutRequestId, updatedTxn);
  activateVipAccess(phone, itemId, receiptCode);
  return updatedTxn;
}

export function markMpesaTxnFailed(checkoutRequestId: string): MpesaTxn | undefined {
  const existing = mpesaTxnsMap.get(checkoutRequestId);
  if (!existing) return undefined;

  existing.status = 'failed';
  existing.updatedAt = new Date().toISOString();
  mpesaTxnsMap.set(checkoutRequestId, existing);
  return existing;
}

export function activateVipAccess(phoneNumber: string, packageId: string, receiptCode?: string): VipSubscription {
  const now = new Date();
  const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 Hours
  const subId = `SUB_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const sub: VipSubscription = {
    id: subId,
    phoneNumber,
    packageId,
    startTime: now.toISOString(),
    endTime: endTime.toISOString(),
    status: 'active',
    mpesaReceiptCode: receiptCode,
    createdAt: now.toISOString(),
  };

  vipSubsMap.set(subId, sub);
  return sub;
}

export function checkUserActiveVip(phoneNumber: string): boolean {
  const clean = phoneNumber.replace(/[^0-9]/g, '');
  const now = new Date().toISOString();

  for (const sub of vipSubsMap.values()) {
    const subClean = sub.phoneNumber.replace(/[^0-9]/g, '');
    if ((subClean === clean || subClean.endsWith(clean.slice(-9))) && sub.status === 'active' && sub.endTime > now) {
      return true;
    }
  }
  return false;
}
