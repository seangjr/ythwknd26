import { getClient, handleDatabaseError } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 },
      );
    }

    const sql = getClient();

    // Get the most recent invite for this team
    const rows = await sql`
      SELECT invite_code, expires_at
      FROM team_invites
      WHERE team_id = ${teamId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({});
    }

    const data = rows[0];

    // Check if the invite has expired
    if (new Date(data.expires_at as string) < new Date()) {
      return NextResponse.json({});
    }

    // Return the invite URL if it exists and is valid
    return NextResponse.json({
      inviteCode: data.invite_code,
      inviteUrl: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/invite/${data.invite_code}`,
    });
  } catch (error) {
    const errorResponse = handleDatabaseError(error);
    console.error("Error in team invite check API:", error);
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.status },
    );
  }
}
