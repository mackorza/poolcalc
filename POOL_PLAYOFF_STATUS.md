# Pool + Playoff Tournament Format - Implementation Status

## What We're Building

A rugby-style tournament format with:
1. **Pool Stage**: Teams divided into groups, play round-robin within their pool
2. **Knockout Playoffs**: Top teams advance to quarterfinals → semifinals → final

## ✅ Completed (Parts 1-2)

### Database Schema
- ✅ Added `tournament_format` column to tournaments ('round_robin' | 'pool_playoff')
- ✅ Added `stage` column to matches ('pool', 'quarterfinal', 'semifinal', 'final', 'third_place')
- ✅ Added `pool_group` column to teams (A, B, C, D)
- ✅ Added `bracket_position` for playoff ordering
- ✅ Created migration: `002_add_tournament_format.sql`

### TypeScript Types
- ✅ Updated `Database` interface with new columns
- ✅ Created playoff utility types (PoolGroup, PlayoffMatch)

### Backend Logic
- ✅ Pool creation algorithm (`createPoolGroups`)
- ✅ Playoff format determination (`determinePlayoffFormat`)
  - 8 teams → 2 pools → 4 qualify → Semis + Final
  - 12-16 teams → 4 pools → 8 qualify → Quarters + Semis + Final
- ✅ Playoff bracket generation (`generatePlayoffBracket`)
- ✅ Updated `createTournament` action to handle both formats
- ✅ Pool stage match generation (round-robin within each pool)
- ✅ Placeholder playoff matches created

## ⏳ Remaining Work (Parts 3-5)

### Part 3: Admin UI Updates
- ✅ Add format selector radio buttons to admin/page.tsx
- ✅ Show format-specific info (pools count, playoff stages)
- ✅ Update recommendation system for pool format
- ✅ Make "Number of Rounds" optional for pool_playoff (auto-calculated)

### Part 4: Tournament View Updates
- ✅ Detect tournament format in tournament/[id]/page.tsx
- ✅ Create PoolStageView component (shows groups with standings)
- ✅ Create PlayoffBracketView component (visual bracket like your image)
- ✅ Add stage tabs: "Pool Stage" | "Playoffs" | "Leaderboard"
- [ ] Update MatchSchedule to group by stage and pool (optional enhancement)

### Part 5: Playoff Advancement Logic
- [ ] Create server action `advanceToPlayoffs`
- [ ] Calculate pool standings (points, wins, head-to-head)
- [ ] Determine qualified teams
- [ ] Update playoff match placeholders with actual teams
- [ ] Trigger when admin clicks "Complete Pool Stage"

### Part 6: Bracket Visualization
- [ ] Create bracket component with visual layout
- [ ] Show QF1, QF2, QF3, QF4
- [ ] Show SF1, SF2
- [ ] Show Final and 3rd Place match
- [ ] Connect lines between stages (like your image)
- [ ] Highlight winners and progression

## File Structure

```
lib/tournament/
├── utils.ts              ✅ Round-robin logic
└── playoff-utils.ts      ✅ Pool+Playoff logic

app/actions/
└── tournament.ts         ✅ Updated with format support

app/admin/
└── page.tsx             ⏳ Needs format selector

app/tournament/[id]/
└── page.tsx             ⏳ Needs format detection

components/
├── TournamentView.tsx    ⏳ Needs format routing
├── PoolStageView.tsx     ❌ To create
├── PlayoffBracketView.tsx ❌ To create
└── MatchSchedule.tsx     ⏳ Needs stage grouping
```

## Next Steps

1. Update admin page with format selection
2. Run Supabase migration 002
3. Create pool/playoff view components
4. Build bracket visualization
5. Add playoff advancement logic

## Testing Plan

1. Create 8-player pool+playoff tournament
2. Complete pool stage matches
3. Click "Advance to Playoffs"
4. Complete knockout matches
5. Verify bracket updates and winner determination
