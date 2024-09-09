import type * as v from "valibot";
import type * as z from "zod";
import { BunicornValidationError } from "../error/index.ts";
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
			input as v.Dataset<unknown, never>,
			opts,
		);
		if (result.issues) {
			throw new BunicornValidationError(__formatIssues(result.issues));
		}
		return result.value;
	}
	// Check is Zod
	if ("_def" in schema) {
		const result = (schema as unknown as z.ZodSchema).safeParse(input);
		if (!result.success) {
			throw new BunicornValidationError(__formatIssues(result.error.issues));
		}
		return result.data;
	}
	return __validate(
		__rawSchemaWrapper(schema as RawSchema) as unknown as BunicornSchema,
		input,
	);
}

function __rawSchemaWrapper<Output>(schema: RawSchema<Output>) {
	return {
		_parse: (
			input: unknown,
		): { output?: Output; issues?: FormattedIssue[] } => {
			try {
				return {
					output: schema(input),
				};
			} catch (e: any) {
				return {
					issues: [
						<FormattedIssue>{
							message: e.message ?? "Validation error",
							validation: e.expected ?? "custom_validation",
							path: [e.path ?? "_"],
						},
					],
				};
			}
		},
		schema: {},
	} as unknown as v.BaseSchema<any, any, any>;
}
