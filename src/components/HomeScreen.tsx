import React, { useState } from 'react';
import { FolderCard } from './FolderCard';
import { ReceiptCard } from './ReceiptCard';
import { DigitalReceiptModal } from './DigitalReceiptModal';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import AddCategoryIcon from '../imports/Group9';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { Category, Receipt } from '../App';

interface HomeScreenProps {
  categories: Category[];
  receipts: Receipt[];
  onCategoryClick?: (category: Category) => void;
  onMoveReceipt: (receiptId: number, folderId: number) => void;
  onAddCategory: (label: string, color: string) => void;
  onDeleteCategory: (folderId: number) => void;
  onAddReceipt: (receipt: Omit<Receipt, 'id'>) => void;
  onDeleteReceipt: (receiptId: number) => void;
  onNavigateToScan?: () => void;
  onSignOut?: () => void;
}

export function HomeScreen({
  categories,
  receipts,
  onCategoryClick,
  onMoveReceipt,
  onAddCategory,
  onDeleteCategory,
  onAddReceipt,
  onDeleteReceipt,
  onNavigateToScan,
  onSignOut,
}: HomeScreenProps) {
  const [selectedReceiptId, setSelectedReceiptId] = useState<number | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#FFFFFF');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [scrollStartY, setScrollStartY] = useState(0);

  const unsortedReceipts = receipts.filter(r => !r.folderId);
  const selectedReceipt = receipts.find(r => r.id === selectedReceiptId);

  const handleDropToCategory = (folderId: number, receiptId: number) => {
    onMoveReceipt(receiptId, folderId);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim(), newCategoryColor);
      setNewCategoryName('');
      setNewCategoryColor('#FFFFFF');
      setIsAddCategoryOpen(false);
    }
  };

  const getCategoryCount = (folderId: number) => {
    return receipts.filter(r => r.folderId === folderId).length;
  };

  // Touch scroll handlers for unsorted receipts
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStartY(touch.clientY);
    setScrollStartY(window.scrollY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const deltaY = dragStartY - touch.clientY; // Inverted: drag down = scroll down
    const newScrollY = scrollStartY + deltaY;

    window.scrollTo({
      top: newScrollY,
      behavior: 'auto', // Instant scroll for smooth dragging
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-8">
      <div className="max-w-md mx-auto px-4 pt-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[rgb(0,0,0)] text-[36px] font-bold">Receipts</h1>
          <Button size="sm" className="rounded-full" onClick={onNavigateToScan}>
            <Plus className="w-4 h-4 mr-1" />
            Scan
          </Button>
        </div>

        {/* Categories */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-900 text-[24px] font-bold font-normal">Categories</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsAddCategoryOpen(true)}
              className="rounded-full text-[16px]"
            >
              <div className="w-4 h-4 mr-1">
                <AddCategoryIcon />
              </div>
              Add Category
            </Button>
          </div>
          {categories.map((category) => (
            <FolderCard
              key={category.id}
              label={category.label}
              color={category.color}
              count={getCategoryCount(category.id)}
              onDrop={(receiptId) => handleDropToCategory(category.id, receiptId)}
              onClick={() => onCategoryClick?.(category)}
            />
          ))}
        </div>

        {/* Unsorted Receipts */}
        {unsortedReceipts.length > 0 && (
          <div className="space-y-3 mt-8">
            <h3 className="text-gray-900 text-[20px] font-bold font-normal">Unsorted Receipts</h3>
            {unsortedReceipts.map((receipt) => (
              <div
                key={receipt.id}
                onClick={() => !isDragging && setSelectedReceiptId(receipt.id)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="touch-none"
              >
                <ReceiptCard
                  id={receipt.id}
                  merchant={receipt.merchant}
                  date={receipt.date}
                  category={receipt.category}
                  amount={receipt.amount}
                  score={receipt.score}
                  draggable={true}
                />
              </div>
            ))}
          </div>
        )}

        {unsortedReceipts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">All receipts organized! 🎉</p>
          </div>
        )}

        {/* Fine Print / Disclaimer */}
        <div className="mt-16 mb-8 px-4 text-center">
          <p className="text-[11px] text-gray-400 leading-relaxed max-w-md mx-auto">
            This app provides general informational suggestions based on the data you enter. 
            We are not financial advisors, accountants, or tax professionals, and nothing here 
            should be treated as professional advice. You are responsible for any decisions you make, 
            and you should consult a licensed professional for guidance on your specific situation.
          </p>
          
          {/* Sign Out Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className="mt-6 text-gray-500 hover:text-gray-700 rounded-full"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Digital Receipt Modal */}
      {selectedReceipt && (
        <DigitalReceiptModal
          isOpen={selectedReceiptId !== null}
          onClose={() => setSelectedReceiptId(null)}
          merchant={selectedReceipt.merchant}
          date={selectedReceipt.date}
          category={selectedReceipt.category}
          items={selectedReceipt.items}
          subtotal={selectedReceipt.subtotal}
          tax={selectedReceipt.tax}
          total={selectedReceipt.amount}
          receiptNumber={`RCP-2025-11-${selectedReceipt.id.toString().padStart(3, '0')}`}
          imageUrl={selectedReceipt.imageUrl}
        />
      )}

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent className="max-w-sm">
          <DialogTitle>Add Category</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new category to organize your receipts
          </DialogDescription>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Name</Label>
              <Input
                id="categoryName"
                placeholder="e.g., Travel, Meals"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryColor">Color</Label>
              <div className="flex gap-3 items-center">
                <div className="relative group">
                  <Input
                    id="categoryColor"
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="w-14 h-14 rounded-xl cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-105 p-0.5"
                    style={{ fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                </div>
                <Input
                  type="text"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="flex-1 font-mono tracking-wide"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsAddCategoryOpen(false)}
                className="flex-1 rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCategory}
                className="flex-1 rounded-full"
                disabled={!newCategoryName.trim()}
              >
                Add Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}