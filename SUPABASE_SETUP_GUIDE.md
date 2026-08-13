# Supabase Configuration Guide

## Step 1: Access Your Supabase Project

You already have credentials for: `https://aprbvohpkjxzsfbddvvw.supabase.com`

1. Go to [supabase.com](https://supabase.com)
2. Sign in with your account
3. Select your project: **aprbvohpkjxzsfbddvvw**

## Step 2: Enable Email/Password Authentication

1. In Supabase dashboard, go to **Authentication** (left sidebar)
2. Click **Providers** tab
3. Find **Email** provider
4. Ensure "Email" is **enabled** (toggle ON)
5. Make sure "Confirm email" is configured as needed

## Step 3: Create Database Tables for Users

Go to **SQL Editor** and run this query to create a users table:

```sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can read their own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Create policy to allow users to insert their own data
CREATE POLICY "Users can insert their own data"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update their own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);
```

## Step 4: Verify Your Credentials

1. Go to **Settings** (left sidebar, bottom)
2. Click **API** tab
3. Copy your:
   - **Project URL**: `https://aprbvohpkjxzsfbddvvw.supabase.com`
   - **Anon Key**: Copy the public anon key

These should match what's in your `.env` files:
- Frontend: `CollaborativeApp/.env`
- Backend: `CollaborativeApp/backend/.env`

## Step 5: Test Email Verification

1. Go to **Authentication** → **Users**
2. You should see test users appearing here after signup

## Step 6: Configure CORS (if needed)

If you still get CORS errors:
1. Go to **Settings** → **API**
2. Scroll to **CORS** settings
3. Add your frontend URL: `http://localhost:5173`
4. Click **Save**

## Troubleshooting

### Error: "AuthRetryableFetchError: fetch failed"
- Check your internet connection
- Verify the Supabase URL is accessible
- Ensure Supabase project is active (not paused)
- Check if Email provider is enabled

### Error: "User already exists"
- This means the email was already registered
- Try signing up with a different email

### Error: "Invalid credentials"
- Double-check your ANON_KEY in `.env` files
- Make sure there are no extra spaces or characters
- Restart the dev server after updating `.env`

## Next Steps

After configuration:
1. Test signup with a real email
2. Check **Authentication** → **Users** in Supabase dashboard
3. Verify the user appears after signup
4. Implement email verification if needed
