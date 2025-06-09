# Vanbox Deployment Guide

## Prerequisites

1. **Supabase Project**: Create a new project at [supabase.com](https://supabase.com)
2. **Google Cloud Console**: Set up OAuth credentials
3. **Vercel Account**: For hosting (or your preferred hosting platform)

## Step 1: Supabase Setup

### 1.1 Create Database Table

Execute this SQL in your Supabase SQL editor:

```sql
-- Create the entries table
CREATE TABLE entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at_user_tz TEXT NOT NULL,
  created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_entries_user_id ON entries(user_id);
CREATE INDEX idx_entries_created_at_utc ON entries(created_at_utc);

-- Enable Row Level Security
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own entries" ON entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entries" ON entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 1.2 Configure Authentication

1. Go to **Authentication > Providers** in your Supabase dashboard
2. Enable the **Google** provider
3. You'll need to set up Google OAuth credentials (see next step)

### 1.3 Get Supabase Credentials

From your Supabase project dashboard:
- Go to **Settings > API**
- Copy the **Project URL** and **anon/public key**

## Step 2: Google OAuth Setup

### 2.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** and **Google OAuth2 API**

### 2.2 Create OAuth Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client IDs**
3. Set application type to **Web application**
4. Add authorized redirect URIs:
   - For development: `http://localhost:3000/auth/callback`
   - For production: `https://yourdomain.com/auth/callback`
   - Supabase callback: `https://your-project.supabase.co/auth/v1/callback`

### 2.3 Configure Supabase with Google Credentials

1. In Supabase, go to **Authentication > Providers > Google**
2. Enable the provider
3. Add your Google **Client ID** and **Client Secret**
4. Save the configuration

## Step 3: Deploy to Vercel

### 3.1 Connect Repository

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Vercel will auto-detect this as a Next.js project

### 3.2 Configure Environment Variables

In Vercel dashboard, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3.3 Update OAuth Redirect URLs

After deployment, update your Google OAuth configuration:
1. Add your Vercel URL to authorized origins
2. Add `https://your-app.vercel.app/auth/callback` to redirect URIs
3. Update Supabase redirect URL settings

## Step 4: Custom Domain (Optional)

If using a custom domain:
1. Configure domain in Vercel dashboard
2. Update all OAuth redirect URLs to use your custom domain
3. Update Supabase site URL in **Authentication > URL Configuration**

## Step 5: Icons and Branding

Replace placeholder icon files in `/public/icons/` with actual icons:
- `icon-192x192.png` - 192x192px PNG
- `icon-512x512.png` - 512x512px PNG  
- `maskable-icon.png` - 192x192px PNG with safe zone for masking
- `favicon.ico` - Standard favicon

Use tools like [PWA Asset Generator](https://github.com/pwa-builder/pwa-starter/tree/master/docs) or [Favicon Generator](https://realfavicongenerator.net/) to create proper icon sets.

## Step 6: Testing

### 6.1 PWA Installation

1. Visit your deployed app on a mobile device
2. You should see an "Add to Home Screen" prompt
3. Test the app works offline (should show offline page)

### 6.2 Authentication Flow

1. Test Google sign-in
2. Verify notes can be saved
3. Test data export functionality
4. Test logout

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJ0eXAiOiJKV1QiLCJhbGc...` |

## Troubleshooting

### Common Issues

1. **Authentication not working**: Check redirect URLs match exactly
2. **Database permissions**: Ensure RLS policies are correctly set up
3. **PWA not installing**: Verify manifest.json is accessible and valid
4. **Icons not showing**: Make sure icon files are actual PNG images, not text files

### Support

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs) 