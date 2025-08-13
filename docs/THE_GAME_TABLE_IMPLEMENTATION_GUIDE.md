# The Game Table - Implementation Guide

## Project Overview
A mobile-first web app for friend groups to randomly select games and log gaming sessions. Built with Next.js, Supabase, and deployed on Vercel.

## Core Features
1. **Game Selection Spinner** - Add games to a digital wheel and spin for random selection
2. **Session Logging** - Track games played, duration, winners, and session history
3. **Multi-User Access** - Friends can join sessions from the same bookmarked URL
4. **Real-time Updates** - Live updates as friends add games to the spinner

## Tech Stack
- **Frontend:** Next.js 14 (React) with TypeScript
- **Styling:** Tailwind CSS (mobile-first responsive design)
- **Database:** Supabase (PostgreSQL)
- **Real-time:** Supabase real-time subscriptions
- **Deployment:** Vercel
- **Authentication:** Session-based (no user accounts required)

## UI/UX Design - Roll20 Inspired Tabletop Aesthetic

### Color Palette
```css
/* Primary Colors */
--burgundy-primary: #8B1538;
--burgundy-dark: #6B0F2A;
--burgundy-light: #A5486B;

/* Wood & Leather Tones */
--wood-brown: #4A3429;
--leather-dark: #2C1810;
--leather-light: #5C4033;

/* Accent Colors */
--brass-gold: #B8860B;
--brass-light: #DAA520;
--brass-dark: #996F00;

/* Text & Parchment */
--parchment: #F5F5DC;
--parchment-aged: #E6DDD4;
--ink-dark: #2F1B14;
```

### Visual Design Elements

**Game Spinner/Wheel:**
- Wooden texture background with realistic grain patterns
- Brass rim and center hub with subtle metallic shine
- Game segments with alternating wood stains (light/dark)
- Hand-carved appearance with slightly irregular edges
- Brass pointer with shadow and depth

**Interface Components:**
- **Panels/Cards:** Leather-bound book aesthetic with worn edges and subtle embossing
- **Buttons:** Brass button styling with raised appearance and tactile press feedback
- **Input Fields:** Parchment background with ink-well styling
- **Headers:** Medieval-inspired typography with decorative flourishes
- **Navigation:** Tab system styled like book tabs with brass corner details

**Textures & Backgrounds:**
- Primary background: Dark wood grain texture
- Content areas: Aged parchment with subtle staining
- Modal overlays: Rich leather with brass corner accents
- Cards: Layered paper with realistic shadows

### Typography
```css
/* Headings - Medieval/Fantasy Feel */
font-family: 'Cinzel', 'Times New Roman', serif;

/* Body Text - Readable Serif */
font-family: 'Crimson Text', 'Georgia', serif;

/* UI Elements - Clean Sans */
font-family: 'Inter', 'Arial', sans-serif;
```

### Interactive Elements

**Button States:**
- Default: Raised brass appearance with subtle glow
- Hover: Brightened brass with enhanced shadow
- Active: Pressed inset appearance with darker tone
- Disabled: Tarnished brass with reduced opacity

**Touch Interactions (Mobile):**
- Haptic feedback simulation through animations
- Larger touch targets (min 44px) styled as game tokens
- Swipe gestures with realistic physics
- Long-press for contextual actions

**Sound Design:**
- Wheel spinning: Realistic clicking/ratcheting sound
- Button presses: Subtle brass tap sound
- Game selection: Satisfying "thunk" when wheel stops
- Notifications: Gentle bell chime
- Background: Optional subtle tavern ambience

### Animation Principles
- **Realistic Physics:** Spinner wheel with momentum and friction
- **Tactile Feedback:** Buttons depress and spring back
- **Smooth Transitions:** Page changes feel like turning book pages
- **Micro-interactions:** Hover states, loading animations, success confirmations
- **Performance:** 60fps animations optimized for mobile

### Mobile Adaptations
- **Touch Targets:** Minimum 44px, styled as physical game pieces
- **Gestures:** 
  - Swipe left/right: Navigate between sections
  - Pull to refresh: Update session data
  - Long press: Edit/delete actions
- **Responsive Textures:** Simplified textures for smaller screens
- **Readable Text:** Increased contrast on parchment backgrounds

### Component Styling Examples

**Game Spinner:**
- Canvas-based with wooden texture mapping
- Realistic lighting effects and shadows
- Brass details rendered with CSS gradients
- Smooth rotation with easing curves

**Session Cards:**
- Leather texture with stitched edges
- Brass corner reinforcements
- Slight tilt and shadow for depth
- Hover effect: gentle lift animation

**Form Inputs:**
- Parchment background with subtle texture
- Ink-well style focus states
- Quill pen cursor icon
- Handwritten font for placeholder text

### Accessibility Considerations
- High contrast mode: Enhanced parchment/ink contrast
- Reduced motion: Disable texture animations, keep functional animations
- Screen readers: Proper ARIA labels with medieval flavor ("Spin the Wheel of Fate")
- Touch accessibility: Larger targets, clear visual feedback

## Database Schema

### sessions
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_name VARCHAR(100) NOT NULL,
  session_code VARCHAR(10) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  created_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  notes TEXT
);
```

### current_games
```sql
CREATE TABLE current_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  game_name VARCHAR(200) NOT NULL,
  added_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### game_logs
```sql
CREATE TABLE game_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  game_name VARCHAR(200) NOT NULL,
  winner VARCHAR(100),
  duration_minutes INTEGER,
  played_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);
```

### session_participants
```sql
CREATE TABLE session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  participant_name VARCHAR(100) NOT NULL,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(session_id, participant_name)
);
```

## User Flows

### Host Flow
1. **Start Session:**
   - Visit app homepage
   - Click "Host New Session"
   - Enter host name
   - Generate unique session code
   - Share main app URL with friends

2. **Manage Session:**
   - Add games to spinner
   - Watch real-time updates as friends add games
   - Spin wheel to select game
   - Start/track game duration
   - Log winner and session details

3. **View History:**
   - Access past sessions and statistics
   - Edit game logs retroactively if needed

### Friend Flow
1. **Join Session:**
   - Visit bookmarked app URL
   - See "Active Session" with host name
   - Enter name to join session
   - Add games to spinner
   - Watch wheel spin and participate

2. **No Active Session:**
   - See session history
   - View past games and statistics

## Key Pages & Components

### Pages
- `/` - Homepage (join active session or view history)
- `/host` - Create new session
- `/session/[code]` - Active session page with spinner
- `/history` - Session history and statistics
- `/edit/[logId]` - Edit game log retroactively

### Components
- `GameSpinner` - Animated wheel with game options
- `SessionLobby` - Show participants and game list
- `GameTimer` - Track game duration
- `SessionHistory` - Display past sessions
- `GameLogForm` - Log game results
- `JoinSession` - Enter name to join active session

## Technical Implementation

### Real-time Features
```javascript
// Subscribe to current games updates
const supabase = createClient()
const channel = supabase
  .channel('current_games')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'current_games',
    filter: `session_id=eq.${sessionId}`
  }, (payload) => {
    // Update spinner with new game
  })
  .subscribe()
```

### Game Spinner Logic
- Canvas-based wheel with game segments
- Smooth rotation animation with easing
- Random spin duration and final position
- Visual feedback and sound effects

### Session Management
```javascript
// Check for active session
const getActiveSession = async () => {
  const { data } = await supabase
    .from('sessions')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
  return data?.[0] || null
}
```

### Mobile-First Design
- Touch-friendly spinner interaction
- Large tap targets for game entry
- Responsive typography and spacing
- PWA capabilities for app-like experience

## API Routes

### `/api/sessions`
- `POST` - Create new session
- `GET` - Get active session
- `PATCH` - End session

### `/api/games`
- `POST` - Add game to current session
- `DELETE` - Remove game from session

### `/api/logs`
- `POST` - Log completed game
- `PATCH` - Update game log retroactively
- `GET` - Fetch session history

## Deployment Configuration

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Vercel Configuration
- Automatic deployments from main branch
- Environment variables configured in Vercel dashboard
- Edge functions for real-time features

## Statistics & Analytics

### Session Statistics
- Total sessions hosted
- Most played games
- Average session duration
- Participant frequency

### Game Analytics
- Game popularity rankings
- Win rates by participant
- Session duration trends
- Monthly/weekly activity

## Future Enhancements (V2)
- Game difficulty ratings
- Player preferences learning
- Integration with BoardGameGeek API
- Photo uploads for sessions
- Push notifications for session invites
- Multiple simultaneous sessions support

## Development Priority
1. **Phase 1:** Basic session creation and joining
2. **Phase 2:** Game spinner with real-time updates
3. **Phase 3:** Game logging and winner tracking
4. **Phase 4:** Session history and statistics
5. **Phase 5:** Retroactive editing and mobile optimizations

## Success Metrics
- Friends can join and contribute to game selection seamlessly
- Spinner provides fun, random game selection
- Complete session history with searchable logs
- Mobile-optimized experience works smoothly
- Zero-friction bookmark-and-join user experience