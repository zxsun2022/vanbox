# Vanbox

A minimalist, mobile-first PWA for personal text capture and note-taking.

## Overview

Vanbox is your personal text capsule - a simple, fast, and secure way to capture thoughts, ideas, and notes instantly. Built as a Progressive Web App (PWA) with modern web technologies.

## Features

- **Instant Capture**: Quick text input with auto-expand textarea
- **Secure & Private**: Google OAuth authentication with Supabase backend
- **Mobile-First**: Responsive design optimized for mobile devices
- **PWA Support**: Install on any device, works offline
- **History Management**: View, manage, and delete your notes
- **Data Export**: Download all your notes as Markdown

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database + Authentication)
- **Deployment**: Vercel (recommended)

## Quick Start

```bash
cd vanbox-app
npm install
npm run dev
```

Visit `http://localhost:3000` to start using Vanbox.

## Project Structure

```
vanbox/
├── vanbox-app/          # Main Next.js application
│   ├── src/
│   │   ├── app/         # App Router pages
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utility libraries
│   ├── public/          # Static assets
│   └── ...
├── prd.md              # Product Requirements Document
└── deploy.md           # Deployment Guide
```

## Documentation

- [Product Requirements Document](./prd.md) - Detailed feature specifications
- [Deployment Guide](./deploy.md) - Step-by-step deployment instructions
- [App README](./vanbox-app/README.md) - Technical implementation details

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd vanbox
   ```

2. **Set up the application**
   ```bash
   cd vanbox-app
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env.local`
   - Add your Supabase credentials

4. **Run the development server**
   ```bash
   npm run dev
   ```

For detailed setup instructions, see the [Deployment Guide](./deploy.md).

## License

This project is open source and available under the [MIT License](LICENSE). 