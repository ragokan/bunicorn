import { type BasePath, createHandler } from "@bunicorn/server";
import type { OpenAPIV3 } from "openapi-types";
import { createDocument } from "./helpers/createDocument.ts";
import { getSwaggerUI } from "./helpers/getSwaggerUi.ts";

export interface OpenApiHandlerArgs {
	title?: string;
	version?: string;
	description?: string;
	apiUrl: string;

	swaggerUiPath?: BasePath;
	openApiJsonPath?: BasePath;

	onDocument?: (document: OpenAPIV3.Document) => void;
}

export default function openApiHandler(args: OpenApiHandlerArgs) {
	return createHandler(async (app) => {
		const document = await createDocument(app, args);
		args.onDocument?.(document);

		app.routes.GET.push({
			method: "GET",
			middlewares: [],
			path: args.swaggerUiPath ?? "/docs/swaggerui",
			meta: { hidden: true },
			handler() {
				return new Response(getSwaggerUI(document), {
					status: 200,
					headers: { "Content-Type": "text/html" },
				});
			},
		});

		app.routes.GET.push({
			method: "GET",
			middlewares: [],
			path: args.openApiJsonPath ?? "/docs/openapi",
			meta: { hidden: true },
			handler() {
				return new Response(JSON.stringify(document), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			},
		});
	});
}
