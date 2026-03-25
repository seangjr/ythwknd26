import { getClient, handleDatabaseError } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    const sql = getClient();

    // Fetch registrations — filtered by team if teamId provided, otherwise all
    const rows = teamId
      ? await sql`
          SELECT id, line_number, nickname, instagram_handle, full_name, hero_id, team_id, created_at
          FROM registrations
          WHERE team_id = ${teamId}
          ORDER BY line_number
        `
      : await sql`
          SELECT id, line_number, nickname, instagram_handle, full_name, hero_id, team_id, created_at
          FROM registrations
          ORDER BY line_number
        `;

    return NextResponse.json({ members: rows });
  } catch (error) {
    const errorResponse = handleDatabaseError(error);
    console.error("Error in team members API:", error);
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.status },
    );
  }
}
