import { matchAll } from "../matchers/constants.js";
import { createHandler } from "./index.js";

export interface CorsHandlerArgs {
  origins?: string[];
}

export default function corsHandler(args: CorsHandlerArgs = {}) {
  const { origins } = args;
  const originRegexes = origins?.map(origin => new RegExp(origin));

  return createHandler(app => {
    app.routes.push({
      path: `/${matchAll}`,
      method: "OPTIONS",
      middlewares: [],
      regexp: new RegExp(`^${matchAll}`),
      async handler(ctx) {
        if (!originRegexes) {
          return getSuccessResponse();
        }
        const origin = ctx.request.headers.get("Origin");
        if (!origin) {
          return getFailureResponse();
        }
        const match = originRegexes.find(regex => regex.test(origin));
        if (!match) {
          return getFailureResponse();
        }
        return getSuccessResponse([origin]);
      }
    });
  });
}

function getSuccessResponse(origins?: string[]) {
  return new Response(null, {
    status: 204,
    statusText: "No Content",
    headers: {
      "Access-Control-Allow-Origin": origins ? origins.join(", ") : "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
function getFailureResponse(origins?: string[]) {
  return new Response(null, {
    status: 403,
    statusText: "Forbidden",
    headers: {
      "Access-Control-Allow-Origin": origins ? origins.join(", ") : "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
