declare global {
  // Which is true for the current build
  export const IS_BUN: boolean;
}

export * from "./app/index.ts";
export * from "./error/index.ts";
export * from "./handlers/index.ts";
export * from "./context/helpers.ts";
export * from "./middleware.ts";
export * from "./router/builder.ts";
export * from "./router/group.ts";
export * from "./router/types.ts";
export * from "./router/route.ts";
export type * from "./validation/formatIssues.ts";
export type * from "./validation/types.ts";
export type { BaseMethod, BasePath, ExtractParams } from "./router/types.ts";
