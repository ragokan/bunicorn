import type * as v from "valibot";
import type * as z from "zod";
import { HttpValidationError } from "../error/index.ts";
import { type FormattedIssue, __formatIssues } from "./formatIssues.ts";
import type { BunicornSchema, RawSchema } from "./types.ts";

export function __validate<T extends BunicornSchema>(
	schema: T,
	input: unknown,
	opts?: any,
) {
	// Check is Valibot
	if ("async" in schema) {
		const result = (schema as v.BaseSchema<any, any, any>)._run(
			{ typed: false, value: input },
			{ lang: "en", ...opts },
		);
		if (result.issues) {
			throw new HttpValidationError(__formatIssues(result.issues));
		}
		return result.value;
	}
	// Check is Zod
	if ("_def" in schema) {
		const result = (schema as unknown as z.ZodSchema).safeParse(input);
		if (!result.success) {
			throw new HttpValidationError(__formatIssues(result.error.issues));
		}
		return result.data;
	}
	return __rawSchemaWrapper(schema).parse(input);
}

function __rawSchemaWrapper<Output>(schema: RawSchema<Output>) {
	return {
		parse: (input: unknown) => {
			try {
				return schema(input);
			} catch (e: any) {
				throw new HttpValidationError([
					<FormattedIssue>{
						message: e.message ?? "Validation error",
						validation: e.expected ?? "custom_validation",
						path: [e.path ?? "_"],
					},
				]);
			}
		},
	};
}
