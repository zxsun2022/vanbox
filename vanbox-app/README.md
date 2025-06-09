# Vanbox - Your Personal Text Capsule

A minimalist, mobile-first PWA designed for quick, personal text capture. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Quick Text Capture**: Simple textarea for capturing thoughts and notes
- **Google Authentication**: Secure login with Google OAuth
- **Character Limit**: 5000 character limit with real-time counter
- **Data Export**: Download all your notes as a Markdown file
- **PWA Support**: Install as a native app on mobile devices
- **Responsive Design**: Mobile-first, works great on all devices
- **Real-time Feedback**: Toast notifications for all actions

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Supabase Database Setup

Create the following table in your Supabase database:

```sql
-- Create the entries table
CREATE TABLE entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at_user_tz TEXT NOT NULL,
  created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index for performance
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

### 3. Supabase Authentication Setup

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Google OAuth provider
4. Add your domain to the allowed redirect URLs
5. Configure Google OAuth with your Google Cloud Console credentials

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically with each push

### Environment Variables for Production

Make sure to set these in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main application page
│   └── login/
│       └── page.tsx        # Login page
├── components/
│   └── Toast.tsx           # Toast notification component
├── contexts/
│   └── ToastContext.tsx    # Global toast management
├── hooks/
│   └── useAuth.ts          # Authentication hook
└── lib/
    └── supabase.ts         # Supabase client configuration

public/
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── offline.html            # Offline fallback page
└── icons/                  # PWA icons (to be added)
```

## Technologies Used

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Icons**: Lucide React
- **PWA**: Service Worker, Web App Manifest

## User Stories Implemented

✅ Google OAuth login  
✅ Text input with character counter (5000 limit)  
✅ Save notes with local timestamp  
✅ Success/error feedback  
✅ Data export as Markdown  
✅ Logout functionality  
✅ PWA support (installable)  
✅ Mobile-responsive design  
✅ Error handling for edge cases  

## License

MIT License - see LICENSE file for details.
