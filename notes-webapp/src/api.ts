import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./generated/notes-api";
import { ForbiddenError, authorizationHeader, classifyResponse } from "./authz/client";

// Same-origin: nginx strips /api and proxies through the API gateway.
export const notesApi = createClient<paths>({ baseUrl: "/api" });

// Authorization is src/authz/client.ts's alone: attach the bearer, apply the 401 rule.
const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const header = await authorizationHeader();
    if (header) request.headers.set("Authorization", header);
    return request;
  },
  async onResponse({ response }) {
    if ((await classifyResponse(response.status)) === "forbidden") {
      throw new ForbiddenError(response.status);
    }
    return response;
  },
};

notesApi.use(authMiddleware);
