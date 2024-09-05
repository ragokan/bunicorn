import { matchAll } from "../matchers/constants.ts";
import { createHandler } from "./index.ts";

export interface CorsHandlerArgs {
  origins?: string[];
  allowCredentials?: boolean;
}

export default function corsHandler(args: CorsHandlerArgs = {}) {
  const { origins, allowCredentials } = args;
  const originRegexes = origins?.map(origin => new RegExp(origin));

  return createHandler(app => {
    app.routes["OPTIONS"].push({
      path: `/${matchAll}`,
      method: "OPTIONS",
      middlewares: [],
      regexp: new RegExp(`^${matchAll}`),
      async handler(ctx) {
        if (!originRegexes) {
          return getSuccessResponse({ allowCredentials });
        }
        const origin = ctx.request.headers.get("Origin");
        if (!origin) {
          return getFailureResponse();
        }
        const match = originRegexes.find(regex => regex.test(origin));
        if (!match) {
          return getFailureResponse();
        }
        return getSuccessResponse({ origins: [origin], allowCredentials });
      }
    });
  });
}

function getSuccessResponse({
  origins,
  allowCredentials
}: {
  origins?: string[];
  allowCredentials?: boolean;
}) {
  const headers: HeadersInit = {
    "Access-Control-Allow-Origin": origins ? origins.join(", ") : "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  if (allowCredentials) {
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return new Response(null, {
    status: 204,
    statusText: "No Content",
    headers: headers
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
