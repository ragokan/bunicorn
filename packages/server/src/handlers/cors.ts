import { __BunicornContext } from "src/context/base.ts";
import type { __BuiltRoute } from "src/router/types.ts";
import { matchAll } from "../matchers/constants.ts";
import { createHandler } from "./index.ts";

export interface CorsHandlerArgs {
	origins?: string[];
	allowCredentials?: boolean;
	allowedHeaders?: string[];
}

export default function corsHandler(args: CorsHandlerArgs = {}) {
	const { origins, allowCredentials, allowedHeaders } = args;
	const originRegexes = origins?.map((origin) => new RegExp(origin));

	return createHandler((app) => {
		app.routes.OPTIONS.push({
			path: `/${matchAll}`,
			method: "OPTIONS",
			middlewares: [],
			regexp: new RegExp(`^${matchAll}`),
			async handler(ctx) {
				if (!originRegexes) {
					return getSuccessResponse({
						allowCredentials,
						allowedHeaders,
						request: ctx.request,
					});
				}
				const origin = ctx.request.headers.get("Origin");
				if (!origin) {
					return getFailureResponse();
				}
				const match = originRegexes.find((regex) => regex.test(origin));
				if (!match) {
					return getFailureResponse();
				}
				return getSuccessResponse({
					allowCredentials,
					allowedHeaders,
					request: ctx.request,
				});
			},
		} satisfies __BuiltRoute);

		app.addMiddleware((ctx) => {
			const origin = ctx.request.headers.get("Origin");
			if (origin) {
				ctx.setHeader("Access-Control-Allow-Origin", origin);
			}
			if (allowCredentials) {
				ctx.setHeader("Access-Control-Allow-Credentials", "true");
			}
		});
	});
}

function getSuccessResponse({
	allowCredentials,
	allowedHeaders,
	request,
}: {
	allowCredentials?: boolean;
	allowedHeaders?: string[];
	request: Request;
}) {
	const headers: HeadersInit = {
		"Access-Control-Allow-Origin": request.headers.get("Origin") ?? "*",
		"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
		"Access-Control-Allow-Headers":
			allowedHeaders?.join(", ") ??
			request.headers.get("Access-Control-Request-Headers") ??
			"*",
		Vary: "*",
	};
	if (allowCredentials) {
		headers["Access-Control-Allow-Credentials"] = "true";
	}

	return new Response(null, {
		status: 204,
		statusText: "No Content",
		headers: headers,
	});
}
function getFailureResponse(origins?: string[]) {
	return new Response(null, {
		status: 403,
		statusText: "Forbidden",
		headers: {
			"Access-Control-Allow-Origin": origins ? origins.join(", ") : "*",
			"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		},
	});
}
