import React, { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { ReceiptDetailScreen } from './components/ReceiptDetailScreen';
import { ScanScreen } from './components/ScanScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { SwipeModeScreen } from './components/SwipeModeScreen';
import { DeductsScreen } from './components/DeductsScreen';
import { Button } from './components/ui/button';

type Screen = 'onboarding' | 'home' | 'detail' | 'scan' | 'swipe' | 'deducts';

export interface Receipt {
  id: number;
  merchant: string;
  date: string;
  category: string;
  amount: number;
  score: number;
  items: { description: string; quantity?: number; price: number }[];
  subtotal: number;
  tax: number;
  folderId?: number; // undefined means unsorted
}

export interface Category {
  id: number;
  label: string;
  color: string;
}

const initialCategories: Category[] = [
  {
    id: 1,
    label: 'Business',
    color: '#558E00',
  },
  {
    id: 2,
    label: 'Personal',
    color: '#6b7280',
  },
];

const initialReceipts: Receipt[] = [
  {
    id: 1,
    merchant: 'Starbucks Coffee',
    date: 'Nov 14, 2025',
    category: 'Food',
    amount: 12.45,
    score: 35,
    items: [
      { description: 'Caffe Latte - Grande', price: 5.45 },
      { description: 'Blueberry Muffin', price: 3.95 },
      { description: 'Bottled Water', price: 2.50 },
    ],
    subtotal: 11.90,
    tax: 0.55,
  },
  {
    id: 2,
    merchant: 'Office Depot',
    date: 'Nov 13, 2025',
    category: 'Supplies',
    amount: 87.32,
    score: 72,
    items: [
      { description: 'Copy Paper - 5 Reams', price: 42.95 },
      { description: 'Black Ink Cartridge', price: 28.99 },
      { description: 'Manila Folders (50pk)', price: 8.99 },
    ],
    subtotal: 80.93,
    tax: 6.39,
  },
  {
    id: 3,
    merchant: 'Uber',
    date: 'Nov 12, 2025',
    category: 'Travel',
    amount: 24.80,
    score: 58,
    items: [
      { description: 'UberX - Downtown to Airport', price: 21.50 },
      { description: 'Service Fee', price: 2.15 },
    ],
    subtotal: 23.65,
    tax: 1.15,
  },
];

export default function App() {
  // Always start with onboarding sequence
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [receipts, setReceipts] = useState<Receipt[]>(initialReceipts);

  const handleOnboardingComplete = (name: string) => {
    setUserName(name);
    setHasCompletedOnboarding(true);
    setCurrentScreen('home');
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setCurrentScreen('detail');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
    setSelectedCategory(null);
  };

  const handleMoveReceiptToCategory = (receiptId: number, folderId: number) => {
    setReceipts(prev => 
      prev.map(receipt => 
        receipt.id === receiptId 
          ? { ...receipt, folderId } 
          : receipt
      )
    );
  };

  const handleUndoMoveReceipt = (receiptId: number) => {
    setReceipts(prev => 
      prev.map(receipt => 
        receipt.id === receiptId 
          ? { ...receipt, folderId: undefined } 
          : receipt
      )
    );
  };

  const handleAddCategory = (label: string, color: string) => {
    const newCategory: Category = {
      id: Date.now(),
      label,
      color,
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const handleDeleteCategory = (folderId: number) => {
    // Move all receipts in this category back to unsorted
    setReceipts(prev => 
      prev.map(receipt => 
        receipt.folderId === folderId 
          ? { ...receipt, folderId: undefined } 
          : receipt
      )
    );
    setCategories(prev => prev.filter(f => f.id !== folderId));
    
    // If we're viewing the deleted category, go back home
    if (selectedCategory?.id === folderId) {
      handleBackToHome();
    }
  };

  const handleAddReceipt = (receipt: Omit<Receipt, 'id'>) => {
    const newReceipt: Receipt = {
      ...receipt,
      id: Date.now(),
    };
    setReceipts(prev => [...prev, newReceipt]);
  };

  const handleDeleteReceipt = (receiptId: number) => {
    setReceipts(prev => prev.filter(r => r.id !== receiptId));
  };

  const handleUpdateCategory = (folderId: number, updates: Partial<Category>) => {
    setCategories(prev => 
      prev.map(category => 
        category.id === folderId 
          ? { ...category, ...updates } 
          : category
      )
    );
    
    // Update selectedCategory if it's the one being updated
    if (selectedCategory?.id === folderId) {
      setSelectedCategory(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleSignOut = () => {
    setCurrentScreen('onboarding');
    setHasCompletedOnboarding(false);
    setUserName('');
    setCategories(initialCategories);
    setReceipts(initialReceipts);
    setSelectedCategory(null);
  };

  // Show onboarding screen
  if (currentScreen === 'onboarding') {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Screen Navigation - for demo purposes */}
      {hasCompletedOnboarding && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 z-50 shadow-lg">
          <div className="max-w-md mx-auto px-4 py-3">
            <div className="flex justify-center gap-2 overflow-x-auto">
              <Button
                onClick={() => setCurrentScreen('home')}
                variant={currentScreen === 'home' ? 'default' : 'outline'}
                size="sm"
                className="whitespace-nowrap rounded-full"
              >
                Home
              </Button>
              <Button
                onClick={() => setCurrentScreen('swipe')}
                variant={currentScreen === 'swipe' ? 'default' : 'outline'}
                size="sm"
                className="whitespace-nowrap rounded-full"
              >
                Swipe Mode
              </Button>
              <Button
                onClick={() => setCurrentScreen('scan')}
                variant={currentScreen === 'scan' ? 'default' : 'outline'}
                size="sm"
                className="whitespace-nowrap rounded-full"
              >
                Scan
              </Button>
              <Button
                onClick={() => setCurrentScreen('deducts')}
                variant={currentScreen === 'deducts' ? 'default' : 'outline'}
                size="sm"
                className="whitespace-nowrap rounded-full"
              >
                Deducts
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Render Current Screen */}
      {currentScreen === 'home' && (
        <HomeScreen 
          userName={userName}
          categories={categories}
          receipts={receipts}
          onCategoryClick={handleCategoryClick}
          onMoveReceipt={handleMoveReceiptToCategory}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onAddReceipt={handleAddReceipt}
          onDeleteReceipt={handleDeleteReceipt}
          onNavigateToScan={() => setCurrentScreen('scan')}
          onSignOut={handleSignOut}
          onUnsortReceipt={handleUndoMoveReceipt}
        />
      )}
      {currentScreen === 'swipe' && (
        <SwipeModeScreen 
          categories={categories}
          receipts={receipts}
          onMoveReceipt={handleMoveReceiptToCategory}
          onUndoMove={handleUndoMoveReceipt}
        />
      )}
      {currentScreen === 'detail' && (
        <ReceiptDetailScreen 
          category={selectedCategory}
          receipts={receipts}
          onBack={handleBackToHome}
          onDeleteReceipt={handleDeleteReceipt}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          onUnsortReceipt={handleUndoMoveReceipt}
        />
      )}
      {currentScreen === 'scan' && <ScanScreen onBack={handleBackToHome} />}
      {currentScreen === 'deducts' && <DeductsScreen />}
    </div>
  );
}