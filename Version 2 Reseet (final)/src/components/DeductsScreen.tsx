import React from 'react';

export function DeductsScreen() {
  const [selectedTimeWindow, setSelectedTimeWindow] = React.useState<string>('monthly');
  const [customDays, setCustomDays] = React.useState<number>(30);

  const handleTimeWindowSelect = (window: string) => {
    setSelectedTimeWindow(window);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        <h1 className="text-center mb-8">
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
          <div className="w-full h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center">
            <span className="text-gray-700">Generate Tax Report Now</span>
          </div>
          
          {/* Spending Habits Section */}
          <div className="w-full bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-7">
            <h2 className="text-gray-800 mb-6">Spending Habits</h2>
            
            <div className="space-y-4">
              {[
                { category: 'Food', amount: 1240, color: '#558E00' },
                { category: 'Transportation', amount: 860, color: '#3b82f6' },
                { category: 'Entertainment', amount: 540, color: '#8b5cf6' },
                { category: 'Subscriptions', amount: 312, color: '#f59e0b' },
              ].map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">{item.category}</span>
                    <span className="text-gray-800">${item.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(item.amount / 1240) * 100}%`,
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}