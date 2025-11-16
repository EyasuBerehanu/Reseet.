import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { X } from 'lucide-react';

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
}: DigitalReceiptModalProps) {
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
        <div className="bg-white overflow-y-auto max-h-[80vh]">
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
                <div className="flex justify-between pt-2 border-t border-gray-300" style={{ fontSize: '14px' }}>
                  <span>TOTAL</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

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
        </div>
      </DialogContent>
    </Dialog>
  );
}
