import { updateRequestStatus } from "../../../../lib/store";
import { validateStatusUpdate } from "../../../../lib/validation";

export const dynamic = "force-dynamic";

// PATCH /api/requests/[id] — change one request's status.
export async function PATCH(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = /^\d+$/.test(rawId) ? Number(rawId) : null;

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "The request body must be valid JSON." },
        { status: 400 }
      );
    }

    const { error, value: status } = validateStatusUpdate(body);
    if (error) {
      return Response.json({ error }, { status: 400 });
    }

    const updated = id === null ? null : updateRequestStatus(id, status);
    if (!updated) {
      return Response.json(
        { error: `No request found with id ${rawId}.` },
        { status: 404 }
      );
    }

    return Response.json({ request: updated }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/requests/[id] failed:", error);
    return Response.json(
      { error: "Could not update the status. Please try again." },
      { status: 500 }
    );
  }
}
