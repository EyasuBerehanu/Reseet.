// Frontend API client for receipts

import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-07936f9c`;

export type SourceType = "photo" | "email" | "file" | "csv" | "mock";
export type ReceiptStatus = "parsed" | "needs_review";

export interface Receipt {
  id: string;
  sourceType: SourceType;
  rawSourceId?: string;
  vendor: string;
  date: string;
  total: number;
  tax?: number;
  currency: string;
  category: string;
  writeOffScore: number;
  status: ReceiptStatus;
  createdAt: string;
  updatedAt: string;
  items?: Array<{
    description: string;
    amount: number;
    quantity?: number;
  }>;
  notes?: string;
}

export interface IngestReceiptPayload {
  sourceType: SourceType;
  structuredData?: {
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
  };
  file?: {
    data: string;
    mimeType: string;
    filename: string;
  };
  emailData?: {
    from: string;
    subject: string;
    body: string;
    attachments?: Array<{
      filename: string;
      data: string;
    }>;
  };
}

export interface GetReceiptsQuery {
  sourceType?: SourceType;
  status?: ReceiptStatus;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  minTotal?: number;
  maxTotal?: number;
}

// Helper to make authenticated requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    console.error(`API Error [${endpoint}]:`, error);
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Ingest a new receipt
export async function ingestReceipt(payload: IngestReceiptPayload): Promise<Receipt> {
  const result = await fetchAPI('/ingest-receipt', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return result.receipt;
}

// Get all receipts with optional filtering
export async function getReceipts(query: GetReceiptsQuery = {}): Promise<Receipt[]> {
  const params = new URLSearchParams();
  
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  const endpoint = queryString ? `/receipts?${queryString}` : '/receipts';
  
  const result = await fetchAPI(endpoint);
  return result.receipts;
}

// Get a single receipt by ID
export async function getReceiptById(id: string): Promise<Receipt> {
  const result = await fetchAPI(`/receipts/${id}`);
  return result.receipt;
}

// Update a receipt
export async function updateReceipt(id: string, updates: Partial<Receipt>): Promise<Receipt> {
  const result = await fetchAPI(`/receipts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return result.receipt;
}

// Delete a receipt
export async function deleteReceipt(id: string): Promise<void> {
  await fetchAPI(`/receipts/${id}`, {
    method: 'DELETE',
  });
}

// Helper: Create a mock receipt (for testing)
export async function createMockReceipt(data: {
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
}): Promise<Receipt> {
  return ingestReceipt({
    sourceType: 'mock',
    structuredData: data,
  });
}

// Helper: Convert file to base64 for upload
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Helper: Ingest a photo receipt from a File object
export async function ingestPhotoReceiptFromFile(file: File): Promise<Receipt> {
  const base64Data = await fileToBase64(file);
  
  return ingestReceipt({
    sourceType: 'photo',
    file: {
      data: base64Data,
      mimeType: file.type,
      filename: file.name,
    },
  });
}
