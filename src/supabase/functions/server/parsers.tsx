// Source-specific receipt parsers

import { ReceiptInput, SourceType } from './types.tsx';

// Parse a photo receipt (placeholder - would integrate with OCR service)
export async function parsePhotoReceipt(fileData: string, mimeType: string, filename: string): Promise<ReceiptInput> {
  // In a real implementation, this would:
  // 1. Upload the image to storage
  // 2. Call an OCR service (e.g., Google Vision, AWS Textract)
  // 3. Parse the OCR results to extract receipt fields
  
  // For now, return mock data indicating it needs review
  const rawSourceId = `photo_${Date.now()}`;
  
  return {
    sourceType: 'photo',
    rawSourceId,
    vendor: 'Unknown Vendor',
    date: new Date().toISOString().split('T')[0],
    total: 0,
    currency: 'USD',
    category: 'Uncategorized',
    status: 'needs_review',
    notes: `Photo receipt uploaded: ${filename}`,
  };
}

// Parse an email receipt (placeholder)
export async function parseEmailReceipt(
  from: string,
  subject: string,
  body: string,
  attachments?: Array<{ filename: string; data: string }>
): Promise<ReceiptInput> {
  // In a real implementation, this would:
  // 1. Parse common email receipt formats (Amazon, Uber, etc.)
  // 2. Extract vendor from sender or subject
  // 3. Use regex to find total, date, items
  
  const rawSourceId = `email_${Date.now()}`;
  
  // Simple vendor extraction from email address
  const vendorMatch = from.match(/@([^.]+)/);
  const vendor = vendorMatch ? vendorMatch[1] : 'Unknown Vendor';
  
  return {
    sourceType: 'email',
    rawSourceId,
    vendor: vendor.charAt(0).toUpperCase() + vendor.slice(1),
    date: new Date().toISOString().split('T')[0],
    total: 0,
    currency: 'USD',
    category: 'Uncategorized',
    status: 'needs_review',
    notes: `Email receipt from ${from}`,
  };
}

// Parse a file receipt (PDF, etc.)
export async function parseFileReceipt(fileData: string, mimeType: string, filename: string): Promise<ReceiptInput> {
  // In a real implementation, this would:
  // 1. Upload the file to storage
  // 2. For PDFs, extract text and parse
  // 3. For images, use OCR
  
  const rawSourceId = `file_${Date.now()}`;
  
  return {
    sourceType: 'file',
    rawSourceId,
    vendor: 'Unknown Vendor',
    date: new Date().toISOString().split('T')[0],
    total: 0,
    currency: 'USD',
    category: 'Uncategorized',
    status: 'needs_review',
    notes: `File receipt uploaded: ${filename}`,
  };
}

// Parse a CSV row receipt
export function parseCsvRowReceipt(row: Record<string, string>): ReceiptInput {
  // Expected CSV columns: vendor, date, total, tax, currency, category
  const rawSourceId = `csv_${Date.now()}`;
  
  return {
    sourceType: 'csv',
    rawSourceId,
    vendor: row.vendor || 'Unknown Vendor',
    date: row.date || new Date().toISOString().split('T')[0],
    total: parseFloat(row.total || '0'),
    tax: row.tax ? parseFloat(row.tax) : undefined,
    currency: row.currency || 'USD',
    category: row.category || 'Uncategorized',
    status: 'parsed',
  };
}

// Parse structured/mock receipt data
export function parseStructuredReceipt(data: {
  vendor: string;
  date: string;
  total: number;
  tax?: number;
  currency?: string;
  category?: string;
  items?: Array<{
    description: string;
    amount: number;
    quantity?: number;
  }>;
  notes?: string;
}): ReceiptInput {
  return {
    sourceType: 'mock',
    rawSourceId: `mock_${Date.now()}`,
    vendor: data.vendor,
    date: data.date,
    total: data.total,
    tax: data.tax,
    currency: data.currency || 'USD',
    category: data.category || 'Uncategorized',
    items: data.items,
    notes: data.notes,
    status: 'parsed',
  };
}
