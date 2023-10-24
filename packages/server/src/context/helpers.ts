import { formDataToObject } from "../helpers/formDataToObject.ts";
import { __getSearchParams } from "../helpers/pathRegexps.ts";
import { type Route } from "../router/route.ts";
import {
  type BunicornSchema,
  type __InferBunicornOutput
} from "../validation/types.ts";
import { __validate } from "../validation/validate.ts";
import { type BunicornContext, type __GetContextInput } from "./base.ts";

export async function getBody<Ctx extends BunicornContext<any, any>>(
  ctx: Ctx
): Promise<__GetContextInput<Ctx>> {
  const __ctx = ctx as unknown as { __body: any; _route: Route } & Ctx;
  // Cache body.
  if (__ctx.__body) {
    return __ctx.__body;
  }
  const route = __ctx._route;
  const request = ctx.request;
  const contentType = request.headers.get("Content-Type") ?? "";
  let _body: any;

  if (contentType.includes("application/json")) {
    _body = JSON.parse(await getText(ctx));
  } else if (contentType.includes("multipart/form-data")) {
    _body = await request
      .formData()
      .then(data => formDataToObject(data, route.input));
  } else {
    _body = await request.text();
  }

  if (!route.input) {
    return _body as __GetContextInput<Ctx>;
  }

  return (__ctx.__body = __validate(
    route.input!,
    _body
  ) as __GetContextInput<Ctx>);
}

export async function getText<Ctx extends BunicornContext<any, any>>(ctx: Ctx) {
  // Cache text.
  const __ctx = ctx as unknown as { __text: string } & Ctx;
  return (__ctx.__text ??= await ctx.request.text());
}

export function getHeader<Ctx extends BunicornContext<any, any>>(
  ctx: Ctx,
  name: string
) {
  return ctx.request.headers.get(name);
}

export function getSearchParams<
  Ctx extends BunicornContext<any, any>,
  Body extends Record<string, string>
>(ctx: Ctx): Body;
export function getSearchParams<
  Ctx extends BunicornContext<any, any>,
  TSchema extends BunicornSchema
>(ctx: Ctx, schema: TSchema): __InferBunicornOutput<TSchema>;

export function getSearchParams(
  ctx: BunicornContext<any, any>,
  parser?: BunicornSchema
) {
  const __ctx = ctx as unknown as { __searchParams: any } & BunicornContext;
  const result = (__ctx.__searchParams ??= __getSearchParams(ctx.url));
  if (parser) {
    return __validate(parser, result);
  }
  return result;
}
