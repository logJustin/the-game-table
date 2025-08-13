# The Game Table

A mobile-first web app for friend groups to randomly select games and log gaming sessions. Built with a Roll20-inspired tabletop aesthetic.

## Features

- **Game Selection Spinner** - Add games to a digital wheel and spin for random selection
- **Session Logging** - Track games played, duration, winners, and session history
- **Multi-User Access** - Friends can join sessions from the same bookmarked URL
- **Real-time Updates** - Live updates as friends add games to the spinner
- **Roll20 Aesthetic** - Medieval/tabletop gaming visual design

## Tech Stack

- **Frontend:** Next.js 15 (React 19) with TypeScript
- **Styling:** Tailwind CSS (mobile-first responsive design)  
- **Database:** Supabase (PostgreSQL)
- **Real-time:** Supabase real-time subscriptions
- **Deployment:** Vercel
- **UI/Animation:** Framer Motion, Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Vercel account (for deployment)

### Setup

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
```bash
cp .env.example .env.local
```

3. **Set up Supabase database:**
Follow the database setup instructions in `docs/SETUP_GUIDE.md`

4. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Documentation

- **[Setup Guide](docs/SETUP_GUIDE.md)** - Complete step-by-step setup instructions
- **[Implementation Guide](docs/THE_GAME_TABLE_IMPLEMENTATION_GUIDE.md)** - Detailed technical specifications

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── app/           # Next.js app router pages
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── lib/           # Utility libraries (Supabase client)
├── types/         # TypeScript type definitions
└── utils/         # Helper functions
```

## Current Development Status

✅ **Completed:**
- Project setup and configuration
- Database schema and Supabase connection
- Environment configuration
- Basic project structure
- Roll20-inspired design specifications

🚧 **In Progress:**
- UI styling implementation
- Session management flows
- Game spinner component

📋 **Todo:**
- Real-time updates
- Game logging functionality
- Mobile optimizations
