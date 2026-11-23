// Server-side rules for new service requests.
// The browser form is a convenience; these checks are the real guarantee.

export const LOCATIONS = ["Minneapolis", "Chicago", "Denver", "Austin"];
export const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
export const MAX_DESCRIPTION_LENGTH = 500;

// Turns ["A", "B", "C"] into "A, B, or C".
function listWithOr(items) {
  return items.slice(0, -1).join(", ") + ", or " + items[items.length - 1];
}

// Checks a new-request body. Returns { error } with a plain-English message
// naming the field, or { value } with the trimmed fields ready to save.
export function validateNewRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "The request must include a name, location, description, and priority." };
  }

  const clean = (value) => (typeof value === "string" ? value.trim() : "");
  const value = {
    requester_name: clean(body.requester_name),
    location: clean(body.location),
    description: clean(body.description),
    priority: clean(body.priority),
  };

  if (!value.requester_name) {
    return { error: "Requester name is required." };
  }
  if (!value.location) {
    return { error: "Location is required." };
  }
  if (!LOCATIONS.includes(value.location)) {
    return { error: `Location must be ${listWithOr(LOCATIONS)}.` };
  }
  if (!value.description) {
    return { error: "Description is required." };
  }
  if (value.description.length > MAX_DESCRIPTION_LENGTH) {
    return {
      error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer (it is ${value.description.length}).`,
    };
  }
  if (!value.priority) {
    return { error: "Priority is required." };
  }
  if (!PRIORITIES.includes(value.priority)) {
    return { error: `Priority must be ${listWithOr(PRIORITIES)}.` };
  }

  return { value };
}
