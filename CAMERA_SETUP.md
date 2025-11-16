# Camera System Setup Guide

Your camera system is now fully configured and ready to use! Here's everything you need to know.

## What's Been Implemented

### 1. **Camera Integration** (@capacitor/camera)
- Native iOS camera access
- Photo library access
- Direct camera capture
- Image selection from library

### 2. **AI Receipt Scanner Service** (`src/services/aiReceiptScanner.ts`)
- Powered by Gemini 2.0 Flash via OpenRouter
- Extracts merchant, date, category, items, prices
- Calculates tax write-off likelihood scores
- Returns structured receipt data

### 3. **Scan Screen** (`src/components/ScanScreen.tsx`)
- Full-screen camera UI with transparent overlays
- Live camera preview
- "Scan Receipt" button - opens camera
- "Choose from Library" button - opens photo library
- Processing overlay with loading spinner
- Error handling and display

### 4. **Confirmation Screen** (`src/components/ReceiptConfirmationScreen.tsx`)
- Displays extracted receipt data
- Shows merchant, date, category
- Lists all items with prices
- Displays subtotal and tax
- Write-off score with color-coded progress bar
- "Retake" and "Looks Good" buttons

### 5. **iOS Permissions** (configured in `ios/App/App/Info.plist`)
- Camera access permission
- Photo library read permission
- Photo library write permission

## Setup Instructions

### Step 1: Get Your OpenRouter API Key

1. Go to [https://openrouter.ai/](https://openrouter.ai/)
2. Sign up for a free account
3. Navigate to "Keys" section
4. Create a new API key
5. Copy the API key

### Step 2: Configure API Key

Open the `.env` file in the project root and add your API key:

```env
VITE_OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here
```

### Step 3: Rebuild and Sync

```bash
npm run build
npx cap sync ios
```

### Step 4: Run in Xcode

1. Open the project in Xcode:
   ```bash
   open ios/App/App.xcworkspace
   ```

2. Select your device or simulator

3. Press **Cmd+R** to build and run

## How It Works

### Complete Flow

```
User opens Scan screen
    ↓
Presses "Scan Receipt" or "Choose from Library"
    ↓
Camera/Photo Picker opens (native iOS)
    ↓
User takes photo or selects from library
    ↓
Image converted to base64
    ↓
Sent to Gemini 2.0 Flash AI (via OpenRouter)
    ↓
AI extracts:
  - Merchant name
  - Date
  - Category (Food/Supplies/Travel/Fuel/General)
  - Items with prices
  - Subtotal, tax, total
    ↓
Calculate write-off score based on category
    ↓
Display on Confirmation Screen
    ↓
User can "Retake" or "Looks Good"
    ↓
Receipt saved to app (with unique ID)
    ↓
Returns to Home screen
```

### Write-off Score Calculation

The system automatically assigns scores based on category:

| Category | Score | Color  | Likelihood |
|----------|-------|--------|------------|
| Supplies | 72%   | Green  | High       |
| Fuel     | 65%   | Orange | Medium     |
| Travel   | 58%   | Orange | Medium     |
| General  | 50%   | Orange | Medium     |
| Food     | 35%   | Red    | Low        |

## File Structure

```
src/
├── components/
│   ├── ScanScreen.tsx              # Main camera interface
│   └── ReceiptConfirmationScreen.tsx # Review scanned data
├── services/
│   └── aiReceiptScanner.ts         # AI integration
└── App.tsx                          # Updated with receipt handling

ios/
└── App/
    └── App/
        └── Info.plist               # iOS permissions
```

## Key Features

### Transparent Overlays
- Camera viewfinder with corner markers
- Processing overlay (70% dark, semi-transparent)
- Helper text with backdrop blur
- Error messages with red backdrop

### Error Handling
- User cancellation (silent fail)
- Network errors (displayed to user)
- Invalid image data (displayed to user)
- AI parsing errors (displayed to user)

### State Management
- `isProcessing` - Shows loading overlay
- `scannedReceipt` - Stores extracted data
- `error` - Displays error messages

## Testing the Camera

### On iOS Simulator
The camera won't work on simulator, but you can:
1. Use "Choose from Library" button
2. Add sample images to simulator via Xcode

### On Real Device
1. Connect iPhone via cable
2. Select device in Xcode
3. Build and run
4. Grant camera permissions when prompted
5. Take a photo of any receipt

## Troubleshooting

### "No camera access"
- Check iOS Settings > Privacy > Camera
- Ensure app has permission enabled

### "API request failed"
- Verify API key in `.env` file
- Check internet connection
- Verify OpenRouter account has credits

### Build fails in Xcode
```bash
cd ios/App
pod install
```

### Camera not appearing
- Run on real device (not simulator)
- Check Info.plist has NSCameraUsageDescription

## API Costs

**Gemini 2.0 Flash via OpenRouter:**
- Model: `google/gemini-2.0-flash-exp:free`
- Cost: **FREE** (during experimental period)
- Rate limits: Check OpenRouter dashboard

## Next Steps

You can enhance this further by:
1. Storing receipt images locally
2. Adding manual editing of extracted data
3. Implementing OCR fallback
4. Adding batch scanning
5. Cloud backup integration

## Support

If you encounter issues:
1. Check Xcode console for errors
2. Enable Chrome DevTools for web debugging
3. Check OpenRouter API logs
4. Verify all dependencies are installed

---

**Your camera system is ready to scan receipts!** 📸✨
