import React, { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { ReceiptDetailScreen } from './components/ReceiptDetailScreen';
import { ScanScreen } from './components/ScanScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { LoginScreen } from './components/LoginScreen';
import { SignupScreen } from './components/SignupScreen';
import { SwipeModeScreen } from './components/SwipeModeScreen';
import { DeductsScreen } from './components/DeductsScreen';
import { Button } from './components/ui/button';
import { authService, AuthUser } from './services/authService';
import { storageService } from './services/storageService';

type Screen = 'onboarding' | 'login' | 'signup' | 'home' | 'detail' | 'scan' | 'swipe' | 'deducts';

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
  imageUrl?: string; // base64 or URL of original receipt photo
  discount?: number; // discount amount if any
  tip?: number; // tip/gratuity amount
  paymentMethod?: string; // e.g., "Cash", "Credit Card", "Debit Card"
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

const initialReceipts: Receipt[] = [];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Use ref to track current screen to avoid stale closure in auth listener
  const currentScreenRef = React.useRef<Screen>(currentScreen);
  React.useEffect(() => {
    currentScreenRef.current = currentScreen;
  }, [currentScreen]);

  console.log('🏠 App RENDER - currentScreen:', currentScreen);

  // Check for existing session on mount and load saved data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser as AuthUser);

          // Load saved data for this user from Supabase
          const savedReceipts = await storageService.getReceipts(currentUser.id);
          const savedCategories = await storageService.getCategories(currentUser.id);

          setReceipts(savedReceipts);

          // If no categories exist, create the initial ones in the database
          if (savedCategories.length === 0) {
            console.log('📁 No categories found on initial load, creating initial categories in database...');
            const createdCategories: Category[] = [];
            for (const category of initialCategories) {
              const created = await storageService.saveCategory(category, currentUser.id);
              if (created) {
                createdCategories.push(created);
              }
            }
            console.log('📁 Created initial categories:', createdCategories);
            setCategories(createdCategories);
          } else {
            setCategories(savedCategories);
          }

          setHasCompletedOnboarding(true);
          setCurrentScreen('home');
        } else {
          setCurrentScreen('onboarding');
        }
      } catch (error: any) {
        // Only log unexpected errors (not session missing errors)
        if (error && error.name !== 'AuthSessionMissingError') {
          console.error('Auth check error:', error);
        }
        setCurrentScreen('onboarding');
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuth();

    // Listen to auth state changes
    const unsubscribe = authService.onAuthStateChange(async (authUser) => {
      const currentScreenValue = currentScreenRef.current;
      console.log('🔐 Auth state changed, user:', authUser ? authUser.email : 'null', 'currentScreen:', currentScreenValue);
      setUser(authUser);
      if (authUser) {
        // Load saved data for this user
        const savedReceipts = await storageService.getReceipts(authUser.id);
        const savedCategories = await storageService.getCategories(authUser.id);

        setReceipts(savedReceipts);

        // If no categories exist, create the initial ones in the database
        if (savedCategories.length === 0) {
          console.log('📁 No categories found, creating initial categories in database...');
          const createdCategories: Category[] = [];
          for (const category of initialCategories) {
            const created = await storageService.saveCategory(category, authUser.id);
            if (created) {
              createdCategories.push(created);
            }
          }
          console.log('📁 Created initial categories:', createdCategories);
          setCategories(createdCategories);
        } else {
          setCategories(savedCategories);
        }

        setHasCompletedOnboarding(true);

        // Only navigate to home if we're on auth screens (login/signup/onboarding)
        // Don't force navigation if user is already using the app
        if (currentScreenValue === 'onboarding' || currentScreenValue === 'login' || currentScreenValue === 'signup') {
          console.log('🏠 Navigating to home from auth screen');
          setCurrentScreen('home');
        } else {
          console.log('✅ User logged in, staying on current screen:', currentScreenValue);
        }
      } else if (!authUser && currentScreenValue !== 'onboarding' && currentScreenValue !== 'login' && currentScreenValue !== 'signup') {
        console.log('🚪 User logged out, navigating to login');
        setCurrentScreen('login');
        setHasCompletedOnboarding(false);
        setReceipts([]);
        setCategories(initialCategories);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleOnboardingComplete = () => {
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

  const handleMoveReceiptToCategory = async (receiptId: number, folderId: number) => {
    if (!user) return;

    const receipt = receipts.find(r => r.id === receiptId);
    if (!receipt) return;

    console.log('📁 Moving receipt to folder:', { receiptId, folderId, receipt });
    const updatedReceipt = { ...receipt, folderId };
    const success = await storageService.updateReceipt(updatedReceipt, user.id);
    console.log('📁 Update result:', success, 'Updated receipt:', updatedReceipt);

    setReceipts(prev =>
      prev.map(r =>
        r.id === receiptId
          ? updatedReceipt
          : r
      )
    );
  };

  const handleUndoMoveReceipt = async (receiptId: number) => {
    if (!user) return;

    const receipt = receipts.find(r => r.id === receiptId);
    if (!receipt) return;

    const updatedReceipt = { ...receipt, folderId: undefined };
    await storageService.updateReceipt(updatedReceipt, user.id);

    setReceipts(prev =>
      prev.map(r =>
        r.id === receiptId
          ? updatedReceipt
          : r
      )
    );
  };

  const handleAddCategory = async (label: string, color: string) => {
    if (!user) return;

    const newCategory = await storageService.saveCategory({ label, color }, user.id);
    if (newCategory) {
      setCategories(prev => [...prev, newCategory]);
    }
  };

  const handleDeleteCategory = async (folderId: number) => {
    if (!user) return;

    // Delete category from database
    await storageService.deleteCategory(folderId, user.id);

    // Move all receipts in this category back to unsorted
    const updatedReceipts = receipts.filter(r => r.folderId === folderId);
    for (const receipt of updatedReceipts) {
      await storageService.updateReceipt({ ...receipt, folderId: undefined }, user.id);
    }

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

  const handleAddReceipt = async (receipt: Omit<Receipt, 'id'>) => {
    console.log('💾 handleAddReceipt called with:', receipt);
    if (!user) {
      console.log('❌ No user logged in, cannot save receipt');
      return;
    }

    console.log('📤 Saving receipt to Supabase...');
    const newReceipt = await storageService.saveReceipt(receipt, user.id);
    if (newReceipt) {
      console.log('✅ Receipt saved successfully:', newReceipt);
      setReceipts(prev => [...prev, newReceipt]);
    } else {
      console.log('❌ Failed to save receipt');
    }
  };

  const handleDeleteReceipt = async (receiptId: number) => {
    if (!user) return;

    await storageService.deleteReceipt(receiptId, user.id);
    setReceipts(prev => prev.filter(r => r.id !== receiptId));
  };

  const handleUpdateCategory = async (folderId: number, updates: Partial<Category>) => {
    if (!user) return;

    const category = categories.find(c => c.id === folderId);
    if (!category) return;

    const updatedCategory = { ...category, ...updates };
    await storageService.updateCategory(updatedCategory, user.id);

    setCategories(prev =>
      prev.map(c =>
        c.id === folderId
          ? updatedCategory
          : c
      )
    );

    // Update selectedCategory if it's the one being updated
    if (selectedCategory?.id === folderId) {
      setSelectedCategory(updatedCategory);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      // Clear happens automatically via auth state change listener
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Show loading while checking auth
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show onboarding screen
  if (currentScreen === 'onboarding') {
    return (
      <OnboardingScreen
        onComplete={handleOnboardingComplete}
        onNavigateToLogin={() => setCurrentScreen('login')}
      />
    );
  }

  // Show login screen
  if (currentScreen === 'login') {
    return (
      <LoginScreen
        onLoginSuccess={() => setCurrentScreen('home')}
        onNavigateToSignup={() => setCurrentScreen('signup')}
      />
    );
  }

  // Show signup screen
  if (currentScreen === 'signup') {
    return (
      <SignupScreen
        onSignupSuccess={() => setCurrentScreen('login')}
        onNavigateToLogin={() => setCurrentScreen('login')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Screen Navigation - for demo purposes */}
      {/* Hide navigation when on scan screen to prevent accidental taps */}
      {hasCompletedOnboarding && currentScreen !== 'scan' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 z-50 shadow-lg">
          <div className="max-w-md mx-auto px-4 py-3">
            <div className="flex justify-center gap-2 overflow-x-auto">
              <Button
                onClick={() => {
                  console.log('🏠 Home button clicked');
                  setCurrentScreen('home');
                }}
                variant={currentScreen === 'home' ? 'default' : 'outline'}
                size="sm"
                className="whitespace-nowrap rounded-full"
              >
                Home
              </Button>
              <Button
                onClick={() => {
                  console.log('🔄 Swipe Mode button clicked');
                  setCurrentScreen('swipe');
                }}
                variant={currentScreen === 'swipe' ? 'default' : 'outline'}
                size="sm"
                className="whitespace-nowrap rounded-full"
              >
                Swipe Mode
              </Button>
              <Button
                onClick={() => {
                  console.log('📷 Scan button clicked');
                  setCurrentScreen('scan');
                }}
                variant={currentScreen === 'scan' ? 'default' : 'outline'}
                size="sm"
                className="whitespace-nowrap rounded-full"
              >
                Scan
              </Button>
              <Button
                onClick={() => {
                  console.log('💰 Deducts button clicked');
                  setCurrentScreen('deducts');
                }}
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
        />
      )}
      {currentScreen === 'scan' && (
        <ScanScreen
          onAddReceipt={handleAddReceipt}
          onClose={() => setCurrentScreen('home')}
        />
      )}
      {currentScreen === 'deducts' && (
        <DeductsScreen
          receipts={receipts}
          userEmail={user?.email}
        />
      )}

    </div>
  );
}