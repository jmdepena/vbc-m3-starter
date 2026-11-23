// Request storage for the portal.
//
// For now, requests live in server memory, seeded from data/seed-requests.csv
// the first time they're needed. New requests are added to that same list.
// Memory is cleared whenever the server restarts.

import { readFileSync } from "fs";
import path from "path";

// Splits CSV text into rows of fields. Handles quoted fields that contain
// commas and doubled quotes ("") inside quoted fields.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((value) => value.trim() !== ""));
}

function loadSeedRequests() {
  const csvPath = path.join(process.cwd(), "data", "seed-requests.csv");
  const [header, ...rows] = parseCsv(readFileSync(csvPath, "utf8"));

  return rows.map((values, index) => {
    const record = { id: index + 1 };
    header.forEach((column, i) => {
      record[column.trim()] = (values[i] ?? "").trim();
    });
    return record;
  });
}

// Kept on globalThis so every API route shares one list, even when the
// dev server reloads modules.
function getStore() {
  if (!globalThis.__morrowlaneStore) {
    const requests = loadSeedRequests();
    globalThis.__morrowlaneStore = {
      requests,
      nextId: requests.length + 1,
    };
  }
  return globalThis.__morrowlaneStore;
}

// All requests, newest first.
export function listRequests() {
  return [...getStore().requests].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
}

// Saves a new request with status "New" and returns it.
export function createRequest({ requester_name, location, description, priority }) {
  const store = getStore();
  const request = {
    id: store.nextId++,
    created_at: new Date().toISOString(),
    requester_name,
    location,
    description,
    priority,
    status: "New",
  };
  store.requests.push(request);
  return request;
}

// Changes one request's status. Returns the updated request,
// or null if no request has that id.
export function updateRequestStatus(id, status) {
  const request = getStore().requests.find((r) => r.id === id);
  if (!request) return null;
  request.status = status;
  return request;
}
