# Camera Flow - Visual Guide

## ✅ Updated Configuration

**AI Model:** `google/gemini-2.0-flash-001` (as requested)

---

## 📸 Complete User Flow

### Step 1: Scan Screen
```
┌─────────────────────────────────────┐
│         [X] Close                   │
│                                     │
│   "Position receipt within frame"   │
│                                     │
│    ┌─────────────────────┐         │
│    │  ╔═══════════════╗  │         │
│    │  ║               ║  │         │
│    │  ║               ║  │         │
│    │  ║   📷 Camera   ║  │         │
│    │  ║   Viewfinder  ║  │         │
│    │  ║               ║  │         │
│    │  ╚═══════════════╝  │         │
│    └─────────────────────┘         │
│                                     │
│  "We'll turn this into a clean      │
│   digital receipt..."               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📷 Scan Receipt            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🖼️  Choose from Library    │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Step 2: Processing (after taking photo)
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│          ⏳ (spinning)              │
│                                     │
│      Analyzing receipt...           │
│                                     │
│    This may take a few seconds      │
│                                     │
│                                     │
└─────────────────────────────────────┘
```
**Duration:** 2-5 seconds

### Step 3: Confirmation Screen (Read-Only Summary)
```
┌─────────────────────────────────────┐
│  [X]  Confirm Receipt            │
├─────────────────────────────────────┤
│                                     │
│  Merchant                           │
│  Starbucks Coffee                   │
│                                     │
│  Date              Category         │
│  Jan 15, 2024      [Food]           │
│                                     │
├─────────────────────────────────────┤
│  Total Amount                       │
│  $12.45                             │
├─────────────────────────────────────┤
│  Items                              │
│  Latte........................ $5.95│
│  Qty: 1                             │
│                                     │
│  Sandwich.................... $5.55│
│  Qty: 1                             │
│                                     │
│  ─────────────────────────────      │
│  Subtotal................... $11.50│
│  Tax......................... $0.95│
├─────────────────────────────────────┤
│  Write-off Score                    │
│  35%                                │
│  ████░░░░░░░░░░░░░░░░░ (red)       │
│  Low likelihood to qualify          │
├─────────────────────────────────────┤
│                                     │
│  [ ↻ Retake ]  [ ✓ Looks Good ]   │
│                                     │
└─────────────────────────────────────┘
```

**Note:** All fields are **display-only** (not editable)

---

## 🎯 User Actions

### On Confirmation Screen:

#### Option 1: Retake
```
User taps "Retake"
    ↓
Returns to Scan Screen
    ↓
Can take new photo
```

#### Option 2: Looks Good
```
User taps "Looks Good"
    ↓
Receipt saved to app
    ↓
Returns to Home Screen
    ↓
Receipt appears in list
```

---

## 📊 What Gets Extracted (Non-Editable)

| Field | Example | Editable? |
|-------|---------|-----------|
| Merchant | "Starbucks Coffee" | ❌ No |
| Date | "Jan 15, 2024" | ❌ No |
| Category | "Food" | ❌ No |
| Total | $12.45 | ❌ No |
| Items | Latte - $5.95 | ❌ No |
| Subtotal | $11.50 | ❌ No |
| Tax | $0.95 | ❌ No |
| Score | 35% | ❌ No |

**All data is read-only.** User can only:
- ✅ Accept the data ("Looks Good")
- ✅ Reject and retake ("Retake")

---

## 🤖 AI Processing Details

### Model Configuration
```typescript
{
  model: 'google/gemini-2.0-flash-001',
  temperature: 0.1,  // Low = consistent results
  max_tokens: 2000
}
```

### What AI Sees
1. Base64-encoded receipt image
2. Instructions to extract:
   - Merchant name
   - Date (MMM DD, YYYY format)
   - Category (Food/Supplies/Travel/Fuel/General)
   - Items with prices and quantities
   - Subtotal, tax, total

### What AI Returns
```json
{
  "merchant": "Starbucks Coffee",
  "date": "Jan 15, 2024",
  "category": "Food",
  "total": 12.45,
  "subtotal": 11.50,
  "tax": 0.95,
  "items": [
    { "description": "Latte", "price": 5.95, "quantity": 1 },
    { "description": "Sandwich", "price": 5.55, "quantity": 1 }
  ]
}
```

---

## 🎨 Visual States

### 1. Idle State (Waiting for Photo)
- Black background
- White viewfinder frame
- Corner markers
- Helper text visible
- Buttons enabled

### 2. Processing State
- Dark overlay (70% opacity)
- Spinning loader
- "Analyzing receipt..." text
- Buttons disabled

### 3. Error State
- Red error banner at bottom
- Error message displayed
- Buttons re-enabled
- Can retry

### 4. Confirmation State
- White background
- Clean card-based layout
- Color-coded score bar
- Two action buttons

---

## 🎨 Score Colors

| Score Range | Color | Progress Bar | Text Color |
|-------------|-------|--------------|------------|
| 70-100% | Green | `bg-green-500` | `text-green-600` |
| 40-69% | Orange | `bg-orange-500` | `text-orange-600` |
| 0-39% | Red | `bg-red-500` | `text-red-600` |

### Example Displays

**High Score (Supplies - 72%):**
```
72%
████████████████████░░ (green)
High likelihood to qualify as a business expense
```

**Medium Score (Travel - 58%):**
```
58%
████████████░░░░░░░░░░ (orange)
Moderate likelihood to qualify as a business expense
```

**Low Score (Food - 35%):**
```
35%
███████░░░░░░░░░░░░░░░ (red)
Low likelihood to qualify as a business expense
```

---

## 🔄 Complete Technical Flow

```
1. User taps "Scan Receipt"
        ↓
2. Native iOS camera opens
        ↓
3. User takes photo
        ↓
4. Photo → base64 encoding
        ↓
5. Show processing overlay
        ↓
6. HTTP POST to OpenRouter
   - API: openrouter.ai/api/v1/chat/completions
   - Model: google/gemini-2.0-flash-001
   - Body: { image: base64, prompt: "extract receipt data" }
        ↓
7. Gemini analyzes image (2-5 sec)
        ↓
8. Returns JSON response
        ↓
9. Parse JSON → Receipt object
        ↓
10. Calculate score based on category
        ↓
11. Navigate to Confirmation Screen
        ↓
12. Display read-only summary
        ↓
13. User chooses:
    - "Retake" → back to step 1
    - "Looks Good" → save & go home
```

---

## ✅ Confirmation Screen Features

### Layout Sections
1. **Header**
   - Close button (X)
   - "Confirm Receipt" title

2. **Merchant Card**
   - Large merchant name
   - Date and category badges

3. **Amount Card**
   - Large total amount display

4. **Items Card**
   - List of line items
   - Prices and quantities
   - Subtotal and tax breakdown

5. **Score Card**
   - Percentage display
   - Color-coded progress bar
   - Likelihood description

6. **Actions Footer** (fixed at bottom)
   - Retake button (outline style)
   - Looks Good button (green, filled)

### All Text is Display-Only
- No input fields
- No text boxes
- No editable areas
- Pure read-only display

---

## 🚀 Ready to Test!

1. Open Xcode (already opened)
2. Add your OpenRouter API key to `.env`
3. Build and run on device (Cmd+R)
4. Navigate to Scan screen
5. Take a photo of any receipt
6. See the AI extract all data
7. Review the **non-editable** summary
8. Tap "Looks Good" to save!

---

**Model:** `google/gemini-2.0-flash-001` ✅
**Confirmation:** Read-only display ✅
**Flow:** Take → Process → Review → Accept/Retake ✅
