import { getClient, handleDatabaseError } from "@/lib/db";
import { NextResponse } from "next/server";

// Get hero availability for a specific team
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

    // Get all hero availability for this team
    const rows = await sql`
      SELECT hero_id, is_available
      FROM hero_availability
      WHERE team_id = ${teamId}
    `;

    // Format the response
    const heroAvailability = rows.map((item) => ({
      heroId: item.hero_id,
      isAvailable: item.is_available,
    }));

    return NextResponse.json(heroAvailability);
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
