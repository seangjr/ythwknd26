import { NextRequest } from "next/server";
import { getClient } from "@/lib/db";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const teamId = request.nextUrl.searchParams.get("teamId");

  if (!teamId) {
    return new Response(JSON.stringify({ error: "teamId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const teamIdNum = Number(teamId);
  if (Number.isNaN(teamIdNum)) {
    return new Response(JSON.stringify({ error: "teamId must be a number" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let cancelled = false;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const sql = getClient();

      // Get initial count
      let lastCount = -1;
      try {
        const rows = await sql`SELECT COUNT(*)::int AS count FROM registrations WHERE team_id = ${teamIdNum}`;
        lastCount = rows[0]?.count ?? 0;
      } catch (err) {
        console.error("[SSE /api/team-updates] initial count query failed:", err);
        lastCount = 0;
      }

      console.log(`[SSE /api/team-updates] connection opened for teamId=${teamIdNum}, initial count=${lastCount}`);

      let ticksSinceKeepalive = 0;
      const POLL_MS = 3000;
      const KEEPALIVE_TICKS = 5; // 5 × 3s = 15s

      const poll = async () => {
        if (cancelled) return;

        try {
          const rows = await sql`SELECT COUNT(*)::int AS count FROM registrations WHERE team_id = ${teamIdNum}`;
          const currentCount = rows[0]?.count ?? 0;

          if (currentCount !== lastCount) {
            lastCount = currentCount;
            controller.enqueue(encoder.encode(`data: {"type":"new_member"}\n\n`));
            ticksSinceKeepalive = 0;
          }
        } catch (err) {
          console.error("[SSE /api/team-updates] polling error:", err);
        }

        ticksSinceKeepalive++;
        if (ticksSinceKeepalive >= KEEPALIVE_TICKS) {
          try {
            controller.enqueue(encoder.encode(`:\n\n`));
          } catch {
            // stream closed
          }
          ticksSinceKeepalive = 0;
        }
      };

      const intervalId = setInterval(poll, POLL_MS);

      // Wait for cancellation signal
      request.signal.addEventListener("abort", () => {
        cancelled = true;
        clearInterval(intervalId);
        console.log(`[SSE /api/team-updates] connection closed for teamId=${teamIdNum}`);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
