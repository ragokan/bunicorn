import type { PrivateBunicornApp } from "@bunicorn/server";
import type { OpenAPIV3 } from "openapi-types";
import type { OpenApiHandlerArgs } from "../index.ts";
import { getContentType, getSchema } from "./getSchema.ts";
import { validationErrorSchema } from "./issues.ts";

export async function createDocument(
	app: PrivateBunicornApp,
	args: OpenApiHandlerArgs,
) {
	const paths: OpenAPIV3.PathsObject = {};
	const tags: Set<string> = new Set();
	const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;

	const securitySchemes: OpenAPIV3.ComponentsObject["securitySchemes"] = {
		bearerAuth: {
			type: "http",
			scheme: "bearer",
			bearerFormat: "JWT",
		},
	};

	for (const method of httpMethods) {
		const endpoints = app.routes[method];
		if (endpoints) {
			for (const endpoint of endpoints) {
				const apiPath = endpoint.path
					.replace(/:(\w+)/g, "{$1}")
					.replace(/\.\.\.(\w+)/g, "{$1}");
				if (!paths[apiPath]) {
					paths[apiPath] = {};
				}

				const meta = endpoint.meta ?? {};
				const operation: Partial<OpenAPIV3.OperationObject> = {
					summary: meta.summary ?? `${method as string} ${apiPath}`,
					description: meta.description,
					deprecated: meta.deprecated,
				};

				if (meta.auth === true) {
					operation.security = [{ bearerAuth: [] }];
				}

				const group = meta.group;
				if (group && group !== "default") {
					operation.tags = [group];
					tags.add(group);
				}

				// Handle optional input
				if (endpoint.input && method !== "GET") {
					const inputSchema = await getSchema(endpoint.input);
					const contentType = getContentType(inputSchema);
					operation.requestBody = {
						content: {
							[contentType]: {
								schema: inputSchema,
							},
						},
					};

					// Add validation error response
					operation.responses = {
						...(operation.responses || {}),
						"403": {
							description: "Validation Error",
							content: {
								"application/json": {
									schema: validationErrorSchema,
								},
							},
						},
					};
				}

				// Handle optional output
				if (endpoint.output) {
					const outputSchema = await getSchema(endpoint.output);
					const contentType = getContentType(outputSchema);
					operation.responses = {
						...(operation.responses || {}),
						"200": {
							description: "Successful response",
							content: {
								[contentType]: {
									schema: outputSchema,
								},
							},
						},
					};
				} else if (!operation.responses) {
					operation.responses = {
						"200": {
							description: "Successful response with no content",
						},
					};
				}

				operation.parameters = [];

				// Handle path parameters including ...key
				const pathParams = endpoint.path.match(/(?::|\.\.\.)(\w+)/g);
				if (pathParams) {
					for (const param of pathParams) {
						const isWildcard = param.startsWith("...");
						const paramName = param.replace(/^[:.]*/g, "");
						operation.parameters.push({
							name: paramName,
							in: "path",
							required: true,
							schema: isWildcard
								? { type: "string", pattern: ".*" }
								: { type: "string" },
							description: isWildcard
								? "Wildcard parameter that can match multiple path segments"
								: undefined,
						});
					}
				}

				(paths[apiPath] as Record<string, object>)[
					(method as string).toLowerCase()
				] = operation;
			}
		}
	}

	const openAPIDocument: OpenAPIV3.Document = {
		openapi: "3.0.0",
		info: {
			title: args.title ?? "Bunicorn - API",
			version: args.version ?? "1.0.0",
			description: args.description ?? "API generated from Bunicorn server.",
		},
		paths,
		tags: Array.from(tags).map((tag) => ({ name: tag })),
		servers: [{ url: args.apiUrl, description: "API server" }],
		components: { securitySchemes },
	};

	return openAPIDocument;
}
