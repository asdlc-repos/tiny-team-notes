import { http, HttpResponse } from "msw";
import type { components } from "../src/generated/notes-api";
import { mockCaller } from "./caller";

type Note = components["schemas"]["Note"];

// State lives in the page: any full page load re-runs this module and restores
// the seed rows. Only in-app navigation carries a change forward. Seed rows are
// the records in prototype.tsx mapped onto the Note schema.
let notes: Note[] = [
  { id: "00000000-0000-4000-8000-000000000001", body: "Retro moves to Thursday 3pm, same room.", authorId: "u-ana", authorName: "Ana Silva", createdAt: "2026-01-15T09:12:00Z" },
  { id: "00000000-0000-4000-8000-000000000002", body: "Staging is back up after the morning restart.", authorId: "u-ravi", authorName: "Ravi Perera", createdAt: "2026-01-14T16:40:00Z" },
  { id: "00000000-0000-4000-8000-000000000003", body: "Bringing cake on Friday for Maya's last day!", authorId: "u-dan", authorName: "Dan Okafor", createdAt: "2026-01-14T11:05:00Z" },
  { id: "00000000-0000-4000-8000-000000000004", body: "Reminder: release notes are due before standup.", authorId: mockCaller.userId, authorName: mockCaller.name, createdAt: "2026-01-13T14:20:00Z" },
];

const newestFirst = () => [...notes].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

export const handlers = [
  http.get("/api/notes", ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? 20);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    const all = newestFirst();
    return HttpResponse.json({
      count: all.length,
      next: offset + limit < all.length ? `/notes?limit=${limit}&offset=${offset + limit}` : null,
      previous: offset > 0 ? `/notes?limit=${limit}&offset=${Math.max(0, offset - limit)}` : null,
      data: all.slice(offset, offset + limit),
    });
  }),

  http.post("/api/notes", async ({ request }) => {
    const input = (await request.json()) as { body?: string };
    const body = input?.body?.trim() ?? "";
    if (body.length < 1 || body.length > 280) {
      return HttpResponse.json(
        { code: 400, message: "Invalid note", description: "A note must be 1 to 280 characters." },
        { status: 400 },
      );
    }
    const created: Note = {
      id: crypto.randomUUID(),
      body,
      authorId: mockCaller.userId,
      authorName: mockCaller.name,
      createdAt: new Date().toISOString(),
    };
    notes = [...notes, created];
    return HttpResponse.json(created, { status: 201 });
  }),
];
