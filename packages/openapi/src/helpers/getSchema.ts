import type { BunicornSchema } from "@bunicorn/server/internal";
import type { OpenAPIV3 } from "openapi-types";

export function getContentType(schema: OpenAPIV3.SchemaObject) {
	return schema.type === "object" ? "application/json" : "text/plain";
}

export async function getSchema(schema: BunicornSchema) {
	if (typeof schema !== "object") {
		return {};
	}
	if ("async" in schema) {
		const valibotToJsonSchema = await import(
			"@gcornut/valibot-json-schema"
		).then((v) => v.toJSONSchema);
		const result = valibotToJsonSchema({ schema });
		if (result.$schema) {
			// biome-ignore lint/performance/noDelete: We don't mind performance here
			delete result.$schema;
		}
		return result as unknown as OpenAPIV3.SchemaObject;
	}
	if ("_def" in schema) {
		const zodToJsonSchema = await import("zod-to-json-schema").then(
			(v) => v.zodToJsonSchema,
		);
		return zodToJsonSchema(schema, {
			$refStrategy: "none",
			target: "openApi3",
			errorMessages: true,
			markdownDescription: true,
		}) as OpenAPIV3.SchemaObject;
	}
	return {};
}
