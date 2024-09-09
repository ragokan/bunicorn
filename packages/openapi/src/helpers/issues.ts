import type { OpenAPIV3 } from "openapi-types";

// Define the FormattedIssue schema
const formattedIssueSchema: OpenAPIV3.SchemaObject = {
	type: "object",
	properties: {
		message: { type: "string" },
		validation: { type: "string" },
		path: {
			type: "array",
			items: { type: "string" },
		},
	},
	required: ["message", "validation", "path"],
};

// Define the validation error response schema
export const validationErrorSchema: OpenAPIV3.SchemaObject = {
	description:
		"Validation error response from Zod, Valibot or other validation options. It is formatted by Bunicorn to send exact response always.",
	type: "object",
	properties: {
		message: { type: "string", enum: ["Validation Error"] },
		type: { type: "string", enum: ["validation"] },
		status: { type: "number", enum: [403] },
		data: {
			type: "array",
			items: formattedIssueSchema,
		},
	},
	required: ["message", "type", "status", "data"],
};
