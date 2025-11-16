# Supabase Database Setup Guide

Your app now stores all receipts and categories in the Supabase database (cloud storage)! This means:
- ✅ Data persists across sessions and app restarts
- ✅ Data syncs across multiple devices
- ✅ No more "asking to log back in" when you swipe out
- ✅ Each user's data is completely isolated and secure

## Setup Instructions

### Step 1: Create Database Tables

1. Go to your Supabase project dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project (`pbfwkycxnmxflqngztvi`)
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of [SUPABASE_DATABASE_SETUP.sql](SUPABASE_DATABASE_SETUP.sql)
6. Paste it into the SQL editor
7. Click **Run** (or press Cmd+Enter)

You should see: **Success. No rows returned**

### Step 2: Verify Tables Created

1. Go to **Database** → **Tables** in the left sidebar
2. You should see two new tables:
   - `categories` - Stores user's custom categories/folders
   - `receipts` - Stores scanned receipts with all details

### Step 3: Test the App

1. Open the app in Xcode
2. Run on your device
3. Sign in (or create a new account)
4. Scan a receipt
5. Close the app completely (swipe up)
6. Reopen the app
7. **Your receipt should still be there!** 🎉

## What's Changed

### Before (localStorage)
- ❌ Data stored in browser only
- ❌ Lost on app close/reinstall
- ❌ No sync across devices
- ❌ Session expired frequently

### Now (Supabase Database)
- ✅ Data stored in cloud
- ✅ Persists forever
- ✅ Syncs across devices
- ✅ Session stays logged in

## How It Works

### Data Flow

```
1. User scans receipt
   ↓
2. Receipt saved to Supabase database
   ↓
3. Local state updated (for instant UI)
   ↓
4. User closes app
   ↓
5. Reopens app → Data loaded from Supabase
   ↓
6. All receipts appear instantly!
```

### Database Schema

**receipts table:**
```sql
- id (auto-increment)
- user_id (UUID) - Links to auth.users
- merchant (text)
- date (text)
- category (text)
- amount (decimal)
- score (integer)
- items (jsonb) - Array of line items
- subtotal (decimal)
- tax (decimal)
- folder_id (references categories.id)
- created_at (timestamp)
- updated_at (timestamp)
```

**categories table:**
```sql
- id (auto-increment)
- user_id (UUID) - Links to auth.users
- label (text)
- color (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### Row Level Security (RLS)

All data is protected by Row Level Security policies:
- Users can **ONLY** see their own receipts
- Users can **ONLY** see their own categories
- Users **CANNOT** access other users' data
- All queries automatically filtered by `user_id`

## API Operations

### Receipts
- `storageService.getReceipts(userId)` - Fetch all receipts
- `storageService.saveReceipt(receipt, userId)` - Create new receipt
- `storageService.updateReceipt(receipt, userId)` - Update receipt
- `storageService.deleteReceipt(receiptId, userId)` - Delete receipt

### Categories
- `storageService.getCategories(userId)` - Fetch all categories
- `storageService.saveCategory(category, userId)` - Create category
- `storageService.updateCategory(category, userId)` - Update category
- `storageService.deleteCategory(categoryId, userId)` - Delete category

## Viewing Your Data

### In Supabase Dashboard

1. Go to **Database** → **Table Editor**
2. Select `receipts` or `categories`
3. View all your data in a spreadsheet-like interface
4. You can manually edit, add, or delete rows

### SQL Queries

You can run custom queries in the SQL Editor:

```sql
-- View all receipts for a specific user
SELECT * FROM receipts WHERE user_id = 'your-user-id';

-- Count receipts by category
SELECT category, COUNT(*) as count
FROM receipts
WHERE user_id = 'your-user-id'
GROUP BY category;

-- View total spending
SELECT SUM(amount) as total_spent
FROM receipts
WHERE user_id = 'your-user-id';
```

## Troubleshooting

### "No data appearing after setup"
- Check that you ran the SQL setup script
- Verify tables exist in **Database** → **Tables**
- Check browser console for errors

### "Permission denied" errors
- Ensure RLS policies are enabled
- Verify you're logged in with the correct user
- Check that `user_id` matches `auth.uid()`

### "Data not syncing"
- Check your internet connection
- Look for errors in browser console
- Verify Supabase API credentials in `.env`

### "Session expiring too often"
- This should be fixed with database storage
- Check that auth state listener is working
- Ensure Supabase session is being maintained

## Next Steps

### Optional Enhancements

1. **Real-time Sync** - Add Supabase Realtime subscriptions
   ```typescript
   supabase
     .channel('receipts')
     .on('postgres_changes', {
       event: '*',
       schema: 'public',
       table: 'receipts'
     }, payload => {
       // Update local state when data changes
     })
     .subscribe();
   ```

2. **Offline Support** - Cache data locally for offline access
3. **Export Data** - Download all receipts as CSV/PDF
4. **Receipt Images** - Store scanned images in Supabase Storage
5. **Search** - Full-text search across receipts

## Summary

You now have:
- ✅ **Cloud storage** for all receipts and categories
- ✅ **Persistent sessions** - No more logging in repeatedly
- ✅ **Data security** with Row Level Security
- ✅ **Cross-device sync** capability
- ✅ **Automatic backups** via Supabase

Your data is now safely stored in the cloud and will persist across app restarts, device changes, and more! 🎉

**No more lost receipts!** 📸💾
