/**
 * Reset DB + Google Sheet for a fresh registration cycle.
 *
 * Usage: node scripts/reset.mjs
 *
 * Requires .env.local with:
 *   DATABASE_URL, GOOGLE_SERVICE_ACCOUNT_KEY, GOOGLE_SHEET_ID
 */
import { neon } from "@neondatabase/serverless";
import { sheets_v4 } from "@googleapis/sheets";
import { GoogleAuth } from "google-auth-library";
import { readFileSync } from "fs";
import { resolve } from "path";

// ── Load env from .env.local ──
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const val = match[2].trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

// ── 1. Reset Database ──
async function resetDB() {
  const sql = neon(process.env.DATABASE_URL);

  console.log("Clearing registrations...");
  await sql`DELETE FROM registrations`;

  console.log("Clearing team_invites...");
  await sql`DELETE FROM team_invites`;

  console.log("Resetting hero_availability to all available...");
  await sql`UPDATE hero_availability SET is_available = TRUE`;

  // Verify
  const regCount = await sql`SELECT COUNT(*) as c FROM registrations`;
  const inviteCount = await sql`SELECT COUNT(*) as c FROM team_invites`;
  const heroCount = await sql`SELECT COUNT(*) as c FROM hero_availability WHERE is_available = FALSE`;

  console.log(`  registrations: ${regCount[0].c} (should be 0)`);
  console.log(`  team_invites: ${inviteCount[0].c} (should be 0)`);
  console.log(`  unavailable heroes: ${heroCount[0].c} (should be 0)`);
  console.log("✓ Database reset complete\n");
}

// ── 2. Reset Google Sheet ──
async function resetSheet() {
  const keyStr = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!keyStr || !spreadsheetId) {
    console.log("⚠ Google Sheets not configured, skipping sheet reset");
    return;
  }

  // Parse service account key (handles base64 or raw JSON)
  let credentials;
  const isBase64 = keyStr.length > 100 && /^[A-Za-z0-9+/=]+$/.test(keyStr);
  if (isBase64) {
    credentials = JSON.parse(Buffer.from(keyStr, "base64").toString());
  } else {
    credentials = JSON.parse(keyStr);
  }

  const auth = new GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = new sheets_v4.Sheets({ auth });

  // Get sheet name
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });
  const sheetName = meta.data.sheets?.[0]?.properties?.title || "Sheet1";

  console.log(`Clearing Google Sheet "${sheetName}"...`);
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `'${sheetName}'!A:Z`,
  });

  console.log("✓ Google Sheet cleared\n");
}

// ── Run ──
try {
  await resetDB();
  await resetSheet();
  console.log("🎉 Full reset complete — DB and Sheet are clean.");
} catch (err) {
  console.error("Reset failed:", err);
  process.exit(1);
}
