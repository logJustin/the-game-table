# The Game Table - Setup Guide

## Prerequisites
- Node.js 18+ installed
- Git installed
- GitHub account
- Vercel account (can sign up with GitHub)
- Supabase account (can sign up with GitHub)

## Step 1: Create Next.js Project

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Note: Using `.` creates the project in the current directory instead of creating a subdirectory.

## Step 2: Install Additional Dependencies

```bash
# Supabase client
npm install @supabase/supabase-js

# UI/Animation libraries for the tabletop aesthetic
npm install framer-motion lucide-react

# Date handling
npm install date-fns

# Form handling (if needed later)
npm install react-hook-form @hookform/resolvers zod
```

## Step 3: Set Up Supabase Database

### 3.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New project"
5. Choose your organization
6. Enter project details:
   - Name: `the-game-table`
   - Database Password: Generate a strong password and save it
   - Region: Choose closest to your users
7. Click "Create new project"
8. Wait for project to be created (2-3 minutes)

### 3.2 Set Up Database Schema
1. In your Supabase dashboard, go to "SQL Editor"
2. Click "New query"
3. Copy and paste this SQL to create all tables:

```sql
-- Create sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_name VARCHAR(100) NOT NULL,
  session_code VARCHAR(10) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  created_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  notes TEXT
);

-- Create current_games table
CREATE TABLE current_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  game_name VARCHAR(200) NOT NULL,
  added_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create game_logs table  
CREATE TABLE game_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  game_name VARCHAR(200) NOT NULL,
  winner VARCHAR(100),
  duration_minutes INTEGER,
  played_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

-- Create session_participants table
CREATE TABLE session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  participant_name VARCHAR(100) NOT NULL,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(session_id, participant_name)
);

-- Enable Row Level Security (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE current_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since we're not using auth)
CREATE POLICY "Allow all operations on sessions" ON sessions FOR ALL USING (true);
CREATE POLICY "Allow all operations on current_games" ON current_games FOR ALL USING (true);
CREATE POLICY "Allow all operations on game_logs" ON game_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations on session_participants" ON session_participants FOR ALL USING (true);
```

4. Click "Run" to execute the SQL
5. Verify tables were created in the "Table Editor" tab

### 3.3 Get Supabase Credentials
1. In Supabase dashboard, go to "Settings" → "API"
2. Copy these values (you'll need them for environment variables):
   - Project URL
   - `anon` `public` key
   - `service_role` `secret` key

## Step 4: Configure Environment Variables

### 4.1 Create Local Environment File
In your project root, create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4.2 Add to .gitignore
Make sure `.env.local` is in your `.gitignore` file:
```
# Local env files
.env*.local
```

## Step 5: Set Up Supabase Client

### 5.1 Create Supabase Utils
Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations (if needed)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### 5.2 Create Database Types (Optional but Recommended)
Create `src/types/database.ts`:

```typescript
export interface Session {
  id: string
  host_name: string
  session_code: string
  status: 'active' | 'ended'
  created_at: string
  ended_at: string | null
  notes: string | null
}

export interface CurrentGame {
  id: string
  session_id: string
  game_name: string
  added_by: string
  created_at: string
}

export interface GameLog {
  id: string
  session_id: string
  game_name: string
  winner: string | null
  duration_minutes: number | null
  played_at: string
  notes: string | null
}

export interface SessionParticipant {
  id: string
  session_id: string
  participant_name: string
  joined_at: string
}
```

## Step 6: Set Up Git Repository

### 6.1 Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit: Next.js app with Supabase setup"
```

### 6.2 Create GitHub Repository
1. Go to GitHub.com
2. Click "New repository"
3. Name it `the-game-table`
4. Don't initialize with README (since you already have files)
5. Click "Create repository"

### 6.3 Connect and Push
```bash
git remote add origin https://github.com/yourusername/the-game-table.git
git branch -M main
git push -u origin main
```

## Step 7: Deploy to Vercel

### 7.1 Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/in with GitHub
3. Click "New Project"
4. Import your `the-game-table` repository
5. Configure project:
   - Framework Preset: Next.js (should auto-detect)
   - Root Directory: ./
   - Build and Output Settings: Use defaults

### 7.2 Add Environment Variables in Vercel
1. In the project configuration, go to "Environment Variables"
2. Add each variable from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Click "Deploy"

### 7.3 Test Deployment
1. Wait for deployment to complete
2. Visit your deployed URL
3. Verify the basic Next.js app loads

## Step 8: Test Database Connection

### 8.1 Create Test Page
Create `src/app/test-db/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDb() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .limit(5)
        
        if (error) throw error
        
        setSessions(data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  if (loading) return <div>Testing database connection...</div>
  if (error) return <div>Database error: {error}</div>

  return (
    <div className="p-4">
      <h1>Database Connection Test</h1>
      <p>✅ Successfully connected to Supabase!</p>
      <p>Sessions found: {sessions.length}</p>
      {sessions.length > 0 && (
        <pre className="mt-4 p-4 bg-gray-100 rounded">
          {JSON.stringify(sessions, null, 2)}
        </pre>
      )}
    </div>
  )
}
```

### 8.2 Test Locally
```bash
npm run dev
```
Visit `http://localhost:3000/test-db` to verify database connection works.

### 8.3 Test in Production
1. Commit and push changes:
```bash
git add .
git commit -m "Add database connection test"
git push
```
2. Wait for Vercel to redeploy
3. Visit `your-app-url.vercel.app/test-db`

## Step 9: Clean Up and Prepare for Development

### 9.1 Remove Test Page
Once you've verified everything works:
```bash
rm -rf src/app/test-db
```

### 9.2 Set Up Basic Project Structure
```bash
mkdir -p src/components src/hooks src/utils
touch src/components/.gitkeep src/hooks/.gitkeep src/utils/.gitkeep
```

### 9.3 Final Commit
```bash
git add .
git commit -m "Clean up and prepare project structure for development"
git push
```

## ✅ Setup Complete!

You now have:
- ✅ Next.js 14 app with TypeScript and Tailwind
- ✅ Supabase database with all required tables
- ✅ Environment variables configured locally and in production
- ✅ Deployed to Vercel with automatic deployments
- ✅ Database connection tested and working
- ✅ Project structure ready for feature development

## Next Steps
You're ready to start implementing the core features:
1. Create basic UI layout with Roll20 styling
2. Implement session creation and joining
3. Build the game spinner component
4. Add real-time updates
5. Implement game logging

## Troubleshooting

**Database Connection Issues:**
- Verify environment variables are set correctly
- Check Supabase project is running (not paused)
- Ensure RLS policies are created

**Deployment Issues:**
- Check Vercel environment variables match local ones
- Verify build logs for any TypeScript errors
- Ensure all dependencies are in package.json

**Local Development Issues:**
- Run `npm install` if packages are missing
- Clear `.next` folder and restart dev server
- Check Node.js version is 18+