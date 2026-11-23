import { listRequests, createRequest } from "../../../lib/store";
import { validateNewRequest } from "../../../lib/validation";

export const dynamic = "force-dynamic";

// GET /api/requests — every request, newest first.
export async function GET() {
  try {
    return Response.json({ requests: listRequests() }, { status: 200 });
  } catch (error) {
    console.error("GET /api/requests failed:", error);
    return Response.json(
      { error: "Could not load requests. Please try again." },
      { status: 500 }
    );
  }
}

// POST /api/requests — validate and save a new request.
export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "The request body must be valid JSON." },
        { status: 400 }
      );
    }

    const { error, value } = validateNewRequest(body);
    if (error) {
      return Response.json({ error }, { status: 400 });
    }

    const saved = createRequest(value);

    return Response.json({ request: saved }, { status: 201 });
  } catch (error) {
    console.error("POST /api/requests failed:", error);
    return Response.json(
      { error: "Could not save the request. Please try again." },
      { status: 500 }
    );
  }
}
