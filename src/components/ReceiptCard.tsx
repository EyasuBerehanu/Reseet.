import React, { useState } from 'react';
import { ScoreBar } from './ScoreBar';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';

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
  onUnsort?: (receiptId: number) => void;
  onClick?: () => void;
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
  onUnsort,
  onClick,
}: ReceiptCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isOverUnsort, setIsOverUnsort] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const unsortZoneRef = React.useRef<HTMLDivElement>(null);

  // Desktop drag handlers
  const handleDragStart = (e: React.DragEvent) => {
    if (id && draggable) {
      e.dataTransfer.setData('receiptId', id.toString());
      setIsDragging(true);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsOverUnsort(false);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (id && draggable && onUnsort) {
      const touch = e.touches[0];
      setTouchStartX(touch.clientX);
      setTouchStartY(touch.clientY);
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!onUnsort) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = Math.abs(touch.clientY - touchStartY);

    // Only swipe horizontally if the movement is more horizontal than vertical
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
      setIsDragging(true);
      // Only allow left swipe (negative deltaX)
      if (deltaX < 0) {
        setSwipeOffset(deltaX);
        // Show unsort indicator when swiped more than 50px
        setIsOverUnsort(deltaX < -50);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = Math.abs(touch.clientY - touchStartY);

    // If moved less than 10px, treat as click
    if (Math.abs(deltaX) < 10 && deltaY < 10) {
      if (onClick) {
        onClick();
      }
      setSwipeOffset(0);
      setIsDragging(false);
      setIsOverUnsort(false);
      return;
    }

    // If swiped left more than 100px, unsort the receipt
    if (deltaX < -100 && id && onUnsort) {
      onUnsort(id);
    }

    // Reset swipe
    setSwipeOffset(0);
    setIsDragging(false);
    setIsOverUnsort(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger click if not dragging
    if (isDragging) {
      e.stopPropagation();
    } else if (onClick) {
      onClick();
    }
  };

  const handleUnsortDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOverUnsort(true);
  };

  const handleUnsortDragLeave = () => {
    setIsOverUnsort(false);
  };

  const handleUnsortDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const receiptId = parseInt(e.dataTransfer.getData('receiptId'));
    if (receiptId && onUnsort) {
      onUnsort(receiptId);
    }
    setIsOverUnsort(false);
    setIsDragging(false);
  };

  return (
    <>
      {/* Unsort Popup - appears when dragging */}
      {isDragging && onUnsort && (
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
          <div className="flex justify-center pb-24 px-4">
            <div
              ref={unsortZoneRef}
              className={`pointer-events-auto bg-white rounded-3xl shadow-2xl border-2 transition-all duration-200 ${
                isOverUnsort
                  ? 'border-red-500 bg-red-50 scale-105'
                  : 'border-gray-200'
              }`}
              onDragOver={handleUnsortDragOver}
              onDragLeave={handleUnsortDragLeave}
              onDrop={handleUnsortDrop}
            >
              <div className="px-8 py-6 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                  isOverUnsort ? 'bg-red-500' : 'bg-gray-100'
                }`}>
                  <X className={`w-7 h-7 ${isOverUnsort ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div>
                  <div className={`transition-colors ${isOverUnsort ? 'text-red-900' : 'text-gray-900'}`}>
                    Unsort Receipt
                  </div>
                  <div className="text-gray-500">
                    {isOverUnsort ? 'Drop to remove category' : 'Drag here to unsort'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Card */}
      <div
        className={`bg-white rounded-2xl p-5 transition-all ${
          isLifted ? 'shadow-xl' : 'shadow-sm'
        } ${isDragging ? 'opacity-50' : 'opacity-100'} ${draggable ? 'cursor-grab active:cursor-grabbing hover:shadow-md' : 'cursor-pointer hover:shadow-md'}`}
        style={{
          transform: `translateX(${offsetX + swipeOffset}px) rotate(${rotation}deg)`,
        }}
        draggable={draggable}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
    </>
  );
}
