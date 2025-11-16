import React from 'react';
import { X, RotateCcw, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Receipt } from '../App';

interface ReceiptConfirmationScreenProps {
  scannedReceipt: Omit<Receipt, 'id'>;
  onRetake: () => void;
  onConfirm: (receipt: Omit<Receipt, 'id'>) => void;
  onClose: () => void;
}

export function ReceiptConfirmationScreen({
  scannedReceipt,
  onRetake,
  onConfirm,
  onClose,
}: ReceiptConfirmationScreenProps) {
  console.log('🎉 ReceiptConfirmationScreen MOUNTED with receipt:', scannedReceipt);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  // Generate receipt number from timestamp
  const receiptNumber = `${Date.now().toString().slice(-8)}`;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Confirm Receipt</h1>
          <div className="w-10" /> {/* spacer */}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '220px' }}>
        <div className="max-w-md mx-auto px-4 py-6 space-y-6">

          {/* Receipt Paper */}
          <div className="bg-white shadow-lg mx-auto max-w-sm px-6 py-8 space-y-4" style={{ fontFamily: 'monospace' }}>
            <div className="text-center border-b-2 border-dashed border-gray-300 pb-4">
              <div className="mb-2" style={{ fontSize: '18px', letterSpacing: '0.5px' }}>
                {scannedReceipt.merchant.toUpperCase()}
              </div>
              <div className="text-gray-600" style={{ fontSize: '11px' }}>
                {scannedReceipt.date}
              </div>
              <div className="text-gray-600 mt-1" style={{ fontSize: '11px' }}>
                Receipt #{receiptNumber}
              </div>
              <div className="text-gray-600 mt-1" style={{ fontSize: '11px' }}>
                Category: {scannedReceipt.category}
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 border-b-2 border-dashed border-gray-300 pb-4">
              {scannedReceipt.items.map((item, index) => (
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
              {scannedReceipt.subtotal > 0 && (
                <div className="flex justify-between" style={{ fontSize: '12px' }}>
                  <span>SUBTOTAL</span>
                  <span>${scannedReceipt.subtotal.toFixed(2)}</span>
                </div>
              )}
              {scannedReceipt.tax > 0 && (
                <div className="flex justify-between" style={{ fontSize: '12px' }}>
                  <span>TAX</span>
                  <span>${scannedReceipt.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-300" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                <span>TOTAL</span>
                <span>${scannedReceipt.amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-gray-500 pt-2" style={{ fontSize: '10px' }}>
              THANK YOU FOR YOUR BUSINESS
            </div>
          </div>

          {/* Score Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="space-y-4">
              {/* Percentage displayed prominently above */}
              <div className="text-center">
                <span className={`text-5xl font-bold ${getScoreTextColor(scannedReceipt.score)}`}>
                  {scannedReceipt.score}%
                </span>
              </div>

              {/* Label below percentage */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">Write-off Likelihood</h3>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${getScoreColor(scannedReceipt.score)} transition-all duration-500`}
                  style={{ width: `${scannedReceipt.score}%` }}
                />
              </div>

              <p className="text-sm text-gray-600 text-center">
                {scannedReceipt.score >= 70 && 'High likelihood to qualify as a business expense'}
                {scannedReceipt.score >= 40 && scannedReceipt.score < 70 && 'Moderate likelihood to qualify as a business expense'}
                {scannedReceipt.score < 40 && 'Low likelihood to qualify as a business expense'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pb-8">
            <Button
              onClick={onRetake}
              variant="outline"
              className="flex-1 rounded-full py-6 text-base font-semibold"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Retake
            </Button>
            <Button
              onClick={() => onConfirm(scannedReceipt)}
              className="flex-1 rounded-full py-6 text-base font-semibold text-white"
              style={{ backgroundColor: '#16a34a' }}
            >
              <Check className="w-5 h-5 mr-2" />
              Looks Good
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
