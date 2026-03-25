import { getClient, handleDatabaseError } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Extract registration data
    const {
      lineNumber,
      groupNumber,
      email,
      fullName,
      age,
      gender,
      nricPassport,
      contactNumber,
      instagramHandle,
      schoolName,
      ymMember,
      cgLeader,
      heroId,
      teamId,
      inviteCode,
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactPhone,
      emergencyContactEmail,
      isChristian,
      eventSource,
      otherEventSource,
      invitedByFriend,
    } = body;

    // Validate required fields
    if (!lineNumber || !email || !fullName || !heroId || !teamId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const sql = getClient();

    // Check if line is already taken
    const lineCheck =
      await sql`SELECT id FROM registrations WHERE line_number = ${lineNumber} LIMIT 1`;

    if (lineCheck.length > 0) {
      return NextResponse.json(
        { error: "This line is already taken" },
        { status: 409 },
      );
    }

    // Check if email is unique
    const emailCheck =
      await sql`SELECT id FROM registrations WHERE email = ${email} LIMIT 1`;

    if (emailCheck.length > 0) {
      return NextResponse.json(
        {
          error:
            "This email is already registered. Please use a different email.",
        },
        { status: 409 },
      );
    }

    // Check if hero is available for this team
    const heroCheck =
      await sql`SELECT is_available FROM hero_availability WHERE team_id = ${teamId} AND hero_id = ${heroId}`;

    if (heroCheck.length === 0 || !heroCheck[0].is_available) {
      return NextResponse.json(
        { error: "This hero is no longer available" },
        { status: 409 },
      );
    }

    // Call stored procedure — atomic INSERT + hero_availability UPDATE
    const result = await sql`SELECT register_user_extended(
      ${lineNumber}::integer,
      ${groupNumber}::integer,
      ${email},
      ${fullName},
      ${fullName},
      ${Number(age)}::integer,
      ${gender},
      ${nricPassport},
      ${contactNumber},
      ${instagramHandle || null},
      ${schoolName},
      ${ymMember === true || ymMember === "Yes"},
      ${cgLeader},
      ${heroId},
      ${teamId}::integer,
      ${inviteCode || null},
      ${emergencyContactName},
      ${emergencyContactRelationship},
      ${emergencyContactPhone},
      ${emergencyContactEmail},
      ${isChristian || null},
      ${eventSource || null},
      ${otherEventSource || null},
      ${invitedByFriend || null},
      ${null},
      ${null},
      ${null}
    )`;

    const registration = result[0].register_user_extended;

    return NextResponse.json({ success: true, data: registration });
  } catch (error) {
    console.error("Registration error:", error);
    const dbError = handleDatabaseError(error);
    return NextResponse.json(
      { error: dbError.message },
      { status: dbError.status },
    );
  }
}
