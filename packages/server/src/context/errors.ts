import { BunicornApp } from "../app/index.ts";
import { BunicornError } from "../error/index.ts";
import type { __BuiltRoute } from "../router/types.ts";

export function throwValidationError(
	route: __BuiltRoute,
	body: any,
	error: unknown,
) {
	BunicornApp.onGlobalError(
		new BunicornError(
			`Failed to parse output for the method '${route.method}' to path '${route.path}'.`,
			{
				data: {
					path: route.path,
					output: body,
					schema: route.output,
					issues: error,
				},
			},
		),
	);
	throw new BunicornError(
		"Failed to parse output. This should be handled internally.",
	);
}
