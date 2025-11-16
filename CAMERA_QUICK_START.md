# Camera System - Quick Start

## 🚀 Get Started in 3 Steps

### 1. Add Your API Key

Edit `.env`:
```env
VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

Get a free key at: [https://openrouter.ai/](https://openrouter.ai/)

### 2. Build & Sync

```bash
npm run build
npx cap sync ios
```

### 3. Run in Xcode

```bash
open ios/App/App.xcworkspace
```

Press **Cmd+R** to run on your device.

---

## 📸 How the Camera Works

### User Flow
1. Tap "Scan" in navigation
2. Choose "Scan Receipt" or "Choose from Library"
3. Camera opens (native iOS)
4. Take photo
5. AI extracts receipt data (2-5 seconds)
6. Review on confirmation screen
7. Tap "Looks Good" to save

### What Gets Extracted
- ✅ Merchant name
- ✅ Date (formatted as "MMM DD, YYYY")
- ✅ Category (Food/Supplies/Travel/Fuel/General)
- ✅ Line items with prices
- ✅ Subtotal, tax, total
- ✅ Write-off score (0-100%)

---

## 🎯 Components Overview

| File | Purpose |
|------|---------|
| `ScanScreen.tsx` | Camera UI + capture |
| `ReceiptConfirmationScreen.tsx` | Review extracted data |
| `aiReceiptScanner.ts` | AI integration |
| `Info.plist` | iOS permissions |

---

## 🔧 Key Features

### Transparent UI
- Black camera background
- Semi-transparent overlays
- Glassmorphism effects
- Corner frame markers

### Processing States
- Loading spinner during AI analysis
- Error messages for failures
- Success flow to confirmation

### Write-off Scores
- **72%** (Green) - Supplies
- **65%** (Orange) - Fuel
- **58%** (Orange) - Travel
- **50%** (Orange) - General
- **35%** (Red) - Food

---

## 🛠 Troubleshooting

**Camera won't open:**
- Run on real device (not simulator)
- Check camera permissions in iOS Settings

**"API request failed":**
- Verify API key in `.env`
- Check internet connection

**Build errors:**
```bash
cd ios/App
pod install
cd ../..
npm run build
npx cap sync ios
```

---

## 📱 Test on Device

1. Connect iPhone via USB
2. In Xcode: Select your device from dropdown
3. Press **Cmd+R**
4. Grant camera permissions when prompted
5. Navigate to Scan screen
6. Take photo of any receipt
7. Watch AI extract the data!

---

## 💡 Pro Tips

- Use good lighting for best OCR results
- Keep receipt flat and fully visible
- The AI can handle crumpled receipts
- Works with photos from library too
- Free during Gemini 2.0 experimental period

---

**Ready to scan! 🎉**

For detailed documentation, see [CAMERA_SETUP.md](./CAMERA_SETUP.md)
