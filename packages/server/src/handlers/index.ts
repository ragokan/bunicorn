import type { PrivateBunicornApp } from "../app/index.ts";

export type Handler = (app: PrivateBunicornApp) => void;
export type AsyncHandler = (app: PrivateBunicornApp) => Promise<void>;

export function createHandler(handler: Handler): Handler {
	return handler;
}

export function createAsyncHandler(handler: AsyncHandler): AsyncHandler {
	return handler;
}
