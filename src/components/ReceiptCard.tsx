import React, { useState } from 'react';
import { ScoreBar } from './ScoreBar';
import { Badge } from './ui/badge';

interface ReceiptCardProps {
  id?: number;
  merchant: string;
  date: string;
  category: string;
  amount: number;
  score: number;
  isLifted?: boolean;
  rotation?: number;
  offsetX?: number;
  draggable?: boolean;
}

export function ReceiptCard({
  id,
  merchant,
  date,
  category,
  amount,
  score,
  isLifted = false,
  rotation = 0,
  offsetX = 0,
  draggable = false,
}: ReceiptCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (id && draggable) {
      e.dataTransfer.setData('receiptId', id.toString());
      setIsDragging(true);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger click if not dragging
    if (isDragging) {
      e.stopPropagation();
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl p-5 transition-all ${
        isLifted ? 'shadow-xl' : 'shadow-sm'
      } ${isDragging ? 'opacity-50' : 'opacity-100'} ${draggable ? 'cursor-grab active:cursor-grabbing hover:shadow-md' : 'cursor-pointer hover:shadow-md'}`}
      style={{
        transform: `translateX(${offsetX}px) rotate(${rotation}deg)`,
      }}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-gray-900 mb-1">{merchant}</h3>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">{date}</span>
            <span className="text-gray-300">•</span>
            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5">
              {category}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-900">${amount.toFixed(2)}</div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-gray-600">Write-off likelihood</span>
          <span className={`font-semibold ${
            score >= 70 ? 'text-green-600' :
            score >= 40 ? 'text-orange-600' :
            'text-red-600'
          }`}>
            {score}%
          </span>
        </div>
        <ScoreBar score={score} />
      </div>
    </div>
  );
}
