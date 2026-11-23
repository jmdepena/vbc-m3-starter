import { listRequests } from "../../../lib/store";

export const dynamic = "force-dynamic";

const COLUMNS = [
  "id",
  "created_at",
  "requester_name",
  "location",
  "description",
  "priority",
  "status",
];

// Formats one value for CSV. Values with commas, quotes, or line breaks are
// wrapped in quotes. Values starting with = + - @ get a leading apostrophe so
// spreadsheet apps show them as text instead of running them as formulas.
function csvField(value) {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) {
    text = "'" + text;
  }
  if (/[",\r\n]/.test(text)) {
    text = '"' + text.replace(/"/g, '""') + '"';
  }
  return text;
}

// GET /api/export — every request, newest first, as a CSV download.
export async function GET() {
  try {
    const lines = [
      COLUMNS.join(","),
      ...listRequests().map((r) => COLUMNS.map((c) => csvField(r[c])).join(",")),
    ];

    return new Response(lines.join("\r\n") + "\r\n", {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="morrowlane-requests.csv"',
      },
    });
  } catch (error) {
    console.error("GET /api/export failed:", error);
    return Response.json(
      { error: "Could not export requests. Please try again." },
      { status: 500 }
    );
  }
}
