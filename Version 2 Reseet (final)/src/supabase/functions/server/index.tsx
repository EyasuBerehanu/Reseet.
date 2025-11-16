import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { IngestReceiptPayload, GetReceiptsQuery } from "./types.tsx";
import { createReceipt, getReceipts, getReceiptById, updateReceipt, deleteReceipt } from "./receipts.tsx";
import { 
  parsePhotoReceipt, 
  parseEmailReceipt, 
  parseFileReceipt, 
  parseCsvRowReceipt, 
  parseStructuredReceipt 
} from "./parsers.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-07936f9c/health", (c) => {
  return c.json({ status: "ok" });
});

// POST /ingest-receipt - Ingest a new receipt
app.post("/make-server-07936f9c/ingest-receipt", async (c) => {
  try {
    const payload: IngestReceiptPayload = await c.req.json();
    const { sourceType, structuredData, file, emailData } = payload;

    let receiptInput;

    // Route to appropriate parser based on source type
    switch (sourceType) {
      case 'photo':
        if (!file) {
          return c.json({ error: 'File data required for photo receipts' }, 400);
        }
        receiptInput = await parsePhotoReceipt(file.data, file.mimeType, file.filename);
        break;

      case 'email':
        if (!emailData) {
          return c.json({ error: 'Email data required for email receipts' }, 400);
        }
        receiptInput = await parseEmailReceipt(
          emailData.from,
          emailData.subject,
          emailData.body,
          emailData.attachments
        );
        break;

      case 'file':
        if (!file) {
          return c.json({ error: 'File data required for file receipts' }, 400);
        }
        receiptInput = await parseFileReceipt(file.data, file.mimeType, file.filename);
        break;

      case 'csv':
        if (!structuredData) {
          return c.json({ error: 'Structured data required for CSV receipts' }, 400);
        }
        receiptInput = parseCsvRowReceipt(structuredData as any);
        break;

      case 'mock':
        if (!structuredData) {
          return c.json({ error: 'Structured data required for mock receipts' }, 400);
        }
        receiptInput = parseStructuredReceipt(structuredData);
        break;

      default:
        return c.json({ error: 'Invalid source type' }, 400);
    }

    // Create receipt in database
    const receipt = await createReceipt(receiptInput);

    return c.json({
      success: true,
      receipt,
    });
  } catch (error) {
    console.error('Error ingesting receipt:', error);
    return c.json({ 
      error: 'Failed to ingest receipt', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// GET /receipts - Get all receipts with filtering
app.get("/make-server-07936f9c/receipts", async (c) => {
  try {
    const query: GetReceiptsQuery = {
      sourceType: c.req.query('sourceType') as any,
      status: c.req.query('status') as any,
      limit: c.req.query('limit') ? parseInt(c.req.query('limit')!) : undefined,
      offset: c.req.query('offset') ? parseInt(c.req.query('offset')!) : undefined,
      startDate: c.req.query('startDate'),
      endDate: c.req.query('endDate'),
      minTotal: c.req.query('minTotal') ? parseFloat(c.req.query('minTotal')!) : undefined,
      maxTotal: c.req.query('maxTotal') ? parseFloat(c.req.query('maxTotal')!) : undefined,
    };

    const receipts = await getReceipts(query);

    return c.json({
      success: true,
      receipts,
      count: receipts.length,
    });
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return c.json({ 
      error: 'Failed to fetch receipts', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// GET /receipts/:id - Get a single receipt by ID
app.get("/make-server-07936f9c/receipts/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const receipt = await getReceiptById(id);

    if (!receipt) {
      return c.json({ error: 'Receipt not found' }, 404);
    }

    return c.json({
      success: true,
      receipt,
    });
  } catch (error) {
    console.error('Error fetching receipt:', error);
    return c.json({ 
      error: 'Failed to fetch receipt', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// PUT /receipts/:id - Update a receipt
app.put("/make-server-07936f9c/receipts/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();

    const receipt = await updateReceipt(id, updates);

    if (!receipt) {
      return c.json({ error: 'Receipt not found' }, 404);
    }

    return c.json({
      success: true,
      receipt,
    });
  } catch (error) {
    console.error('Error updating receipt:', error);
    return c.json({ 
      error: 'Failed to update receipt', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// DELETE /receipts/:id - Delete a receipt
app.delete("/make-server-07936f9c/receipts/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const success = await deleteReceipt(id);

    if (!success) {
      return c.json({ error: 'Receipt not found' }, 404);
    }

    return c.json({
      success: true,
      message: 'Receipt deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting receipt:', error);
    return c.json({ 
      error: 'Failed to delete receipt', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

Deno.serve(app.fetch);