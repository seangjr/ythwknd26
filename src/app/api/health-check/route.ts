import { getClient, handleDatabaseError, DatabaseConnectionError } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sql = getClient();

    // Test the connection with a simple query
    const rows = await sql`SELECT 1 AS ok`;

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "Unexpected empty result from database" },
        { status: 500 },
      );
    }

    return NextResponse.json({ status: "healthy" });
  } catch (error) {
    const errorResponse = handleDatabaseError(error);
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.status },
    );
  }
}
