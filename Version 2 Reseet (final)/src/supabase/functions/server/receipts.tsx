// Receipt business logic and helpers

import * as kv from './kv_store.tsx';
import { Receipt, ReceiptInput, GetReceiptsQuery, SourceType } from './types.tsx';

// Generate a unique receipt ID
export function generateReceiptId(): string {
  return `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Calculate write-off score based on category and vendor
export function calculateWriteOffScore(receipt: ReceiptInput): number {
  let score = 50; // Base score
  
  const category = receipt.category?.toLowerCase() || '';
  const vendor = receipt.vendor?.toLowerCase() || '';
  
  // Category-based scoring
  const highDeductibleCategories = [
    'software',
    'office supplies',
    'advertising',
    'professional services',
    'subscriptions',
    'business travel',
    'equipment',
  ];
  
  const mediumDeductibleCategories = [
    'meals',
    'entertainment',
    'transport',
    'utilities',
    'internet',
    'phone',
  ];
  
  const lowDeductibleCategories = [
    'personal',
    'grocery',
    'clothing',
    'health',
  ];
  
  // Check category match
  for (const cat of highDeductibleCategories) {
    if (category.includes(cat)) {
      score += 30;
      break;
    }
  }
  
  for (const cat of mediumDeductibleCategories) {
    if (category.includes(cat)) {
      score += 15;
      break;
    }
  }
  
  for (const cat of lowDeductibleCategories) {
    if (category.includes(cat)) {
      score -= 20;
      break;
    }
  }
  
  // Vendor-based scoring (business-oriented vendors)
  const businessVendors = [
    'stripe', 'paypal', 'square', 'shopify',
    'aws', 'azure', 'google cloud', 'digitalocean',
    'github', 'adobe', 'microsoft', 'apple developer',
    'uber', 'lyft', 'delta', 'united', 'american airlines',
    'hilton', 'marriott', 'hyatt', 'airbnb',
    'fedex', 'ups', 'usps',
    'staples', 'office depot',
  ];
  
  for (const bv of businessVendors) {
    if (vendor.includes(bv)) {
      score += 20;
      break;
    }
  }
  
  // Clamp score between 0 and 100
  return Math.max(0, Math.min(100, score));
}

// Create a new receipt
export async function createReceipt(input: ReceiptInput): Promise<Receipt> {
  const now = new Date().toISOString();
  const id = generateReceiptId();
  
  const receipt: Receipt = {
    id,
    sourceType: input.sourceType,
    rawSourceId: input.rawSourceId,
    vendor: input.vendor,
    date: input.date,
    total: input.total,
    tax: input.tax,
    currency: input.currency || 'USD',
    category: input.category || 'Uncategorized',
    writeOffScore: calculateWriteOffScore(input),
    status: input.status || 'parsed',
    items: input.items,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  };
  
  // Store receipt in KV store
  await kv.set(`receipt:${id}`, receipt);
  
  // Add to receipts index
  const allReceipts = await kv.get('receipts:all') || [];
  allReceipts.push(id);
  await kv.set('receipts:all', allReceipts);
  
  // Add to source type index
  const sourceTypeKey = `receipts:sourceType:${input.sourceType}`;
  const sourceTypeReceipts = await kv.get(sourceTypeKey) || [];
  sourceTypeReceipts.push(id);
  await kv.set(sourceTypeKey, sourceTypeReceipts);
  
  // Add to status index
  const statusKey = `receipts:status:${receipt.status}`;
  const statusReceipts = await kv.get(statusKey) || [];
  statusReceipts.push(id);
  await kv.set(statusKey, statusReceipts);
  
  return receipt;
}

// Get a single receipt by ID
export async function getReceiptById(id: string): Promise<Receipt | null> {
  const receipt = await kv.get(`receipt:${id}`);
  return receipt as Receipt | null;
}

// Get all receipts with filtering
export async function getReceipts(query: GetReceiptsQuery = {}): Promise<Receipt[]> {
  const { sourceType, status, limit = 50, offset = 0, startDate, endDate, minTotal, maxTotal } = query;
  
  let receiptIds: string[] = [];
  
  // Use index if filtering by sourceType
  if (sourceType) {
    receiptIds = await kv.get(`receipts:sourceType:${sourceType}`) || [];
  }
  // Use index if filtering by status
  else if (status) {
    receiptIds = await kv.get(`receipts:status:${status}`) || [];
  }
  // Otherwise get all receipts
  else {
    receiptIds = await kv.get('receipts:all') || [];
  }
  
  // Fetch all receipts
  const receipts: Receipt[] = [];
  for (const id of receiptIds) {
    const receipt = await kv.get(`receipt:${id}`) as Receipt | null;
    if (receipt) {
      receipts.push(receipt);
    }
  }
  
  // Apply additional filters
  let filteredReceipts = receipts;
  
  if (sourceType && !query.status) {
    filteredReceipts = filteredReceipts.filter(r => r.sourceType === sourceType);
  }
  
  if (status && !query.sourceType) {
    filteredReceipts = filteredReceipts.filter(r => r.status === status);
  }
  
  if (startDate) {
    filteredReceipts = filteredReceipts.filter(r => r.date >= startDate);
  }
  
  if (endDate) {
    filteredReceipts = filteredReceipts.filter(r => r.date <= endDate);
  }
  
  if (minTotal !== undefined) {
    filteredReceipts = filteredReceipts.filter(r => r.total >= minTotal);
  }
  
  if (maxTotal !== undefined) {
    filteredReceipts = filteredReceipts.filter(r => r.total <= maxTotal);
  }
  
  // Sort by date (newest first)
  filteredReceipts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Apply pagination
  return filteredReceipts.slice(offset, offset + limit);
}

// Update a receipt
export async function updateReceipt(id: string, updates: Partial<Receipt>): Promise<Receipt | null> {
  const receipt = await getReceiptById(id);
  if (!receipt) {
    return null;
  }
  
  const updatedReceipt: Receipt = {
    ...receipt,
    ...updates,
    id: receipt.id, // Ensure ID doesn't change
    createdAt: receipt.createdAt, // Ensure createdAt doesn't change
    updatedAt: new Date().toISOString(),
  };
  
  await kv.set(`receipt:${id}`, updatedReceipt);
  
  return updatedReceipt;
}

// Delete a receipt
export async function deleteReceipt(id: string): Promise<boolean> {
  const receipt = await getReceiptById(id);
  if (!receipt) {
    return false;
  }
  
  // Remove from main storage
  await kv.del(`receipt:${id}`);
  
  // Remove from all receipts index
  const allReceipts = await kv.get('receipts:all') || [];
  const filteredAll = allReceipts.filter((rid: string) => rid !== id);
  await kv.set('receipts:all', filteredAll);
  
  // Remove from source type index
  const sourceTypeKey = `receipts:sourceType:${receipt.sourceType}`;
  const sourceTypeReceipts = await kv.get(sourceTypeKey) || [];
  const filteredSourceType = sourceTypeReceipts.filter((rid: string) => rid !== id);
  await kv.set(sourceTypeKey, filteredSourceType);
  
  // Remove from status index
  const statusKey = `receipts:status:${receipt.status}`;
  const statusReceipts = await kv.get(statusKey) || [];
  const filteredStatus = statusReceipts.filter((rid: string) => rid !== id);
  await kv.set(statusKey, filteredStatus);
  
  return true;
}
