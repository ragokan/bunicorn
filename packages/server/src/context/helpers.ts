import { formDataToObject } from "../helpers/formDataToObject.ts";
import { __getSearchParams } from "../helpers/pathRegexps.ts";
import { type Route } from "../router/route.ts";
import {
  type BunicornSchema,
  type __InferBunicornOutput
} from "../validation/types.ts";
import { __validate } from "../validation/validate.ts";
import { type BunicornContext, type __GetContextInput } from "./base.ts";

export async function getBody<Ctx extends BunicornContext<any, any>>(ctx: Ctx) {
  const route = (ctx as unknown as { _route: Route })._route;
  const request = ctx.request;
  const contentType = request.headers.get("Content-Type") ?? "";
  let _body: any;

  if (contentType.includes("application/json")) {
    _body = await request.json();
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

  return __validate(route.input!, _body) as __GetContextInput<Ctx>;
}

export async function getText<Ctx extends BunicornContext<any, any>>(ctx: Ctx) {
  return ctx.request.text();
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
  const result = __getSearchParams(ctx.url);
  if (parser) {
    return __validate(parser, result);
  }
  return result;
}
