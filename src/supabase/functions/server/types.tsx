// Receipt data types

export type SourceType = "photo" | "email" | "file" | "csv" | "mock";
export type ReceiptStatus = "parsed" | "needs_review";

export interface Receipt {
  id: string;
  sourceType: SourceType;
  rawSourceId?: string;
  
  // Core receipt data
  vendor: string;
  date: string; // ISO 8601 date string
  total: number;
  tax?: number;
  currency: string; // e.g., "USD", "EUR"
  
  // Categorization and scoring
  category: string;
  writeOffScore: number; // 0-100
  status: ReceiptStatus;
  
  // Timestamps
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
  
  // Optional detailed fields
  items?: Array<{
    description: string;
    amount: number;
    quantity?: number;
  }>;
  notes?: string;
}

export interface ReceiptInput {
  sourceType: SourceType;
  rawSourceId?: string;
  vendor: string;
  date: string;
  total: number;
  tax?: number;
  currency?: string;
  category?: string;
  status?: ReceiptStatus;
  items?: Array<{
    description: string;
    amount: number;
    quantity?: number;
  }>;
  notes?: string;
}

export interface IngestReceiptPayload {
  sourceType: SourceType;
  
  // For structured data (CSV, mock, or manual entry)
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
  
  // For file uploads (photo, PDF)
  file?: {
    data: string; // base64 encoded
    mimeType: string;
    filename: string;
  };
  
  // For email forwarding
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
