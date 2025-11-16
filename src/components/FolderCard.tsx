import React, { useState } from 'react';
import { FolderIcon } from './FolderIcon';

interface FolderCardProps {
  label: string;
  color: string;
  count: number;
  isActive?: boolean;
  onDrop?: (receiptId: number) => void;
  onClick?: () => void;
}

export function FolderCard({ label, color, count, isActive = false, onDrop, onClick }: FolderCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const receiptId = e.dataTransfer.getData('receiptId');
    if (receiptId && onDrop) {
      onDrop(parseInt(receiptId));
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`bg-white rounded-2xl p-6 transition-all cursor-pointer ${
        isDragOver ? 'shadow-xl scale-105 border-2' : 'shadow-sm border-2 border-transparent'
      } hover:shadow-md`}
      style={{
        borderColor: isDragOver ? color : 'transparent',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center gap-3">
        <FolderIcon color={color} size={110} label={label} isActive={isDragOver} count={count} />
        <div className="text-center">
          <p className="text-[rgb(0,0,0)] font-bold mb-1 text-[20px]">{label}</p>
          <p className="text-gray-600 text-sm text-[16px]">
            {count} {count === 1 ? 'receipt' : 'receipts'}
          </p>
        </div>
      </div>
    </div>
  );
}
