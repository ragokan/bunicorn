import type { GetDependencyFn } from "../helpers/di.ts";
import type {
	BasePath,
	__BuiltRoute,
	__ExtractParams,
} from "../router/types.ts";

import type { __InferBunicornOutput } from "../validation/types.ts";
import type { BunicornContext } from "./base.ts";

export interface __CreateContextArgs<TPath extends BasePath> {
	route: __BuiltRoute<TPath>;
	request: Request;
	get: GetDependencyFn;
	match: string[] | boolean;
	url: string;
}

export interface BuniResponseInit {
	/** @default 200 */
	status?: number;

	/** @default "OK" */
	statusText?: string;
}

export type __PrivateBunicornContext<
	TPath extends BasePath = BasePath,
	InputSchema = never,
> = BunicornContext<TPath, InputSchema> & {
	headers?: Headers;
	applyHeaders(init: any): void;
};
