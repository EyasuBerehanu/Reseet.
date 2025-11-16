import { Receipt, Category } from '../App';
import { supabase } from '../lib/supabase';

export const storageService = {
  // Fetch all receipts for a user from Supabase
  async getReceipts(userId: string): Promise<Receipt[]> {
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching receipts:', error);
      return [];
    }

    console.log('📥 Raw receipts from database:', data);

    // Transform database format to app format
    const receipts = (data || []).map((row: any) => ({
      id: row.id,
      merchant: row.merchant,
      date: row.date,
      category: row.category,
      amount: parseFloat(row.amount),
      score: row.score,
      items: row.items || [],
      subtotal: parseFloat(row.subtotal),
      tax: parseFloat(row.tax),
      folderId: row.folder_id,
      imageUrl: row.image_url,
      discount: row.discount ? parseFloat(row.discount) : undefined,
      tip: row.tip ? parseFloat(row.tip) : undefined,
      paymentMethod: row.payment_method || undefined,
    }));

    console.log('📥 Transformed receipts:', receipts);
    return receipts;
  },

  // Save a single receipt to Supabase
  async saveReceipt(receipt: Omit<Receipt, 'id'>, userId: string): Promise<Receipt | null> {
    const { data, error } = await supabase
      .from('receipts')
      .insert({
        user_id: userId,
        merchant: receipt.merchant,
        date: receipt.date,
        category: receipt.category,
        amount: receipt.amount,
        score: receipt.score,
        items: receipt.items,
        subtotal: receipt.subtotal,
        tax: receipt.tax,
        folder_id: receipt.folderId || null,
        image_url: receipt.imageUrl || null,
        discount: receipt.discount || null,
        tip: receipt.tip || null,
        payment_method: receipt.paymentMethod || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving receipt:', error);
      return null;
    }

    return data ? {
      id: data.id,
      merchant: data.merchant,
      date: data.date,
      category: data.category,
      amount: parseFloat(data.amount),
      score: data.score,
      items: data.items,
      subtotal: parseFloat(data.subtotal),
      tax: parseFloat(data.tax),
      folderId: data.folder_id,
      imageUrl: data.image_url,
      discount: data.discount ? parseFloat(data.discount) : undefined,
      tip: data.tip ? parseFloat(data.tip) : undefined,
      paymentMethod: data.payment_method || undefined,
    } : null;
  },

  // Update a receipt in Supabase
  async updateReceipt(receipt: Receipt, userId: string): Promise<boolean> {
    console.log('💾 Updating receipt in database:', {
      receiptId: receipt.id,
      folderId: receipt.folderId,
      userId
    });

    const { data, error } = await supabase
      .from('receipts')
      .update({
        merchant: receipt.merchant,
        date: receipt.date,
        category: receipt.category,
        amount: receipt.amount,
        score: receipt.score,
        items: receipt.items,
        subtotal: receipt.subtotal,
        tax: receipt.tax,
        folder_id: receipt.folderId || null,
        image_url: receipt.imageUrl || null,
        discount: receipt.discount || null,
        tip: receipt.tip || null,
        payment_method: receipt.paymentMethod || null,
      })
      .eq('id', receipt.id)
      .eq('user_id', userId)
      .select();

    console.log('💾 Database update response:', { data, error });

    if (error) {
      console.error('Error updating receipt:', error);
      return false;
    }

    return true;
  },

  // Delete a receipt from Supabase
  async deleteReceipt(receiptId: number, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('receipts')
      .delete()
      .eq('id', receiptId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting receipt:', error);
      return false;
    }

    return true;
  },

  // Fetch all categories for a user from Supabase
  async getCategories(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      label: row.label,
      color: row.color,
    }));
  },

  // Save a single category to Supabase
  async saveCategory(category: Omit<Category, 'id'>, userId: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        label: category.label,
        color: category.color,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving category:', error);
      return null;
    }

    return data ? {
      id: data.id,
      label: data.label,
      color: data.color,
    } : null;
  },

  // Update a category in Supabase
  async updateCategory(category: Category, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('categories')
      .update({
        label: category.label,
        color: category.color,
      })
      .eq('id', category.id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating category:', error);
      return false;
    }

    return true;
  },

  // Delete a category from Supabase
  async deleteCategory(categoryId: number, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting category:', error);
      return false;
    }

    return true;
  },
};
