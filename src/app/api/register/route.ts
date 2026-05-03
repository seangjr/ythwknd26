import { getClient, handleDatabaseError } from "@/lib/db";
import { createSheetsClient } from "@/lib/google-sheets";
import { NextResponse, after } from "next/server";

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

    // Sheets sync runs after the response is sent. `after()` keeps the
    // serverless function alive until the promise resolves — a bare
    // dangling promise can be killed when the instance shuts down.
    after(
      syncToGoogleSheets({
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
        ymMember: ymMember === true || ymMember === "Yes",
        cgLeader,
        heroId,
        emergencyContactName,
        emergencyContactRelationship,
        emergencyContactPhone,
        emergencyContactEmail,
        isChristian,
        eventSource,
        otherEventSource,
        invitedByFriend,
      }).catch((err) => {
        console.error("Google Sheets sync failed (non-blocking):", err);
      }),
    );

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

/**
 * Sync registration data to Google Sheets.
 * Silently skips if Google Sheets is not configured.
 * Ensures header row exists on first sync.
 */
async function syncToGoogleSheets(data: Record<string, unknown>) {
  if (
    !process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
    !process.env.GOOGLE_SHEET_ID
  ) {
    console.log("Google Sheets not configured, skipping sync");
    return;
  }

  const sheets = await createSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  // Get the actual first sheet name (might not be "Sheet1")
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });
  const sheetName =
    meta.data.sheets?.[0]?.properties?.title || "Sheet1";

  // Check if headers exist — if row 1 is empty, write them first
  const headerCheck = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetName}'!A1:V1`,
  });

  if (!headerCheck.data.values || headerCheck.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${sheetName}'!A1:V1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            "Line Number",
            "Group Number",
            "Email",
            "Full Name",
            "Age",
            "Gender",
            "NRIC/Passport",
            "Contact Number",
            "Instagram",
            "School",
            "YM Member",
            "CG Leader",
            "Class",
            "Emergency Contact Name",
            "Emergency Contact Relationship",
            "Emergency Contact Phone",
            "Emergency Contact Email",
            "Is Christian",
            "Event Source",
            "Other Event Source",
            "Invited By Friend",
            "Registered At",
          ],
        ],
      },
    });
    console.log("Google Sheets headers written");
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${sheetName}'!A:V`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          data.lineNumber,
          data.groupNumber,
          data.email,
          data.fullName,
          data.age,
          data.gender,
          data.nricPassport,
          data.contactNumber,
          data.instagramHandle || "",
          data.schoolName,
          data.ymMember ? "Yes" : "No",
          data.cgLeader,
          data.heroId,
          data.emergencyContactName,
          data.emergencyContactRelationship,
          data.emergencyContactPhone,
          data.emergencyContactEmail,
          data.isChristian || "",
          data.eventSource || "",
          data.otherEventSource || "",
          data.invitedByFriend || "",
          new Date().toISOString(),
        ],
      ],
    },
  });

  console.log("Google Sheets sync successful");
}
