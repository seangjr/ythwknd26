import { getClient, handleDatabaseError } from "@/lib/db";
import { NextResponse } from "next/server";

// Get hero availability for a specific team
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    const sql = getClient();

    // Get hero availability — filtered by team if teamId provided, otherwise all
    const rows = teamId
      ? await sql`
          SELECT hero_id, team_id, is_available
          FROM hero_availability
          WHERE team_id = ${teamId}
        `
      : await sql`
          SELECT hero_id, team_id, is_available
          FROM hero_availability
          ORDER BY team_id
        `;

    // Format the response
    const heroAvailability = rows.map((item) => ({
      heroId: item.hero_id,
      teamId: item.team_id,
      isAvailable: item.is_available,
    }));

    return NextResponse.json(heroAvailability, {
      headers: {
        // Hero availability must be real-time — any cache window allows
        // two clients to see the same hero as available and double-book.
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    const errorResponse = handleDatabaseError(error);
    console.error("Error in hero availability API:", error);
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.status },
    );
  }
}

// Update hero availability when a hero is selected
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { teamId, heroId, isAvailable } = body;

    if (!teamId || !heroId) {
      return NextResponse.json(
        { error: "Team ID and Hero ID are required" },
        { status: 400 },
      );
    }

    const sql = getClient();

    // Update the hero availability
    const rows = await sql`
      UPDATE hero_availability
      SET is_available = ${isAvailable}
      WHERE team_id = ${teamId} AND hero_id = ${heroId}
      RETURNING *
    `;

    return NextResponse.json(rows);
  } catch (error) {
    const errorResponse = handleDatabaseError(error);
    console.error("Error in hero availability API:", error);
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.status },
    );
  }
}
