import React from 'react';
import { Receipt } from '../App';
import { excelExportService } from '../services/excelExportService';
import { Download } from 'lucide-react';

interface DeductsScreenProps {
  receipts: Receipt[];
  userEmail?: string;
}

export function DeductsScreen({ receipts, userEmail }: DeductsScreenProps) {
  const [selectedTimeWindow, setSelectedTimeWindow] = React.useState<string>('monthly');
  const [customDays, setCustomDays] = React.useState<number>(30);
  const [isGenerating, setIsGenerating] = React.useState(false);

  // Calculate spending by category
  const getSpendingByCategory = () => {
    const categoryTotals: { [key: string]: number } = {};

    receipts.forEach(receipt => {
      const category = receipt.category || 'General';
      categoryTotals[category] = (categoryTotals[category] || 0) + receipt.amount;
    });

    // Convert to array and sort by amount descending
    const categoryArray = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
    }));

    categoryArray.sort((a, b) => b.amount - a.amount);

    // Take top 4 categories
    return categoryArray.slice(0, 4);
  };

  const spendingData = getSpendingByCategory();
  const maxAmount = spendingData.length > 0 ? spendingData[0].amount : 1;

  // Category colors
  const categoryColors: { [key: string]: string } = {
    'Food': '#558E00',
    'Travel': '#3b82f6',
    'Supplies': '#8b5cf6',
    'Fuel': '#f59e0b',
    'General': '#6b7280',
  };

  const handleTimeWindowSelect = (window: string) => {
    setSelectedTimeWindow(window);
  };

  const handleGenerateReport = async () => {
    console.log('🖱️ Generate Report button clicked!');
    console.log('📊 Current state:', {
      receiptsCount: receipts.length,
      isGenerating,
      selectedTimeWindow,
      customDays,
    });

    try {
      setIsGenerating(true);
      console.log('📊 Generating tax report with', receipts.length, 'receipts');

      // Filter receipts based on selected time window
      const filteredReceipts = filterReceiptsByTimeWindow(receipts, selectedTimeWindow, customDays);

      if (filteredReceipts.length === 0) {
        alert('No receipts found for the selected time period.');
        setIsGenerating(false);
        return;
      }

      // Generate and download/share Excel file
      const filename = await excelExportService.generateTaxReport(filteredReceipts, userEmail);

      console.log('✅ Tax report generated successfully:', filename);
      alert(`Tax report generated! ${filename}`);
    } catch (error) {
      console.error('❌ Error generating tax report:', error);
      alert('Failed to generate tax report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const filterReceiptsByTimeWindow = (
    allReceipts: Receipt[],
    timeWindow: string,
    customDaysValue: number
  ): Receipt[] => {
    const now = new Date();
    const cutoffDate = new Date();

    switch (timeWindow) {
      case 'weekly':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarterly':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case 'yearly':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom':
        cutoffDate.setDate(now.getDate() - customDaysValue);
        break;
      default:
        return allReceipts;
    }

    return allReceipts.filter((receipt) => {
      const receiptDate = new Date(receipt.date);
      return receiptDate >= cutoffDate;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-8">
      <div className="max-w-md mx-auto px-4 pt-12">
        <h1 className="text-[rgb(0,0,0)] text-[36px] font-bold mb-8">
          Deducts
        </h1>

        <div className="flex flex-col gap-4 items-center">
          {/* Time Window Selection */}
          <div className="w-full bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-7">
            {/* Title and Subtitle */}
            <div className="text-center mb-6">
              <h2 className="text-gray-800 mb-1">Select Time Window</h2>
              <p className="text-gray-500 text-sm">Choose how you want your report grouped</p>
            </div>
            
            {/* Time Window Buttons Row */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {['Weekly', 'Monthly', 'Quarterly', 'Yearly'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleTimeWindowSelect(option.toLowerCase())}
                  className={`px-4 py-3 rounded-full transition-all duration-300 ${
                    selectedTimeWindow === option.toLowerCase()
                      ? 'bg-[#558E00] text-white shadow-[0_4px_14px_rgba(85,142,0,0.35)]'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            
            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-5"></div>
            
            {/* Custom Range Button */}
            <button
              onClick={() => handleTimeWindowSelect('custom')}
              className={`w-full px-5 py-3.5 rounded-full transition-all duration-300 ${
                selectedTimeWindow === 'custom'
                  ? 'bg-[#558E00] text-white shadow-[0_4px_14px_rgba(85,142,0,0.35)]'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#558E00] hover:text-[#558E00] hover:shadow-sm'
              }`}
            >
              Custom Range
            </button>
            
            {/* Expandable Date Picker Section */}
            <div 
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                selectedTimeWindow === 'custom' ? 'max-h-48 opacity-100 mt-5' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="space-y-4 pt-1">
                {/* Days Input */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2 ml-1">
                    Number of Days (from today)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={customDays}
                    onChange={(e) => setCustomDays(parseInt(e.target.value) || 1)}
                    placeholder="e.g., 30, 60, 90"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#558E00] focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-2 ml-1">
                    Showing data from the last {customDays} day{customDays !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Generate Tax Report Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleGenerateReport();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleGenerateReport();
            }}
            disabled={isGenerating || receipts.length === 0}
            className={`w-full h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center gap-3 transition-all relative z-10 ${
              isGenerating || receipts.length === 0
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-xl hover:bg-[#558E00] hover:text-white cursor-pointer active:scale-95'
            }`}
            style={{ pointerEvents: 'auto', touchAction: 'manipulation' }}
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">
              {isGenerating ? 'Generating Report...' : 'Generate Tax Report Now'}
            </span>
            {receipts.length === 0 && (
              <span className="absolute top-full left-0 right-0 text-xs text-red-500 mt-1">
                No receipts available
              </span>
            )}
          </button>
          
          {/* Spending Habits Section */}
          <div className="w-full bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-7">
            <h2 className="text-gray-800 mb-6">Spending Habits</h2>

            {spendingData.length > 0 ? (
              <div className="space-y-4">
                {spendingData.map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">{item.category}</span>
                      <span className="text-gray-800">${item.amount.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(item.amount / maxAmount) * 100}%`,
                          backgroundColor: categoryColors[item.category] || '#6b7280'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No spending data available yet. Start scanning receipts to see your spending habits!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}