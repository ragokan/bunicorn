import { type BasePath, createAsyncHandler } from "@bunicorn/server";
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
	return createAsyncHandler(async (app) => {
		const document = await createDocument(app, args);
		args.onDocument?.(document);

		app.staticRoutes[args.swaggerUiPath ?? "/docs/swaggerui"] = new Response(
			getSwaggerUI(document),
			{ status: 200, headers: { "Content-Type": "text/html" } },
		);

		app.staticRoutes[args.openApiJsonPath ?? "/docs/openapi"] = Response.json(
			document,
			{ status: 200 },
		);
	});
}
