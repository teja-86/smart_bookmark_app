# 🔖 Smart Bookmark App
A real-time, secure bookmark manager built with Next.js (App Router), Supabase, and Tailwind CSS.

## 🌍 Live Demo

🔗 Live URL: https://smart-bookmark-app-sandy.vercel.app

Test Credentials:
- Sign in using your own Google account.
- Open two tabs to test real-time sync.

## 🛠 Tech Stack

- Next.js 14 (App Router)
- Supabase (Auth, PostgreSQL, Realtime)
- Google OAuth
- Tailwind CSS
- Vercel (Deployment)

## ✨ Features

- 🔐 Google OAuth Authentication (No email/password)
- 👤 Private bookmarks per user (RLS secured)
- ➕ Add bookmarks (Title + URL)
- 🗑 Delete bookmarks
- ⚡ Real-time updates across browser tabs
- 🔒 Secure database policies using Row Level Security

## 🏗 Architecture Overview

Frontend: Next.js (App Router, Client Components)  
Backend: Supabase (Auth + PostgreSQL + Realtime)  
Security: Row Level Security (RLS)  
Deployment: Vercel

## 🗄 Database Schema

Table: bookmarks

| Column      | Type      |
|------------|----------|
| id         | uuid (PK) |
| user_id    | uuid (FK → auth.users) |
| title      | text |
| url        | text |
| created_at | timestamptz |

## 🔒 Row Level Security (RLS)

- Users can view only their own bookmarks.
- Users can insert bookmarks only for themselves.
- Users can delete only their own bookmarks.

Policy condition:
auth.uid() = user_id

## ⚡ Realtime Implementation

Used Supabase Realtime channels to listen for:

- INSERT
- DELETE
- SELECT
- UPDATE

Any change in the bookmarks table triggers UI refresh instantly across open tabs.

## 🚧 Challenges & Solutions

### 1. Google OAuth Redirect Issues
Problem: Login worked locally but failed in production.

Solution: Added correct Vercel callback URL in Supabase OAuth settings.

### 2. RLS Blocking Inserts
Problem: Insert queries failed silently.

Solution: Added proper INSERT policy using auth.uid() = user_id.

### 3. Realtime Not Triggering
Problem: Subscriptions were not working.

Solution: Enabled Realtime for bookmarks table in Supabase dashboard.

### 4. Session Persistence
Problem: User session lost on page refresh.

Solution: Implemented Supabase session handling using auth state listener.

## 🧑‍💻 Run Locally

1. Clone the repo
2. Install dependencies

```bash
npm install
```

3. Add environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL= 

NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

4. Run the app

```bash
npm run dev
```

## 🚀 Future Improvements

- Edit bookmark feature
- Bookmark categorization
- Search & filter
- Drag & drop reordering
- Dark mode


