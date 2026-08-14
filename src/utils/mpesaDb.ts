import fs from 'fs';
import path from 'path';

export interface MpesaTransactionRecord {
  id: number;
  user_id: string;
  checkout_request_id: string;
  merchant_request_id: string;
  phone_number: string;
  amount: number;
  item_type: string;
  item_id: string;
  status: 'pending' | 'completed' | 'failed';
  mpesa_receipt_number: string | null;
  result_desc: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseRecord {
  id: number;
  user_id: string;
  item_type: string;
  item_id: string;
  created_at: string;
}

export interface SubscriptionRecord {
  id: number;
  user_id: string;
  phone_number: string;
  package_id: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
}

interface DatabaseStructure {
  mpesa_transactions: MpesaTransactionRecord[];
  purchases: PurchaseRecord[];
  user_subscriptions: SubscriptionRecord[];
  nextTxId: number;
  nextPurchaseId: number;
  nextSubId: number;
}

const DB_FILE = path.join(process.cwd(), 'mpesa_database.json');

function getInitialData(): DatabaseStructure {
  return {
    mpesa_transactions: [],
    purchases: [],
    user_subscriptions: [],
    nextTxId: 1,
    nextPurchaseId: 1,
    nextSubId: 1,
  };
}

function loadDb(): DatabaseStructure {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        mpesa_transactions: Array.isArray(parsed.mpesa_transactions) ? parsed.mpesa_transactions : [],
        purchases: Array.isArray(parsed.purchases) ? parsed.purchases : [],
        user_subscriptions: Array.isArray(parsed.user_subscriptions) ? parsed.user_subscriptions : [],
        nextTxId: parsed.nextTxId || (parsed.mpesa_transactions?.length ? Math.max(...parsed.mpesa_transactions.map((t: any) => t.id || 0)) + 1 : 1),
        nextPurchaseId: parsed.nextPurchaseId || (parsed.purchases?.length ? Math.max(...parsed.purchases.map((p: any) => p.id || 0)) + 1 : 1),
        nextSubId: parsed.nextSubId || (parsed.user_subscriptions?.length ? Math.max(...parsed.user_subscriptions.map((s: any) => s.id || 0)) + 1 : 1),
      };
    }
  } catch (err) {
    console.error('[mpesaDb] Error loading mpesa_database.json:', err);
  }
  return getInitialData();
}

function saveDb(data: DatabaseStructure) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[mpesaDb] Error saving mpesa_database.json:', err);
  }
}

export function createPendingTransaction(params: {
  userId: string;
  checkoutRequestId: string;
  merchantRequestId: string;
  phoneNumber: string;
  amount: number;
  itemType: string;
  itemId: string;
}): MpesaTransactionRecord {
  const db = loadDb();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // Check if existing
  const existingIdx = db.mpesa_transactions.findIndex(t => t.checkout_request_id === params.checkoutRequestId);
  
  const record: MpesaTransactionRecord = {
    id: existingIdx >= 0 ? db.mpesa_transactions[existingIdx].id : db.nextTxId++,
    user_id: params.userId,
    checkout_request_id: params.checkoutRequestId,
    merchant_request_id: params.merchantRequestId,
    phone_number: params.phoneNumber,
    amount: params.amount,
    item_type: params.itemType,
    item_id: params.itemId,
    status: 'pending',
    mpesa_receipt_number: null,
    result_desc: 'STK Push request broadcasted',
    created_at: existingIdx >= 0 ? db.mpesa_transactions[existingIdx].created_at : now,
    updated_at: now,
  };

  if (existingIdx >= 0) {
    db.mpesa_transactions[existingIdx] = record;
  } else {
    db.mpesa_transactions.unshift(record);
  }

  saveDb(db);
  console.log(`[mpesaDb] Recorded pending M-Pesa transaction #${record.id} (${record.checkout_request_id}) for ${record.phone_number}`);
  return record;
}

export function completeTransaction(checkoutRequestId: string, success: boolean = true, receiptNumber?: string): MpesaTransactionRecord | null {
  const db = loadDb();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  let tx = db.mpesa_transactions.find(t => t.checkout_request_id === checkoutRequestId);
  const status = success ? 'completed' : 'failed';
  const receipt = receiptNumber || (success ? 'MP' + Math.random().toString(36).substring(2, 10).toUpperCase() : null);
  const desc = success ? 'The service request is processed successfully.' : 'Request cancelled or failed.';

  if (!tx) {
    // Create completed on the fly if missing
    tx = {
      id: db.nextTxId++,
      user_id: 'guest',
      checkout_request_id: checkoutRequestId,
      merchant_request_id: 'MR_' + Math.floor(100000 + Math.random() * 900000),
      phone_number: '254700000000',
      amount: 100,
      item_type: 'vip_package',
      item_id: 'VIP_WEEKLY',
      status: status,
      mpesa_receipt_number: receipt,
      result_desc: desc,
      created_at: now,
      updated_at: now,
    };
    db.mpesa_transactions.unshift(tx);
  } else {
    tx.status = status;
    tx.mpesa_receipt_number = receipt;
    tx.result_desc = desc;
    tx.updated_at = now;
  }

  if (success) {
    // Record purchase
    const existsPurchase = db.purchases.some(p => p.user_id === tx!.phone_number && p.item_type === tx!.item_type && p.item_id === tx!.item_id);
    if (!existsPurchase) {
      db.purchases.unshift({
        id: db.nextPurchaseId++,
        user_id: tx.phone_number,
        item_type: tx.item_type,
        item_id: tx.item_id,
        created_at: now,
      });
    }

    // Record or update subscription
    const days = tx.item_id.toLowerCase().includes('daily') ? 1 : (tx.item_id.toLowerCase().includes('monthly') ? 30 : 7);
    const startDate = new Date();
    const endDate = new Date(Date.now() + days * 86400 * 1000);

    const subIdx = db.user_subscriptions.findIndex(s => s.phone_number === tx!.phone_number || s.user_id === tx!.user_id);
    const subRecord: SubscriptionRecord = {
      id: subIdx >= 0 ? db.user_subscriptions[subIdx].id : db.nextSubId++,
      user_id: tx.user_id,
      phone_number: tx.phone_number,
      package_id: tx.item_id,
      start_time: startDate.toISOString().replace('T', ' ').substring(0, 19),
      end_time: endDate.toISOString().replace('T', ' ').substring(0, 19),
      status: 'active',
      created_at: now,
    };

    if (subIdx >= 0) {
      db.user_subscriptions[subIdx] = subRecord;
    } else {
      db.user_subscriptions.unshift(subRecord);
    }
  }

  saveDb(db);
  console.log(`[mpesaDb] Updated transaction ${checkoutRequestId} status to '${status}' (Receipt: ${receipt})`);
  return tx;
}

export function claimManualReceipt(params: {
  receiptCode: string;
  phoneNumber: string;
  packageId: string;
  packageType: string;
  packageName?: string;
}): MpesaTransactionRecord {
  const db = loadDb();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const cleanPhone = params.phoneNumber.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('0') ? '254' + cleanPhone.slice(1) : (cleanPhone.startsWith('254') ? cleanPhone : '254' + cleanPhone);
  const checkoutRequestId = 'CLAIM_' + params.receiptCode.toUpperCase() + '_' + Date.now();

  const record: MpesaTransactionRecord = {
    id: db.nextTxId++,
    user_id: formattedPhone,
    checkout_request_id: checkoutRequestId,
    merchant_request_id: 'MR_MANUAL_CLAIM',
    phone_number: formattedPhone,
    amount: 100,
    item_type: params.packageType || 'vip_package',
    item_id: params.packageId || 'VIP_WEEKLY',
    status: 'completed',
    mpesa_receipt_number: params.receiptCode.toUpperCase(),
    result_desc: 'Manual receipt code claimed successfully',
    created_at: now,
    updated_at: now,
  };

  db.mpesa_transactions.unshift(record);

  // Add purchase
  db.purchases.unshift({
    id: db.nextPurchaseId++,
    user_id: formattedPhone,
    item_type: params.packageType || 'vip_package',
    item_id: params.packageId || 'VIP_WEEKLY',
    created_at: now,
  });

  // Add subscription
  const days = params.packageId.toLowerCase().includes('daily') ? 1 : (params.packageId.toLowerCase().includes('monthly') ? 30 : 7);
  const startDate = new Date();
  const endDate = new Date(Date.now() + days * 86400 * 1000);

  const subIdx = db.user_subscriptions.findIndex(s => s.phone_number === formattedPhone);
  const subRecord: SubscriptionRecord = {
    id: subIdx >= 0 ? db.user_subscriptions[subIdx].id : db.nextSubId++,
    user_id: formattedPhone,
    phone_number: formattedPhone,
    package_id: params.packageId,
    start_time: startDate.toISOString().replace('T', ' ').substring(0, 19),
    end_time: endDate.toISOString().replace('T', ' ').substring(0, 19),
    status: 'active',
    created_at: now,
  };

  if (subIdx >= 0) {
    db.user_subscriptions[subIdx] = subRecord;
  } else {
    db.user_subscriptions.unshift(subRecord);
  }

  saveDb(db);
  console.log(`[mpesaDb] Recorded manual claim receipt ${params.receiptCode} for ${formattedPhone}`);
  return record;
}

export function getTransactionByCheckoutId(checkoutRequestId: string): MpesaTransactionRecord | null {
  const db = loadDb();
  return db.mpesa_transactions.find(t => t.checkout_request_id === checkoutRequestId) || null;
}

export function getAllMpesaTransactions(): MpesaTransactionRecord[] {
  const db = loadDb();
  return db.mpesa_transactions;
}

export function getAllPurchases(): PurchaseRecord[] {
  const db = loadDb();
  return db.purchases;
}

export function getAllSubscriptions(): SubscriptionRecord[] {
  const db = loadDb();
  return db.user_subscriptions;
}
