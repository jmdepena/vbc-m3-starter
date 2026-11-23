import { listRequests } from "../../../lib/store";

export const dynamic = "force-dynamic";

// GET /api/summary — numbers for the three tiles at the top of the page.
export async function GET() {
  try {
    const requests = listRequests(); // newest first
    const open = requests.filter((r) => r.status !== "Complete");

    // "This month" means the month of the most recent request in the data,
    // not today's month. Compared in UTC to match the stored timestamps.
    let completedThisMonth = 0;
    if (requests.length > 0) {
      const latest = new Date(requests[0].created_at);
      completedThisMonth = requests.filter((r) => {
        const d = new Date(r.created_at);
        return (
          r.status === "Complete" &&
          d.getUTCFullYear() === latest.getUTCFullYear() &&
          d.getUTCMonth() === latest.getUTCMonth()
        );
      }).length;
    }

    return Response.json(
      {
        open_requests: open.length,
        urgent_open: open.filter((r) => r.priority === "Urgent").length,
        completed_this_month: completedThisMonth,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/summary failed:", error);
    return Response.json(
      { error: "Could not load the summary. Please try again." },
      { status: 500 }
    );
  }
}
