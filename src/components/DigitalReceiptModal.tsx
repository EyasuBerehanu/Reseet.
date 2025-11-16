import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, FileText } from 'lucide-react';

interface ReceiptItem {
  description: string;
  quantity?: number;
  price: number;
}

interface DigitalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchant: string;
  date: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  category?: string;
  receiptNumber?: string;
  imageUrl?: string; // Original photo of the receipt
  discount?: number;
  tip?: number;
  paymentMethod?: string;
}

export function DigitalReceiptModal({
  isOpen,
  onClose,
  merchant,
  date,
  items,
  subtotal,
  tax,
  total,
  category,
  receiptNumber = 'RCP-2025-11-001',
  imageUrl,
  discount,
  tip,
  paymentMethod,
}: DigitalReceiptModalProps) {
  const [viewMode, setViewMode] = useState<'digitized' | 'photo'>('digitized');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && viewMode === 'digitized' && imageUrl) {
      setViewMode('photo');
    } else if (isRightSwipe && viewMode === 'photo') {
      setViewMode('digitized');
    }
  };

  const toggleView = () => {
    setViewMode(prev => prev === 'digitized' ? 'photo' : 'digitized');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 gap-0 bg-white border-0 overflow-hidden">
        {/* Accessibility - visually hidden but available to screen readers */}
        <DialogTitle className="sr-only">
          Receipt from {merchant}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Digital receipt showing purchase details from {merchant} on {date}
        </DialogDescription>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-2 bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Close receipt"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>

        {/* Receipt Container - with paper-like appearance */}
        <div
          className="bg-white overflow-y-auto max-h-[80vh]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {viewMode === 'photo' && imageUrl ? (
            // Original Photo View
            <div className="flex items-center justify-center min-h-[60vh] p-4">
              <img
                src={imageUrl}
                alt="Original receipt photo"
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
              />
            </div>
          ) : (
            // Digitized Receipt View
            <>
              {/* Paper texture/shadow effect */}
              <div className="mx-auto max-w-[280px] bg-white shadow-2xl">
                {/* Receipt content */}
                <div className="px-6 py-8 space-y-4" style={{ fontFamily: 'monospace' }}>
              {/* Store Header */}
              <div className="text-center border-b-2 border-dashed border-gray-300 pb-4">
                <div className="mb-2" style={{ fontSize: '18px', letterSpacing: '0.5px' }}>
                  {merchant.toUpperCase()}
                </div>
                <div className="text-gray-600" style={{ fontSize: '11px' }}>
                  {date}
                </div>
                <div className="text-gray-600 mt-1" style={{ fontSize: '11px' }}>
                  Receipt #{receiptNumber}
                </div>
                {category && (
                  <div className="text-gray-600 mt-1" style={{ fontSize: '11px' }}>
                    Category: {category}
                  </div>
                )}
              </div>

              {/* Line Items */}
              <div className="space-y-2 border-b-2 border-dashed border-gray-300 pb-4">
                {items.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between" style={{ fontSize: '12px' }}>
                      <span className="flex-1 pr-2">{item.description}</span>
                      <span className="text-right whitespace-nowrap">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    {item.quantity && item.quantity > 1 && (
                      <div className="text-gray-500 ml-2" style={{ fontSize: '10px' }}>
                        {item.quantity} × ${(item.price / item.quantity).toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 border-b-2 border-dashed border-gray-300 pb-4">
                <div className="flex justify-between" style={{ fontSize: '12px' }}>
                  <span>SUBTOTAL</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between" style={{ fontSize: '12px' }}>
                  <span>TAX</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {discount && discount > 0 && (
                  <div className="flex justify-between" style={{ fontSize: '12px' }}>
                    <span>DISCOUNT</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                {tip && tip > 0 && (
                  <div className="flex justify-between" style={{ fontSize: '12px' }}>
                    <span>TIP</span>
                    <span>${tip.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-300" style={{ fontSize: '14px' }}>
                  <span>TOTAL</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              {paymentMethod && (
                <div className="pt-2 pb-4 border-b-2 border-dashed border-gray-300">
                  <div className="flex justify-between" style={{ fontSize: '12px' }}>
                    <span>PAYMENT METHOD</span>
                    <span className="font-semibold">{paymentMethod.toUpperCase()}</span>
                  </div>
                </div>
              )}

              {/* Barcode representation */}
              <div className="pt-2">
                <div className="flex justify-center gap-px mb-2">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-900"
                      style={{
                        width: '2px',
                        height: Math.random() > 0.5 ? '40px' : '30px',
                      }}
                    />
                  ))}
                </div>
                <div className="text-center text-gray-600" style={{ fontSize: '10px' }}>
                  {receiptNumber.replace(/-/g, '')}
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-gray-500 pt-2" style={{ fontSize: '10px' }}>
                THANK YOU FOR YOUR BUSINESS
              </div>
                </div>
              </div>
            </>
          )}

          {/* View toggle buttons - centered below content, only show if image exists */}
          {imageUrl && (
            <div className="flex justify-center gap-3 py-6">
              <button
                onClick={() => setViewMode('digitized')}
                className={`rounded-full p-3 transition-colors ${
                  viewMode === 'digitized'
                    ? 'bg-[#558E00] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                aria-label="Show digitized receipt"
              >
                <FileText className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('photo')}
                className={`rounded-full p-3 transition-colors ${
                  viewMode === 'photo'
                    ? 'bg-[#558E00] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                aria-label="Show original photo"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
