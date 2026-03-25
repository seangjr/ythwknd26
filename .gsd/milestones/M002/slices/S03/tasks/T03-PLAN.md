---
estimated_steps: 26
estimated_files: 4
skills_used: []
---

# T03: Create SSE endpoint, rewrite subscription component, and remove all Supabase remnants

Three things in this task:

**1. Create SSE endpoint (src/app/api/team-updates/route.ts)**
GET handler that accepts `teamId` query param and returns a `text/event-stream` response. Implementation:
- Use a ReadableStream that polls the registrations table every 3 seconds via `getClient()` from `@/lib/db`
- Query: `SELECT COUNT(*) FROM registrations WHERE team_id = ${teamId}`
- Track last-known count; when count changes, write `data: {"type":"new_member"}\n\n`
- Send keepalive comment `:\n\n` every 15 seconds
- Set headers: Content-Type: text/event-stream, Cache-Control: no-cache, Connection: keep-alive
- Clean up interval on stream cancel/close
- Handle missing teamId with 400 response

**2. Rewrite team-members-subscription.tsx**
Replace the Supabase channel subscription with EventSource:
- Remove `import { createClient } from "@/lib/supabase"`
- Create `new EventSource("/api/team-updates?teamId=${teamId}")`
- On `message` event, call `onNewMember()` (same callback as before)
- On `error`, log and let EventSource auto-reconnect
- Clean up by calling `eventSource.close()` in useEffect cleanup
- Component still renders null

**3. Remove Supabase completely**
- Delete `src/lib/supabase.ts`
- Remove `@supabase/supabase-js` from dependencies in `package.json` (use jq or manual edit)
- Run `bun install` to update lockfile
- Verify: `rg 'supabase' src/ -g '*.ts' -g '*.tsx'` returns zero matches
- Verify: `rg '@supabase/supabase-js' package.json` returns zero matches
- Verify: `test ! -f src/lib/supabase.ts`
- Full build: `bun run build` exits 0

## Inputs

- `src/components/team-members-subscription.tsx`
- `src/lib/supabase.ts`
- `src/lib/db.ts`
- `package.json`

## Expected Output

- `src/app/api/team-updates/route.ts`
- `src/components/team-members-subscription.tsx`
- `package.json`

## Verification

rg 'supabase' src/ -g '*.ts' -g '*.tsx' returns zero matches && rg '@supabase/supabase-js' package.json returns zero matches && test ! -f src/lib/supabase.ts && npx tsc --noEmit exits 0 && bun run build exits 0

## Observability Impact

SSE endpoint logs connection lifecycle and polling errors to console.error. EventSource client auto-reconnects on network errors (browser-native behavior).
