import type { PrivateBunicornApp } from "../app/index.ts";

export type Handler = (app: PrivateBunicornApp) => any;

export function createHandler(handler: Handler) {
	return handler;
}
