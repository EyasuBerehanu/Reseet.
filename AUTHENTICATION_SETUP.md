# Authentication Setup Guide

Your app now has a complete Supabase authentication system! Here's how to set it up and use it.

## What's Been Implemented ✅

### Authentication Flow
- **Onboarding** → Create account during onboarding
- **Login Screen** → Sign in with email/password
- **Signup Screen** → Create new account
- **Protected Routes** → Only authenticated users can access the app
- **Auth State Listener** → Automatically updates UI when user signs in/out
- **Local Storage** → User data (receipts/categories) saved per user

### Files Created

1. **[src/lib/supabase.ts](src/lib/supabase.ts)** - Supabase client configuration
2. **[src/services/authService.ts](src/services/authService.ts)** - Authentication methods
3. **[src/services/storageService.ts](src/services/storageService.ts)** - Local storage per user
4. **[src/components/LoginScreen.tsx](src/components/LoginScreen.tsx)** - Login UI
5. **[src/components/SignupScreen.tsx](src/components/SignupScreen.tsx)** - Signup UI
6. **[src/components/OnboardingScreen.tsx](src/components/OnboardingScreen.tsx)** - Updated with signup

### App.tsx Changes
- Added auth state management
- Auto-load user data from localStorage on login
- Auto-save receipts/categories when they change
- Protected route logic
- Sign out functionality

## Setup Instructions

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub (or create an account)
4. Click "New Project"
5. Fill in:
   - **Name**: Receipt Tracker (or any name)
   - **Database Password**: Create a secure password (save this!)
   - **Region**: Choose closest to you
6. Click "Create new project" (takes ~2 minutes)

### Step 2: Get Your API Credentials

Once your project is created:

1. Go to **Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 3: Configure Your App

1. Open your `.env` file
2. Replace the placeholder values:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Save the file

### Step 4: Enable Email Auth in Supabase

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled (it should be by default)
3. Configure email settings:
   - **Enable email confirmations**: Optional (recommended OFF for testing)
   - **Secure email change**: Recommended ON
   - **Enable phone confirmations**: OFF (not used)

### Step 5: Configure Email Settings (Optional)

By default, Supabase sends confirmation emails. For development:

1. Go to **Authentication** → **Email Templates**
2. You can customize the email templates
3. For testing, you can disable email confirmation:
   - Go to **Authentication** → **Providers** → **Email**
   - Toggle OFF "Confirm email"

### Step 6: Rebuild and Test

```bash
npm run build
npx cap sync ios
open ios/App/App.xcworkspace
```

Run the app in Xcode (Cmd+R) and test:

## How It Works

### Complete Authentication Flow

```
1. App loads → Check if user is logged in
   ↓
2. If user exists:
   - Load receipts/categories from localStorage using userId
   - Navigate to Home screen
   ↓
3. If no user:
   - Show Onboarding screen
   ↓
4. Onboarding → User creates account (authService.signUp)
   - Email verification email sent by Supabase (if enabled)
   - Navigate to Home
   ↓
5. Or: User clicks "Log in" → LoginScreen
   - User enters credentials (authService.signIn)
   - On success → Navigate to Home
   ↓
6. User authenticated:
   - All receipts/categories saved to localStorage with userId prefix
   - Auth state listener monitors for changes
   ↓
7. Sign out (authService.signOut):
   - Clears Supabase session
   - Auth listener triggers → Navigate back to Login
```

### Data Storage

**Important**: The app uses **local storage only** for receipt data. Supabase is only used for authentication.

- Receipts stored as: `receipts_{userId}`
- Categories stored as: `categories_{userId}`
- Each user's data is completely isolated

### Authentication Methods

#### Sign Up
```typescript
await authService.signUp(email, password);
// Creates new user account
// Sends verification email (if enabled)
```

#### Sign In
```typescript
await authService.signIn(email, password);
// Authenticates user
// Returns user session
```

#### Sign Out
```typescript
await authService.signOut();
// Clears session
// Triggers auth state listener
```

#### Get Current User
```typescript
const user = await authService.getCurrentUser();
// Returns current authenticated user or null
```

#### Listen to Auth Changes
```typescript
const unsubscribe = authService.onAuthStateChange((user) => {
  if (user) {
    console.log('User signed in:', user.email);
  } else {
    console.log('User signed out');
  }
});

// Clean up listener when done
unsubscribe();
```

## User Experience

### Onboarding Flow
1. User sees 5-step onboarding carousel
2. Last step has signup form (email + password)
3. User creates account
4. Automatically logged in and navigated to Home
5. Link to login if they already have an account

### Login Flow
1. User enters email and password
2. Clicks "Sign In"
3. On success → Home screen with their saved data
4. On error → Error message displayed
5. Link to signup if they don't have an account

### Signup Flow
1. User enters email, password, confirm password
2. Password validation (min 6 characters, passwords match)
3. Creates account with Supabase
4. Success message shown
5. Redirected to login after 2 seconds

### Data Persistence
- User scans receipts → Saved to `localStorage` with their userId
- User creates categories → Saved to `localStorage` with their userId
- User signs out → Data stays in localStorage (not cleared)
- User signs back in → Data automatically loaded
- Different user signs in → Sees only their data

## Testing the Authentication

### Test Flow 1: New User
```
1. Open app → See onboarding
2. Go through carousel to signup step
3. Enter email: test@example.com
4. Enter password: test123
5. Click "Create Account"
6. Should navigate to Home with empty receipts
7. Scan a receipt
8. Sign out
9. Sign back in → Receipt should still be there
```

### Test Flow 2: Existing User
```
1. Open app → See onboarding
2. Click "Log in" link
3. Enter credentials
4. Click "Sign In"
5. Should see Home with your saved data
```

### Test Flow 3: Sign Out
```
1. On Home screen, tap profile/settings
2. Tap "Sign Out"
3. Should return to Login screen
4. App cleared from memory
5. Reopen app → Should show login screen
```

## Security Features

### What's Protected
✅ API keys stored in environment variables (gitignored)
✅ Passwords hashed by Supabase (bcrypt)
✅ HTTPS-only communication
✅ JWT tokens for session management
✅ User data isolated by userId
✅ Auto-logout on invalid session

### What's NOT Stored in Supabase Database
❌ Receipt images
❌ Receipt data (merchant, amount, etc.)
❌ Categories
❌ User preferences

**Only authentication data is in Supabase. All app data is local.**

## Troubleshooting

### "Invalid API key" Error
- Check that `.env` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Rebuild the app: `npm run build && npx cap sync ios`
- Restart Xcode

### "User already registered" Error
- Email is already in use
- Try logging in instead of signing up
- Or use a different email

### Email Confirmation Not Working
- Check Supabase Dashboard → Authentication → Providers → Email
- Disable "Confirm email" for testing
- Check spam folder for confirmation emails

### Can't Sign In
- Verify email and password are correct
- Check Supabase Dashboard → Authentication → Users to see if user exists
- Try resetting password (feature not implemented yet)

### Data Not Loading
- Check browser console for errors
- Verify localStorage has data: Open DevTools → Application → Local Storage
- Look for keys like `receipts_{userId}` and `categories_{userId}`

## Next Steps

### Optional Enhancements
1. **Password Reset** - Implement forgot password flow
2. **Email Verification** - Require users to verify email before using app
3. **Social Auth** - Add Google/Apple sign-in
4. **Profile Management** - Let users update email/password
5. **Cloud Sync** - Store receipts in Supabase database
6. **Multi-device Sync** - Access receipts from multiple devices

### Supabase Database (Future)
If you want to store receipts in the cloud:
1. Create tables in Supabase for receipts and categories
2. Update `storageService.ts` to use Supabase instead of localStorage
3. Implement real-time sync with Supabase Realtime

## Summary

You now have:
✅ **Complete authentication system** with Supabase
✅ **Onboarding flow** with signup
✅ **Login/Signup screens** with validation
✅ **Protected routes** requiring authentication
✅ **Per-user data isolation** in localStorage
✅ **Auto-save** of receipts and categories
✅ **Sign out** functionality
✅ **Session persistence** across app restarts

**Ready to use!** Just add your Supabase credentials to `.env` and you're all set! 🎉
