import { createHandler } from "@bunicorn/server";
import { createDocument } from "./helpers/createDocument.ts";

export interface OpenApiHandlerArgs {
	title?: string;
	version?: string;
	description?: string;
	apiUrl: string;
}

export default function openApiHandler(args: OpenApiHandlerArgs) {
	return createHandler(async (app) => {
		const document = await createDocument(app, args);
	});
}
