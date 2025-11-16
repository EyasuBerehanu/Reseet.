import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FolderIcon } from './FolderIcon';
import type { Category, Receipt } from '../App';

interface SwipeModeScreenProps {
  categories: Category[];
  receipts: Receipt[];
  onMoveReceipt: (receiptId: number, folderId: number) => void;
  onUndoMove: (receiptId: number) => void;
}

export function SwipeModeScreen({ categories, receipts, onMoveReceipt, onUndoMove }: SwipeModeScreenProps) {
  const [currentReceiptIndex, setCurrentReceiptIndex] = useState(0);
  const [draggedReceiptId, setDraggedReceiptId] = useState<number | null>(null);
  const [activeDropZone, setActiveDropZone] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSnappingBack, setIsSnappingBack] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [lastFiledReceipt, setLastFiledReceipt] = useState<{ id: number; categoryId: number } | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [conveyorOffset, setConveyorOffset] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(5);
  const receiptCenterRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const conveyorRef = useRef<HTMLDivElement | null>(null);

  const unsortedReceipts = receipts.filter(r => !r.folderId);
  const currentReceipt = unsortedReceipts[currentReceiptIndex];
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Get category counts
  const categoryCounts = categories.map(category => ({
    ...category,
    count: receipts.filter(r => r.folderId === category.id).length,
  }));

  // Calculate which category the receipt is near (element-based collision)
  const calculateActiveCategory = (mouseX: number, mouseY: number) => {
    if (!isDragging) return null;

    const activationRadius = 100; // How close the receipt needs to be to a category

    // Check all category instances (original + duplicates)
    for (const key in categoryRefs.current) {
      const element = categoryRefs.current[key];
      if (!element) continue;

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distance = Math.sqrt(
        Math.pow(mouseX - centerX, 2) +
        Math.pow(mouseY - centerY, 2)
      );

      if (distance < activationRadius) {
        // Extract the category ID from the key (e.g., "1-0" -> 1)
        const categoryId = parseInt(key.split('-')[0]);
        return categoryId;
      }
    }

    return null;
  };

  const handleMouseDown = (e: React.MouseEvent, receiptId: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    receiptCenterRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
    };

    setIsDragging(true);
    setIsSnappingBack(false);
    setShowCategories(true);
    setDraggedReceiptId(receiptId);
    setDragPosition({ x: 0, y: 0 });
  };

  const handleTouchStart = (e: React.TouchEvent, receiptId: number) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    receiptCenterRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };

    setIsDragging(true);
    setIsSnappingBack(false);
    setShowCategories(true);
    setDraggedReceiptId(receiptId);
    setDragPosition({ x: 0, y: 0 });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !draggedReceiptId || isSnappingBack) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartRef.current.x;
    const deltaY = touch.clientY - dragStartRef.current.y;

    setDragPosition({ x: deltaX, y: deltaY });

    // Calculate if folders fit on screen
    const folderWidth = 120;
    const gap = 24;
    const totalWidth = categories.length * folderWidth + (categories.length - 1) * gap;
    const viewportWidth = window.innerWidth;
    const padding = 48;

    if (totalWidth + padding <= viewportWidth) {
      setConveyorOffset(0);
    } else {
      const scrollMultiplier = 3.5;
      let newOffset = -deltaX * scrollMultiplier;
      const maxPositiveOffset = 0;
      const maxNegativeOffset = -(totalWidth - viewportWidth + padding);
      newOffset = Math.max(maxNegativeOffset, Math.min(maxPositiveOffset, newOffset));
      setConveyorOffset(newOffset);
    }

    const activeCategoryId = calculateActiveCategory(touch.clientX, touch.clientY);
    setActiveDropZone(activeCategoryId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !draggedReceiptId || isSnappingBack) return;

    // Calculate drag offset from start position
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    setDragPosition({ x: deltaX, y: deltaY });

    // Calculate if folders fit on screen
    // Estimate: Each folder is ~120px wide (75px icon + label area) + 24px gap
    const folderWidth = 120;
    const gap = 24;
    const totalWidth = categories.length * folderWidth + (categories.length - 1) * gap;
    const viewportWidth = window.innerWidth;
    const padding = 48; // Account for px-6 padding on both sides

    // If all folders fit on screen, no scrolling needed
    if (totalWidth + padding <= viewportWidth) {
      setConveyorOffset(0);
    } else {
      // Folders overflow - enable scrolling
      // Move conveyor opposite to drag direction
      // Drag right = scroll left (negative offset), drag left = scroll right (positive offset)
      const scrollMultiplier = 3.5;
      let newOffset = -deltaX * scrollMultiplier;

      // Calculate bounds to stop at first and last folder
      // Left bound (scrolling right, positive offset): start at 0
      const maxPositiveOffset = 0;
      // Right bound (scrolling left, negative offset): show last folder
      const maxNegativeOffset = -(totalWidth - viewportWidth + padding);

      // Clamp the offset to stay within bounds
      newOffset = Math.max(maxNegativeOffset, Math.min(maxPositiveOffset, newOffset));

      setConveyorOffset(newOffset);
    }

    // Check if receipt is near any category based on mouse position
    const activeCategoryId = calculateActiveCategory(e.clientX, e.clientY);
    setActiveDropZone(activeCategoryId);
  };

  const handleTouchEnd = () => {
    if (!isDragging || !draggedReceiptId) return;

    // If dropped on a category, move the receipt
    if (activeDropZone) {
      onMoveReceipt(draggedReceiptId, activeDropZone);

      // Store the last filed receipt for undo
      setLastFiledReceipt({ id: draggedReceiptId, categoryId: activeDropZone });
      setShowUndo(true);

      // Clear any existing undo timer
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }

      // Auto-hide undo button after 5 seconds
      undoTimerRef.current = setTimeout(() => {
        setShowUndo(false);
        setLastFiledReceipt(null);
      }, 5000);

      // Move to next receipt
      if (currentReceiptIndex < unsortedReceipts.length - 1) {
        setCurrentReceiptIndex(currentReceiptIndex + 1);
      }

      // Reset immediately for filed receipt
      setIsDragging(false);
      setIsSnappingBack(false);
      setShowCategories(false);
      setDraggedReceiptId(null);
      setActiveDropZone(null);
      setDragPosition({ x: 0, y: 0 });
    } else {
      // Snap back to center - prevent further moves from affecting position
      setIsDragging(false);
      setIsSnappingBack(true);
      setActiveDropZone(null);
      setDragPosition({ x: 0, y: 0 });

      // Hide categories after snap-back animation completes
      setTimeout(() => {
        setIsSnappingBack(false);
        setShowCategories(false);
        setDraggedReceiptId(null);
      }, 400);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || !draggedReceiptId) return;

    // If dropped on a category, move the receipt
    if (activeDropZone) {
      onMoveReceipt(draggedReceiptId, activeDropZone);

      // Store the last filed receipt for undo
      setLastFiledReceipt({ id: draggedReceiptId, categoryId: activeDropZone });
      setShowUndo(true);

      // Clear any existing undo timer
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }

      // Auto-hide undo button after 5 seconds
      undoTimerRef.current = setTimeout(() => {
        setShowUndo(false);
        setLastFiledReceipt(null);
      }, 5000);

      // Move to next receipt
      if (currentReceiptIndex < unsortedReceipts.length - 1) {
        setCurrentReceiptIndex(currentReceiptIndex + 1);
      }

      // Reset immediately for filed receipt
      setIsDragging(false);
      setIsSnappingBack(false);
      setShowCategories(false);
      setDraggedReceiptId(null);
      setActiveDropZone(null);
      setDragPosition({ x: 0, y: 0 });
    } else {
      // Snap back to center - prevent further mouse moves from affecting position
      setIsDragging(false);
      setIsSnappingBack(true);
      setActiveDropZone(null);
      setDragPosition({ x: 0, y: 0 });

      // Hide categories after snap-back animation completes
      setTimeout(() => {
        setIsSnappingBack(false);
        setShowCategories(false);
        setDraggedReceiptId(null);
      }, 400);
    }
  };

  const handleUndo = () => {
    if (!lastFiledReceipt) return;

    onUndoMove(lastFiledReceipt.id);
    setShowUndo(false);
    setLastFiledReceipt(null);

    // Clear the auto-hide timer
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  // Update receipt center on window resize
  useEffect(() => {
    const updateReceiptCenter = () => {
      const receiptElement = document.getElementById('swipe-receipt');
      if (receiptElement) {
        const rect = receiptElement.getBoundingClientRect();
        receiptCenterRef.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
    };

    updateReceiptCenter();
    window.addEventListener('resize', updateReceiptCenter);
    return () => window.removeEventListener('resize', updateReceiptCenter);
  }, []);

  if (!currentReceipt) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f5f5f0] px-4">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">No receipts to sort</p>
          <p className="text-gray-500">All receipts have been filed!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen bg-[#f5f5f0] relative overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 px-6 pt-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[rgb(0,0,0)] text-[36px] font-bold">Swipe</h1>
        </div>
      </div>

      {/* Category conveyor belt - appears when dragging */}
      <AnimatePresence>
        {showCategories && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute bottom-[67px] left-0 right-0 z-10 overflow-hidden"
          >

            <motion.div
              ref={conveyorRef}
              className="flex gap-6 px-6"
              animate={{ x: conveyorOffset }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            >
              {/* Render categories once - scrolling stops at bounds */}
              {categoryCounts.map((category) => {
                const isActive = activeDropZone === category.id;
                const uniqueKey = `${category.id}`;

                return (
                  <motion.div
                    key={uniqueKey}
                    ref={(el) => { categoryRefs.current[uniqueKey] = el; }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 25,
                      delay: 0
                    }}
                    className="flex-shrink-0"
                  >
                    <motion.div
                      animate={{
                        scale: isActive ? 1.3 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="flex flex-col items-center gap-2"
                    >
                      {/* Category icon */}
                      <div className={`transition-all ${isActive ? 'drop-shadow-2xl' : ''}`}>
                        <FolderIcon
                          color={category.color}
                          size={isActive ? 100 : 75}
                          label={category.label}
                          isActive={isActive}
                          count={category.count}
                        />
                      </div>

                      {/* Category label */}
                      <motion.div
                        animate={{
                          scale: isActive ? 1.15 : 1,
                          y: isActive ? -8 : 0,
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="text-center"
                        style={{
                          backgroundColor: isActive ? 'rgba(85, 142, 0, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                          padding: '6px 12px',
                          borderRadius: '12px',
                          border: isActive ? '2px solid #558E00' : '2px solid transparent',
                          boxShadow: isActive ? '0 6px 20px rgba(85, 142, 0, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                      >
                        <p className={`text-sm font-medium whitespace-nowrap ${isActive ? 'text-[#558E00]' : 'text-gray-900'}`}>
                          {category.label}
                        </p>
                        <p className="text-xs text-gray-600">
                          {category.count} {category.count === 1 ? 'receipt' : 'receipts'}
                        </p>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center receipt card - Digital Receipt Style */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        {/* Undo button - appears after filing a receipt */}
        <AnimatePresence>
          {showUndo && lastFiledReceipt && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute left-1/2 -translate-x-1/2 z-10"
              style={{ top: '-70px' }}
            >
              <button
                onClick={handleUndo}
                className="bg-[#558E00] text-white px-6 py-3 rounded-full shadow-lg hover:bg-[#6ba500] transition-colors flex items-center gap-2"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 7v6h6" />
                  <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
                </svg>
                <span>Undo</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          id="swipe-receipt"
          className="bg-white shadow-2xl cursor-grab active:cursor-grabbing"
          style={{
            width: '280px',
          }}
          initial={{ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }}
          animate={{
            x: dragPosition.x,
            y: dragPosition.y,
            scale: (isDragging || isSnappingBack) ? 0.7 : 1,
            rotate: (isDragging || isSnappingBack) && (dragPosition.x !== 0 || dragPosition.y !== 0) ? dragPosition.x * 0.05 : 0,
            opacity: 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          onMouseDown={(e) => handleMouseDown(e, currentReceipt.id)}
          onTouchStart={(e) => handleTouchStart(e, currentReceipt.id)}
        >
          {/* Receipt content */}
          <div className="px-5 py-6 space-y-3" style={{ fontFamily: 'monospace' }}>
            {/* Store Header */}
            <div className="text-center border-b-2 border-dashed border-gray-300 pb-4">
              <div className="mb-2" style={{ fontSize: '20px', letterSpacing: '0.5px' }}>
                {currentReceipt.merchant.toUpperCase()}
              </div>
              <div className="text-gray-600" style={{ fontSize: '12px' }}>
                {currentReceipt.date}
              </div>
              <div className="text-gray-600 mt-1" style={{ fontSize: '12px' }}>
                Category: {currentReceipt.category}
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 border-b-2 border-dashed border-gray-300 pb-4">
              {currentReceipt.items.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between" style={{ fontSize: '13px' }}>
                    <span className="flex-1 pr-2">{item.description}</span>
                    <span className="text-right whitespace-nowrap">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  {item.quantity && item.quantity > 1 && (
                    <div className="text-gray-500 ml-2" style={{ fontSize: '11px' }}>
                      {item.quantity} × ${(item.price / item.quantity).toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 border-b-2 border-dashed border-gray-300 pb-4">
              <div className="flex justify-between" style={{ fontSize: '13px' }}>
                <span>SUBTOTAL</span>
                <span>${currentReceipt.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between" style={{ fontSize: '13px' }}>
                <span>TAX</span>
                <span>${currentReceipt.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                <span>TOTAL</span>
                <span>${currentReceipt.amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Write-off score bar */}
            <div className="pt-2">
              <div className="text-center mb-2" style={{ fontSize: '11px' }}>
                Write-off likelihood: {currentReceipt.score}%
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${currentReceipt.score}%`,
                    backgroundColor:
                      currentReceipt.score >= 70
                        ? '#558E00'
                        : currentReceipt.score >= 40
                        ? '#f59e0b'
                        : '#ef4444',
                  }}
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="text-center text-gray-500 pt-2" style={{ fontSize: '11px' }}>
              {(isDragging || isSnappingBack) ? (activeDropZone ? 'RELEASE TO FILE' : 'DRAG TO CATEGORY') : 'TAP & DRAG TO FILE'}
            </div>
          </div>
        </motion.div>

        {/* Receipt counter */}
        {!isDragging && !isSnappingBack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-4 text-gray-600"
          >
            {currentReceiptIndex + 1} of {unsortedReceipts.length}
          </motion.div>
        )}
      </div>

      {/* Instructional hint when not dragging */}
      {!isDragging && !isSnappingBack && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 text-center"
        >
          <p className="text-gray-500 text-sm">
            Tap and hold receipt, then drag to a category
          </p>
        </motion.div>
      )}
    </div>
  );
}
