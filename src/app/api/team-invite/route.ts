import { getClient, handleDatabaseError } from "@/lib/db";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

// Generate a new team invite
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { teamId } = body;

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 },
      );
    }

    const sql = getClient();

    // Generate a unique invite code
    const inviteCode = nanoid(10);
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString(); // 7 days from now

    // Insert the invite code
    await sql`
      INSERT INTO team_invites (team_id, invite_code, expires_at)
      VALUES (${teamId}, ${inviteCode}, ${expiresAt})
    `;

    return NextResponse.json({
      inviteCode,
      inviteUrl: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/invite/${inviteCode}`,
    });
  } catch (error) {
    console.error("Error in team invite API:", error);
    return NextResponse.json(
      { error: "Failed to create team invite" },
      { status: 500 },
    );
  }
}

// Validate a team invite
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const inviteCode = searchParams.get("code");

    if (!inviteCode) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 },
      );
    }

    const sql = getClient();

    // Get the invite + team details in one query via JOIN
    const rows = await sql`
      SELECT ti.team_id, ti.expires_at, t.id, t.name, t.color
      FROM team_invites ti
      JOIN teams t ON t.id = ti.team_id
      WHERE ti.invite_code = ${inviteCode}
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 },
      );
    }

    const row = rows[0];

    // Check if the invite has expired
    if (new Date(row.expires_at as string) < new Date()) {
      return NextResponse.json(
        { error: "Invite has expired" },
        { status: 410 },
      );
    }

    return NextResponse.json({
      teamId: row.team_id,
      teamName: row.name,
      teamColor: row.color,
      expiresAt: row.expires_at,
    });
  } catch (error) {
    const errorResponse = handleDatabaseError(error);
    console.error("Error in team invite API:", error);
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.status },
    );
  }
}
