import { Receipt } from '../App';
import { AIReceiptScanner } from './aiReceiptScanner';

export interface ParsedEmailReceipt {
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string; // base64
    contentType: string;
  }>;
}

export class EmailReceiptParser {
  private aiScanner: AIReceiptScanner;

  constructor(apiKey: string) {
    this.aiScanner = new AIReceiptScanner(apiKey);
  }

  /**
   * Parse email receipt from various formats:
   * - Screenshot/image of email receipt
   * - PDF attachment
   * - HTML email content (future enhancement)
   */
  async parseEmailReceipt(file: File): Promise<Omit<Receipt, 'id'>> {
    const fileType = file.type.toLowerCase();

    // Handle image files (screenshots of email receipts)
    if (fileType.startsWith('image/')) {
      console.log('📧 Processing email receipt image');
      const base64 = await this.fileToBase64(file);
      return await this.aiScanner.analyzeReceipt(base64);
    }

    // Handle PDF files
    if (fileType === 'application/pdf') {
      console.log('📧 Processing email receipt PDF');
      const base64 = await this.fileToBase64(file);
      // The AI can analyze PDF receipts as images
      return await this.aiScanner.analyzeReceipt(base64);
    }

    // Handle HTML files (email receipts saved as HTML)
    if (fileType === 'text/html' || file.name.endsWith('.html')) {
      console.log('📧 Processing HTML email receipt');
      const htmlContent = await this.fileToText(file);
      return await this.parseHTMLReceipt(htmlContent);
    }

    // Handle .eml files (raw email files)
    if (file.name.endsWith('.eml') || fileType === 'message/rfc822') {
      console.log('📧 Processing .eml email file');
      const emlContent = await this.fileToText(file);
      return await this.parseEMLFile(emlContent);
    }

    throw new Error('Unsupported file type. Please upload an image, PDF, or HTML file.');
  }

  /**
   * Parse HTML email content using AI to extract receipt data
   */
  private async parseHTMLReceipt(htmlContent: string): Promise<Omit<Receipt, 'id'>> {
    try {
      // Use AI to parse HTML email content
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.aiScanner['apiKey']}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Receipt Scanner App',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [
            {
              role: 'user',
              content: `Analyze this HTML email receipt and extract ALL transaction details. Return ONLY valid JSON:

{
  "merchant": "store or business name",
  "date": "MMM DD, YYYY format",
  "category": "Food|Supplies|Travel|Fuel|General",
  "total": 0.00,
  "subtotal": 0.00,
  "tax": 0.00,
  "discount": 0.00,
  "tip": 0.00,
  "paymentMethod": "Cash|Credit Card|Debit Card|Mobile Payment|Other",
  "items": [
    {
      "description": "item name",
      "price": 0.00,
      "quantity": 1
    }
  ]
}

HTML Content:
${htmlContent}

Rules:
- Extract merchant name from sender or header
- Find date in email content or headers
- Parse item list if present
- Extract total, subtotal, tax from HTML
- Identify payment method (last 4 digits, card type)
- Use exact category names: Food, Supplies, Travel, Fuel, or General
- Return ONLY JSON, no markdown`,
            }
          ],
          temperature: 0.1,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Clean markdown if present
      let jsonString = content.trim();
      if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/```json\s*/g, '');
        jsonString = jsonString.replace(/```\s*$/g, '');
      }

      const receiptData = JSON.parse(jsonString);

      // Build receipt object
      return {
        merchant: receiptData.merchant || 'Unknown Store',
        date: receiptData.date || this.formatDate(new Date()),
        category: receiptData.category || 'General',
        amount: parseFloat(receiptData.total || 0),
        score: this.calculateDefaultScore(receiptData.category),
        items: receiptData.items || [{ description: 'Email receipt', price: receiptData.total }],
        subtotal: parseFloat(receiptData.subtotal || 0),
        tax: parseFloat(receiptData.tax || 0),
        discount: receiptData.discount ? parseFloat(receiptData.discount) : undefined,
        tip: receiptData.tip ? parseFloat(receiptData.tip) : undefined,
        paymentMethod: receiptData.paymentMethod || undefined,
      };
    } catch (error) {
      console.error('Error parsing HTML receipt:', error);
      throw error;
    }
  }

  /**
   * Parse .eml file (raw email format)
   */
  private async parseEMLFile(emlContent: string): Promise<Omit<Receipt, 'id'>> {
    // Extract HTML part from .eml file
    const htmlMatch = emlContent.match(/<html[^>]*>[\s\S]*<\/html>/i);
    if (htmlMatch) {
      return await this.parseHTMLReceipt(htmlMatch[0]);
    }

    // If no HTML, try plain text
    const textMatch = emlContent.match(/Content-Type: text\/plain[\s\S]*?\n\n([\s\S]*?)(?=\n--)/);
    if (textMatch) {
      // Parse plain text receipt (future enhancement)
      throw new Error('Plain text email receipts not yet supported. Please use HTML or screenshot.');
    }

    throw new Error('Could not extract receipt data from .eml file');
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private fileToText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private calculateDefaultScore(category: string): number {
    switch (category) {
      case 'Supplies': return 75;
      case 'Travel': return 70;
      case 'Fuel': return 65;
      case 'Food': return 40;
      default: return 50;
    }
  }

  private formatDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
}
