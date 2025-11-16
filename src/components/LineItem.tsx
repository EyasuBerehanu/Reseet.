import React from 'react';

interface LineItemProps {
  description: string;
  amount: number;
}

export function LineItem({ description, amount }: LineItemProps) {
  return (
    <div className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0">
      <span className="text-gray-700 flex-1">{description}</span>
      <span className="text-gray-900 ml-4">${amount.toFixed(2)}</span>
    </div>
  );
}
