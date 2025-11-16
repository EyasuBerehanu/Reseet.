import React, { useState } from 'react';
import { ReceiptCard } from './ReceiptCard';
import { ChevronLeft, Trash2, Edit2 } from 'lucide-react';
import { FolderIcon } from './FolderIcon';
import { DigitalReceiptModal } from './DigitalReceiptModal';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { Category, Receipt } from '../App';

interface ReceiptDetailScreenProps {
  category: Category | null;
  receipts: Receipt[];
  onBack?: () => void;
  onDeleteReceipt: (receiptId: number) => void;
  onUpdateCategory: (folderId: number, updates: Partial<Category>) => void;
  onDeleteCategory: (folderId: number) => void;
  onUnsortReceipt?: (receiptId: number) => void;
}

export function ReceiptDetailScreen({
  category,
  receipts,
  onBack,
  onDeleteReceipt,
  onUpdateCategory,
  onDeleteCategory,
  onUnsortReceipt,
}: ReceiptDetailScreenProps) {
  const [selectedReceiptId, setSelectedReceiptId] = useState<number | null>(null);
  const [receiptToDelete, setReceiptToDelete] = useState<number | null>(null);
  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryColor, setEditCategoryColor] = useState('#FFFFFF');
  
  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <p className="text-gray-400">No category selected</p>
      </div>
    );
  }

  const categoryReceipts = receipts.filter(r => r.folderId === category.id);
  const selectedReceipt = receipts.find(r => r.id === selectedReceiptId);

  const handleDeleteReceipt = (receiptId: number) => {
    onDeleteReceipt(receiptId);
    setReceiptToDelete(null);
    if (selectedReceiptId === receiptId) {
      setSelectedReceiptId(null);
    }
  };

  const handleDeleteCategory = () => {
    onDeleteCategory(category.id);
    setIsDeleteCategoryOpen(false);
  };

  const handleEditCategory = () => {
    setEditCategoryName(category.label);
    setEditCategoryColor(category.color);
    setIsEditCategoryOpen(true);
  };

  const handleSaveCategory = () => {
    if (editCategoryName.trim()) {
      onUpdateCategory(category.id, {
        label: editCategoryName.trim(),
        color: editCategoryColor,
      });
      setIsEditCategoryOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-6 pt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={onBack}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-900" />
              </button>
              <h1 className="text-[rgb(0,0,0)] text-[36px] font-bold">{category.label}</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="default"
                onClick={handleEditCategory}
                className="rounded-full text-[20px]"
              >
                <Edit2 className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleteCategoryOpen(true)}
                className="rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="px-4">
          {/* Category Header Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-center gap-6 mb-4">
              <FolderIcon 
                color={category.color} 
                size={100} 
                label={category.label}
                count={categoryReceipts.length}
              />
            </div>
            <div className="text-center space-y-2">
              <p className="text-gray-600">
                {categoryReceipts.length} {categoryReceipts.length === 1 ? 'receipt' : 'receipts'} in this category
              </p>
              {categoryReceipts.length > 0 && (
                <p className="text-gray-500">
                  Total: ${categoryReceipts.reduce((sum, r) => sum + r.amount, 0).toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Receipts in category */}
          {categoryReceipts.length > 0 ? (
            <div className="space-y-3">
              {categoryReceipts.map((receipt) => (
                <div key={receipt.id} className="relative group">
                  <ReceiptCard
                    id={receipt.id}
                    merchant={receipt.merchant}
                    date={receipt.date}
                    category={receipt.category}
                    amount={receipt.amount}
                    score={receipt.score}
                    draggable={true}
                    onUnsort={onUnsortReceipt}
                    onClick={() => setSelectedReceiptId(receipt.id)}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setReceiptToDelete(receipt.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-red-50 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No receipts in this category yet</p>
              <p className="text-gray-400 mt-2">Drag receipts here to organize them</p>
            </div>
          )}
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
          discount={selectedReceipt.discount}
          tip={selectedReceipt.tip}
          paymentMethod={selectedReceipt.paymentMethod}
        />
      )}

      {/* Delete Receipt Confirmation */}
      <AlertDialog open={receiptToDelete !== null} onOpenChange={(open) => !open && setReceiptToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Receipt?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this receipt. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => receiptToDelete && handleDeleteReceipt(receiptToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={isDeleteCategoryOpen} onOpenChange={setIsDeleteCategoryOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the "{category.label}" category. All receipts in this category will be moved to unsorted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent className="max-w-sm">
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription className="sr-only">
            Update category name and color
          </DialogDescription>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="editCategoryName" className="text-[15px]">Name</Label>
              <Input
                id="editCategoryName"
                placeholder="Category name"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveCategory()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editCategoryColor" className="text-[15px]">Color</Label>
              <div className="flex flex-col gap-[16px] items-center">
                <div className="relative rounded-[8px] shrink-0 size-[32px] cursor-pointer" style={{ backgroundColor: editCategoryColor }}>
                  <div aria-hidden="true" className="absolute border border-[#d1d5dc] border-solid inset-0 pointer-events-none rounded-[8px]" />
                  <input
                    id="editCategoryColor"
                    type="color"
                    value={editCategoryColor}
                    onChange={(e) => setEditCategoryColor(e.target.value)}
                    className="opacity-0 cursor-pointer size-[32px]"
                  />
                </div>
                <div className="bg-white relative rounded-[10px] shrink-0 w-[93px]">
                  <div aria-hidden="true" className="absolute border border-gray-200 border-solid inset-0 pointer-events-none rounded-[10px]" />
                  <input
                    type="text"
                    value={editCategoryColor}
                    onChange={(e) => setEditCategoryColor(e.target.value)}
                    className="bg-transparent border-0 font-['Inter',sans-serif] font-normal leading-[20px] text-[#4a5565] text-[14px] text-center w-full py-[9.5px] px-[8px] outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsEditCategoryOpen(false)}
                className="flex-1 rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCategory}
                className="flex-1 rounded-full"
                disabled={!editCategoryName.trim()}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
