import { getClient } from "@/lib/db";
import { createSheetsClient } from "@/lib/google-sheets";
import { NextRequest, NextResponse } from "next/server";

const HEADERS = [
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
];

/**
 * GET /api/sheets-reconcile — Vercel Cron handler
 * Runs a full reconcile on schedule. Protected by CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return reconcile("full");
}

/**
 * POST /api/sheets-reconcile
 *
 * Reads every registration from the Neon DB and reconciles with Google Sheets.
 * - Rows in DB but missing from Sheet → appended
 * - Rows in Sheet but missing from DB → flagged (not deleted, for safety)
 * - Uses line_number as the unique key for matching
 *
 * Query params:
 *   ?mode=full   — clear sheet and rewrite from DB (default)
 *   ?mode=diff   — only append missing rows, flag orphans
 */
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "full";
  return reconcile(mode);
}

async function reconcile(mode: string) {
  try {
    // Validate env
    if (
      !process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
      !process.env.GOOGLE_SHEET_ID
    ) {
      return NextResponse.json(
        { error: "Google Sheets not configured" },
        { status: 503 },
      );
    }

    const sql = getClient();
    const sheets = await createSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID!;

    // Get sheet name
    const meta = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "sheets.properties.title",
    });
    const sheetName =
      meta.data.sheets?.[0]?.properties?.title || "Sheet1";

    // Fetch all registrations from DB, ordered by line_number
    const dbRows = await sql`
      SELECT
        line_number,
        group_number,
        email,
        full_name,
        age,
        gender,
        nric_passport,
        contact_number,
        instagram_handle,
        school_name,
        ym_member,
        cg_leader,
        hero_id,
        emergency_contact_name,
        emergency_contact_relationship,
        emergency_contact_phone,
        emergency_contact_email,
        is_christian,
        event_source,
        other_event_source,
        invited_by_friend,
        created_at
      FROM registrations
      ORDER BY line_number ASC
    `;

    if (mode === "full") {
      // ── Full rewrite: clear sheet and write all DB rows ──
      // Clear existing data (keep nothing)
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `'${sheetName}'!A:V`,
      });

      // Build all rows: header + data
      const allRows = [
        HEADERS,
        ...dbRows.map((r) => [
          r.line_number,
          r.group_number,
          r.email,
          r.full_name,
          r.age,
          r.gender,
          r.nric_passport,
          r.contact_number,
          r.instagram_handle || "",
          r.school_name,
          r.ym_member ? "Yes" : "No",
          r.cg_leader,
          r.hero_id,
          r.emergency_contact_name,
          r.emergency_contact_relationship,
          r.emergency_contact_phone,
          r.emergency_contact_email,
          r.is_christian || "",
          r.event_source || "",
          r.other_event_source || "",
          r.invited_by_friend || "",
          r.created_at
            ? new Date(r.created_at).toISOString()
            : "",
        ]),
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${sheetName}'!A1`,
        valueInputOption: "RAW",
        requestBody: { values: allRows },
      });

      return NextResponse.json({
        success: true,
        mode: "full",
        dbCount: dbRows.length,
        sheetRowsWritten: allRows.length - 1, // exclude header
      });
    }

    // ── Diff mode: compare and patch ──
    // Read current sheet data
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${sheetName}'!A:V`,
    });

    const sheetRows = sheetData.data.values || [];
    // Skip header row, collect line numbers already in sheet
    const sheetLineNumbers = new Set<number>();
    for (let i = 1; i < sheetRows.length; i++) {
      const lineNum = Number(sheetRows[i][0]);
      if (!isNaN(lineNum)) sheetLineNumbers.add(lineNum);
    }

    // Find DB rows missing from sheet
    const missingRows = dbRows.filter(
      (r) => !sheetLineNumbers.has(r.line_number),
    );

    // Find sheet rows missing from DB (orphans)
    const dbLineNumbers = new Set(dbRows.map((r) => r.line_number));
    const orphanLineNumbers: number[] = [];
    for (let i = 1; i < sheetRows.length; i++) {
      const lineNum = Number(sheetRows[i][0]);
      if (!isNaN(lineNum) && !dbLineNumbers.has(lineNum)) {
        orphanLineNumbers.push(lineNum);
      }
    }

    // Append missing rows
    if (missingRows.length > 0) {
      // Ensure header exists
      if (sheetRows.length === 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `'${sheetName}'!A1:V1`,
          valueInputOption: "RAW",
          requestBody: { values: [HEADERS] },
        });
      }

      const newRows = missingRows.map((r) => [
        r.line_number,
        r.group_number,
        r.email,
        r.full_name,
        r.age,
        r.gender,
        r.nric_passport,
        r.contact_number,
        r.instagram_handle || "",
        r.school_name,
        r.ym_member ? "Yes" : "No",
        r.cg_leader,
        r.hero_id,
        r.emergency_contact_name,
        r.emergency_contact_relationship,
        r.emergency_contact_phone,
        r.emergency_contact_email,
        r.is_christian || "",
        r.event_source || "",
        r.other_event_source || "",
        r.invited_by_friend || "",
        r.created_at
          ? new Date(r.created_at).toISOString()
          : "",
      ]);

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `'${sheetName}'!A:V`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: newRows },
      });
    }

    return NextResponse.json({
      success: true,
      mode: "diff",
      dbCount: dbRows.length,
      sheetCount: sheetRows.length - 1, // exclude header
      added: missingRows.length,
      orphansInSheet: orphanLineNumbers,
    });
  } catch (error) {
    console.error("Sheets reconcile error:", error);
    return NextResponse.json(
      {
        error: "Reconciliation failed",
        details: (error as { message?: string })?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
