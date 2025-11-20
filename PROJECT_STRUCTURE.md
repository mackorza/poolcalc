# Project Structure

```
poolcalc/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions
│   │   └── tournament.ts         # Tournament CRUD operations
│   ├── admin/                    # Admin pages
│   │   └── page.tsx             # Create tournament form
│   ├── tournament/[id]/          # Dynamic tournament pages
│   │   └── page.tsx             # Tournament view (server component)
│   ├── tournaments/              # Tournaments list
│   │   └── page.tsx             # All tournaments page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
│
├── components/                   # React Components
│   ├── AdminPanel.tsx           # Score entry interface
│   ├── Leaderboard.tsx          # Live standings display
│   ├── MatchSchedule.tsx        # Match schedule view
│   └── TournamentView.tsx       # Main tournament component (real-time)
│
├── lib/                         # Utilities and helpers
│   ├── supabase/                # Supabase clients
│   │   ├── client.ts           # Browser client
│   │   └── server.ts           # Server client
│   ├── tournament/              # Tournament logic
│   │   └── utils.ts            # Team generation & scheduling algorithms
│   └── types/                   # TypeScript types
│       └── database.ts         # Database schema types
│
├── supabase/                    # Database
│   └── migrations/              # SQL migrations
│       └── 001_initial_schema.sql  # Tables, indexes, triggers
│
├── .env.local                   # Environment variables (your Supabase keys)
├── README.md                    # Full documentation
├── SETUP.md                     # Quick setup guide
└── PROJECT_STRUCTURE.md         # This file

```

## Key Files Explained

### App Router (app/)

**app/page.tsx**
- Landing page with features overview
- Links to create tournament and view all tournaments

**app/admin/page.tsx**
- Tournament creation form
- Collects venue, date, players
- Generates teams and matches on submit

**app/tournament/[id]/page.tsx**
- Server component that fetches tournament data
- Passes data to TournamentView for client-side real-time updates

**app/actions/tournament.ts**
- `createTournament()` - Creates tournament, teams, and matches
- `updateMatchWinner()` - Records match results
- `updateTournamentStatus()` - Changes tournament status

### Components

**TournamentView.tsx**
- Main tournament display
- Sets up Supabase Realtime subscriptions
- Updates when matches complete
- Toggles admin panel

**Leaderboard.tsx**
- Displays teams sorted by points
- Shows win/loss records
- Highlights top 3 teams

**MatchSchedule.tsx**
- Groups matches by round
- Shows table assignments
- Highlights completed matches

**AdminPanel.tsx**
- Lists incomplete matches
- Click-to-select winner
- Tournament status controls

### Database (supabase/)

**001_initial_schema.sql**
- Creates 3 tables: tournaments, teams, matches
- Sets up indexes for performance
- Creates triggers for auto-updating team stats
- Enables Row Level Security (RLS)
- Sets up real-time subscriptions

### Tournament Logic (lib/tournament/utils.ts)

**Team Generation**
- `shuffleArray()` - Fisher-Yates shuffle
- `createRandomizedTeams()` - Pairs players into teams

**Match Scheduling**
- `generateRoundRobinSchedule()` - Round-robin algorithm
- `calculateTotalMatches()` - Total matches needed
- `calculateTotalRounds()` - Total rounds needed

## Data Flow

### Creating a Tournament

```
1. User fills form (app/admin/page.tsx)
   ↓
2. Form submits to createTournament() server action
   ↓
3. Server action:
   - Creates tournament record
   - Generates randomized teams
   - Generates round-robin schedule
   - Inserts all matches
   ↓
4. User redirected to tournament page
```

### Viewing Tournament (Real-time)

```
1. Server fetches initial data (app/tournament/[id]/page.tsx)
   ↓
2. Data passed to TournamentView component
   ↓
3. Component subscribes to Supabase Realtime
   ↓
4. When matches update:
   - Trigger fires in database
   - Updates team stats automatically
   - Real-time subscription pushes update
   - Component re-fetches and re-renders
   ↓
5. All viewers see updates instantly
```

### Recording Match Results

```
1. Admin clicks winning team
   ↓
2. updateMatchWinner() server action
   ↓
3. Database trigger fires:
   - Increments winner's points and wins
   - Increments loser's losses
   ↓
4. Real-time subscription notifies all clients
   ↓
5. Leaderboard updates automatically
```

## Database Schema

### tournaments
```sql
id              UUID PRIMARY KEY
venue_name      TEXT
venue_location  TEXT
tournament_date DATE
start_time      TIME
num_tables      INTEGER
num_rounds      INTEGER
status          TEXT (setup|in_progress|completed)
```

### teams
```sql
id              UUID PRIMARY KEY
tournament_id   UUID -> tournaments(id)
player1_name    TEXT
player2_name    TEXT
points          INTEGER (auto-calculated)
wins            INTEGER (auto-calculated)
losses          INTEGER (auto-calculated)
```

### matches
```sql
id              UUID PRIMARY KEY
tournament_id   UUID -> tournaments(id)
round_number    INTEGER
table_number    INTEGER
team1_id        UUID -> teams(id)
team2_id        UUID -> teams(id)
winner_id       UUID -> teams(id) (nullable)
completed_at    TIMESTAMP (nullable)
```

## Tech Stack Details

### Frontend
- **Next.js 15**: App Router with Server Components
- **React 19**: Client components with hooks
- **TypeScript**: Full type safety
- **TailwindCSS**: Utility-first styling

### Backend
- **Next.js Server Actions**: Serverless functions
- **Supabase**: PostgreSQL database + real-time

### Real-time
- **Supabase Realtime**: WebSocket subscriptions
- **PostgreSQL Triggers**: Auto-update team stats
- **Channel subscriptions**: Per-tournament channels

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=     # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Your Supabase anon/public key
```

## Commands

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
```

## Deployment

**Vercel (Recommended)**
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

**Other Platforms**
- Any platform supporting Next.js 15
- Must support Node.js 18+
- Add environment variables in platform settings
