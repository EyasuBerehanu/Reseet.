import { Receipt } from '../App';

export interface ReceiptItem {
  description: string;
  quantity?: number;
  price: number;
}

export class AIReceiptScanner {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeReceipt(base64Image: string): Promise<Omit<Receipt, 'id'>> {
    try {
      // Send image to Gemini 2.0 Flash via OpenRouter
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Receipt Scanner App',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this receipt image and extract ALL available information. Return ONLY valid JSON with no markdown formatting or code blocks:

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

Rules:
- Use exact category names: Food, Supplies, Travel, Fuel, or General
- Format date as "MMM DD, YYYY" (e.g., "Jan 15, 2024")
- All prices as numbers with 2 decimals
- Extract merchant name from top of receipt
- Look for discount/coupon amounts and include in "discount" field
- Look for tip, gratuity, or service charge and include in "tip" field
- Identify payment method from receipt (credit, debit, cash, etc.)
- Common payment indicators: last 4 digits of card, "VISA", "MASTERCARD", "DEBIT", "CASH", "AMEX"
- If payment method not visible, omit the field or set to "Unknown"
- If no discount or tip, set to 0.00
- If no items are clearly visible, create one item with subtotal amount
- Return ONLY the JSON object, no other text`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          temperature: 0.1,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Extract JSON from response
      const content = data.choices[0].message.content;

      // Clean markdown if present
      let jsonString = content.trim();
      if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/```json\s*/g, '');
        jsonString = jsonString.replace(/```\s*$/g, '');
      }

      const receiptData = JSON.parse(jsonString);

      // Extract items
      const items: ReceiptItem[] = [];
      if (receiptData.items && Array.isArray(receiptData.items)) {
        for (const item of receiptData.items) {
          items.push({
            description: item.description || 'Item',
            price: parseFloat(item.price || 0),
            quantity: item.quantity,
          });
        }
      }

      // Extract data for scoring
      const merchant = receiptData.merchant || 'Unknown Store';
      const category = receiptData.category || 'General';
      const amount = parseFloat(receiptData.total || 0);
      const finalItems = items.length > 0 ? items : [
        {
          description: 'Scanned item',
          price: amount,
        }
      ];

      // Calculate write-off score based on all available data
      const score = this.calculateScore(category, merchant, amount, finalItems);

      return {
        merchant,
        date: receiptData.date || this.formatDate(new Date()),
        category,
        amount,
        score,
        items: finalItems,
        subtotal: parseFloat(receiptData.subtotal || 0),
        tax: parseFloat(receiptData.tax || 0),
        discount: receiptData.discount ? parseFloat(receiptData.discount) : undefined,
        tip: receiptData.tip ? parseFloat(receiptData.tip) : undefined,
        paymentMethod: receiptData.paymentMethod || undefined,
        imageUrl: `data:image/jpeg;base64,${base64Image}`, // Store original photo
      };
    } catch (error) {
      console.error('Error analyzing receipt:', error);
      throw error;
    }
  }

  private calculateScore(
    category: string,
    merchant?: string,
    amount?: number,
    items?: ReceiptItem[]
  ): number {
    // Base score by category (0-100 scale)
    let baseScore = 0;
    switch (category) {
      case 'Supplies':
        baseScore = 75; // Office/business supplies highly deductible
        break;
      case 'Travel':
        baseScore = 70; // Business travel deductible
        break;
      case 'Fuel':
        baseScore = 65; // Vehicle expenses deductible with mileage logs
        break;
      case 'Food':
        baseScore = 40; // Limited to 50% typically, needs business context
        break;
      default:
        baseScore = 50; // General expenses
    }

    // Merchant-based adjustments (+/- 15 points)
    const merchantLower = (merchant || '').toLowerCase();
    let merchantBonus = 0;

    // High likelihood merchants
    if (merchantLower.includes('office') ||
        merchantLower.includes('depot') ||
        merchantLower.includes('staples') ||
        merchantLower.includes('fedex') ||
        merchantLower.includes('ups') ||
        merchantLower.includes('usps')) {
      merchantBonus = 15;
    }
    // Airlines, hotels, car rentals
    else if (merchantLower.includes('airline') ||
             merchantLower.includes('hotel') ||
             merchantLower.includes('rental') ||
             merchantLower.includes('uber') ||
             merchantLower.includes('lyft')) {
      merchantBonus = 10;
    }
    // Gas stations
    else if (merchantLower.includes('shell') ||
             merchantLower.includes('chevron') ||
             merchantLower.includes('exxon') ||
             merchantLower.includes('bp ') ||
             merchantLower.includes('gas')) {
      merchantBonus = 5;
    }
    // Personal merchants (likely not deductible)
    else if (merchantLower.includes('grocery') ||
             merchantLower.includes('safeway') ||
             merchantLower.includes('walmart') ||
             merchantLower.includes('target') ||
             merchantLower.includes('costco')) {
      merchantBonus = -10;
    }
    // Restaurants/coffee (typically 50% deductible)
    else if (merchantLower.includes('restaurant') ||
             merchantLower.includes('cafe') ||
             merchantLower.includes('coffee') ||
             merchantLower.includes('starbucks')) {
      merchantBonus = -5;
    }

    // Amount-based adjustments (+/- 10 points)
    let amountBonus = 0;
    if (amount) {
      if (amount < 75) {
        // Small purchases might be personal
        amountBonus = -5;
      } else if (amount > 500) {
        // Large purchases more likely business
        amountBonus = 5;
      } else if (amount > 200) {
        amountBonus = 2;
      }
    }

    // Item-based analysis (+/- 5 points)
    let itemBonus = 0;
    if (items && items.length > 0) {
      const itemDescriptions = items.map(i => i.description.toLowerCase()).join(' ');

      // Business-related items
      if (itemDescriptions.includes('paper') ||
          itemDescriptions.includes('ink') ||
          itemDescriptions.includes('folder') ||
          itemDescriptions.includes('pen') ||
          itemDescriptions.includes('notebook') ||
          itemDescriptions.includes('envelope')) {
        itemBonus = 5;
      }
      // Personal items
      else if (itemDescriptions.includes('candy') ||
               itemDescriptions.includes('soda') ||
               itemDescriptions.includes('chips') ||
               itemDescriptions.includes('personal')) {
        itemBonus = -5;
      }
    }

    // Calculate final score with bounds [0, 100]
    const finalScore = Math.max(0, Math.min(100,
      baseScore + merchantBonus + amountBonus + itemBonus
    ));

    console.log('📊 Score calculation:', {
      category,
      merchant,
      amount,
      baseScore,
      merchantBonus,
      amountBonus,
      itemBonus,
      finalScore
    });

    return Math.round(finalScore);
  }

  private formatDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
}
