import {
  type BunicornSchema,
  type InferBunicornOutput
} from "src/validation/types.js";
import { validate } from "src/validation/validate.js";
import { BunicornError, type BunicornErrorArgs } from "../error/index.js";
import { formDataToObject } from "../helpers/formDataToObject.js";
import { type Route } from "../router/route.js";
import { type BaseContext, type GetContextInput } from "./baseContext.js";
import { __getSearchParams } from "src/helpers/pathRegexps.js";

export async function getBody<Ctx extends BaseContext<any, any>>(ctx: Ctx) {
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
    return _body as GetContextInput<Ctx>;
  }

  return validate(route.input!, _body) as GetContextInput<Ctx>;
}

export async function getText<Ctx extends BaseContext<any, any>>(ctx: Ctx) {
  return ctx.request.text();
}

export function getHeader<Ctx extends BaseContext<any, any>>(
  ctx: Ctx,
  name: string
) {
  return ctx.request.headers.get(name);
}

export function getSearchParams<
  Ctx extends BaseContext<any, any>,
  Body extends Record<string, string>
>(ctx: Ctx): Body;
export function getSearchParams<
  Ctx extends BaseContext<any, any>,
  TSchema extends BunicornSchema
>(ctx: Ctx, schema: TSchema): InferBunicornOutput<TSchema>;

export function getSearchParams(
  ctx: BaseContext<any, any>,
  parser?: BunicornSchema
) {
  const result = __getSearchParams(ctx.url);
  if (parser) {
    return validate(parser, result);
  }
  return result;
}

export function bunicornError<TData>(
  message: string,
  args?: BunicornErrorArgs<TData>
) {
  return new BunicornError(message, args);
}
