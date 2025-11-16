import React, { useState, useRef } from 'react';
import { Camera as CameraIcon, X, Loader2, Image as ImageIcon, Mail } from 'lucide-react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Button } from './ui/button';
import { Receipt } from '../App';
import { AIReceiptScanner } from '../services/aiReceiptScanner';
import { EmailReceiptParser } from '../services/emailReceiptParser';
import { ReceiptConfirmationScreen } from './ReceiptConfirmationScreen';

interface ScanScreenProps {
  onAddReceipt?: (receipt: Omit<Receipt, 'id'>) => void;
  onClose?: () => void;
}

export function ScanScreen({ onAddReceipt, onClose }: ScanScreenProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedReceipt, setScannedReceipt] = useState<Omit<Receipt, 'id'> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    console.log('✨ ScanScreen MOUNTED');
    setIsMounted(true);
    return () => {
      console.log('💀 ScanScreen UNMOUNTING');
      setIsMounted(false);
    };
  }, []);

  console.log('🔄 ScanScreen RENDER - scannedReceipt state:', scannedReceipt, 'isMounted:', isMounted);

  // Initialize AI scanner with your OpenRouter API key
  // TODO: Add your API key to .env file as VITE_OPENROUTER_API_KEY
  // For testing, you can temporarily paste your key here: 'sk-or-v1-YOUR-KEY'
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';

  if (!apiKey) {
    console.error('⚠️ API key not found! Please add VITE_OPENROUTER_API_KEY to your .env file');
  }

  const aiScanner = new AIReceiptScanner(apiKey);
  const emailParser = new EmailReceiptParser(apiKey);

  const takePicture = async () => {
    if (isProcessing) return;

    console.log('📸 takePicture function called');
    let componentStillMounted = true;

    try {
      setIsProcessing(true);
      setError(null);

      console.log('📷 Opening camera...');
      // Take photo using Capacitor Camera
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      console.log('✅ Photo captured successfully, checking if component still mounted:', componentStillMounted);

      // Analyze receipt with AI
      if (photo.base64String) {
        console.log('🤖 Starting AI analysis...');
        const receipt = await aiScanner.analyzeReceipt(photo.base64String);
        console.log('✅ Receipt analyzed successfully:', receipt);

        // Verify receipt has all required fields
        if (!receipt.merchant || !receipt.date || typeof receipt.amount !== 'number') {
          console.error('❌ Invalid receipt data:', receipt);
          throw new Error('Received invalid receipt data from AI');
        }

        console.log('💾 Setting scanned receipt - confirmation screen should show');
        console.log('🔍 Component still mounted?', componentStillMounted);

        if (componentStillMounted) {
          setScannedReceipt(receipt);
          console.log('✅ State setter called with receipt:', receipt);
        } else {
          console.log('⚠️ Component unmounted, skipping state update');
        }

        // Force a re-render by also updating another state
        setTimeout(() => {
          console.log('⏰ 100ms after state update - checking if re-render happened');
        }, 100);
      } else {
        throw new Error('No image data received');
      }
    } catch (err: any) {
      console.error('❌ Error taking picture:', err);
      console.error('Error details:', { message: err.message, stack: err.stack });
      if (err.message !== 'User cancelled photos app') {
        const errorMessage = err.message || 'Failed to scan receipt. Please try again.';
        console.log('Setting error:', errorMessage);

        if (componentStillMounted) {
          setError(errorMessage);
        }

        // Show helpful message if API key is missing
        if (!apiKey && componentStillMounted) {
          setError('API key not configured. Please add your OpenRouter API key to the .env file.');
        }
      }
    } finally {
      console.log('🏁 Processing complete, setting isProcessing to false');
      if (componentStillMounted) {
        setIsProcessing(false);
      }
    }

    return () => {
      componentStillMounted = false;
    };
  };

  const chooseFromLibrary = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Choose photo from library
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
      });

      console.log('Photo selected from library');

      // Analyze receipt with AI
      if (photo.base64String) {
        const receipt = await aiScanner.analyzeReceipt(photo.base64String);
        console.log('Receipt analyzed:', receipt);

        setScannedReceipt(receipt);
      } else {
        throw new Error('No image data received');
      }
    } catch (err: any) {
      console.error('Error selecting photo:', err);
      if (err.message !== 'User cancelled photos app') {
        setError(err.message || 'Failed to scan receipt. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmailUpload = () => {
    // Trigger file input click
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || isProcessing) return;

    try {
      setIsProcessing(true);
      setError(null);

      console.log('📧 Processing email receipt file:', file.name, file.type);

      // Use email parser to handle different file types
      const receipt = await emailParser.parseEmailReceipt(file);
      console.log('✅ Email receipt analyzed:', receipt);

      setScannedReceipt(receipt);
    } catch (err: any) {
      console.error('❌ Error processing email receipt:', err);
      setError(err.message || 'Failed to process email receipt. Please try again.');
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRetake = () => {
    console.log('🔄 handleRetake called');
    setScannedReceipt(null);
    setError(null);
  };

  const handleConfirm = (receipt: Omit<Receipt, 'id'>) => {
    console.log('✅ handleConfirm called with receipt:', receipt);
    if (onAddReceipt) {
      onAddReceipt(receipt);
    }
    setScannedReceipt(null);
    if (onClose) {
      console.log('🚪 Closing scan screen after confirm');
      onClose();
    }
  };

  const handleClose = () => {
    console.log('❌ handleClose called (user cancelled)');
    setScannedReceipt(null);
    if (onClose) {
      onClose();
    }
  };

  // Show confirmation screen if receipt is scanned
  if (scannedReceipt) {
    console.log('✨ Rendering ReceiptConfirmationScreen with:', scannedReceipt);
    return (
      <ReceiptConfirmationScreen
        scannedReceipt={scannedReceipt}
        onRetake={handleRetake}
        onConfirm={handleConfirm}
        onClose={handleClose}
      />
    );
  }

  console.log('📷 Rendering ScanScreen camera view (no scanned receipt yet)');

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Camera Frame */}
      <div className="flex-1 relative">
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-12 right-4 z-10 p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-20 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
              <p className="text-white text-lg font-medium">Analyzing receipt...</p>
              <p className="text-white/70 text-sm mt-2">This may take a few seconds</p>
            </div>
          </div>
        )}

        {/* Camera viewfinder */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="relative w-full max-w-md aspect-[3/4] border-2 border-white/50 rounded-3xl">
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-3xl" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-3xl" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-3xl" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-3xl" />

            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6">
                <CameraIcon className="w-12 h-12 text-white/70" />
              </div>
            </div>
          </div>
        </div>

        {/* Helper text overlay */}
        <div className="absolute top-1/4 left-0 right-0 text-center px-8">
          <p className="text-white/90 bg-black/30 backdrop-blur-sm rounded-xl px-4 py-2 inline-block">
            Position receipt within frame
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="absolute bottom-32 left-0 right-0 px-8">
            <div className="bg-red-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-xl max-w-md mx-auto">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="px-8 pb-12 pt-8 bg-gradient-to-t from-black/80 to-transparent">
        <div className="max-w-md mx-auto space-y-4">
          <p className="text-center text-white/80">
            We'll turn this into a clean digital receipt and estimate tax write-off likelihood
          </p>

          <Button
            onClick={takePicture}
            disabled={isProcessing}
            className="w-full rounded-full py-7"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CameraIcon className="w-5 h-5 mr-2" />
                Scan Receipt
              </>
            )}
          </Button>

          <Button
            onClick={chooseFromLibrary}
            disabled={isProcessing}
            variant="ghost"
            className="w-full rounded-full py-7 text-white hover:bg-white/10"
          >
            <ImageIcon className="w-5 h-5 mr-2" />
            Choose from Library
          </Button>

          <Button
            onClick={handleEmailUpload}
            disabled={isProcessing}
            variant="ghost"
            className="w-full rounded-full py-7 text-white hover:bg-white/10"
          >
            <Mail className="w-5 h-5 mr-2" />
            Upload Email Receipt
          </Button>

          {/* Hidden file input for email receipts */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.html,.eml,message/rfc822"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
