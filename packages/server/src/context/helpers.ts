import {
  BunicornError,
  BunicornValidationError,
  type BunicornErrorArgs
} from "../error/index.js";
import { formDataToObject } from "../helpers/formDataToObject.js";
import { formatIssues } from "../helpers/formatIssues.js";
import { type Route } from "../router/route.js";
import {
  safeParse,
  type BaseSchema,
  type ObjectSchema,
  type OptionalSchema,
  type Output,
  type SafeParseResult
} from "valibot";
import { type BaseContext, type GetContextInput } from "./baseContext.js";

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

  const parseResult = route.input
    ? safeParse(route.input, _body, route.__inputOptions)
    : ({ success: true, output: _body } as SafeParseResult<any>);
  if (!parseResult.success) {
    throw new BunicornValidationError(formatIssues(parseResult.issues));
  }
  return parseResult.output as GetContextInput<Ctx>;
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
  Body extends Record<string, OptionalSchema<BaseSchema<any>, any>>,
  TSchema extends ObjectSchema<Body>
>(ctx: Ctx, schema: TSchema): Output<TSchema>;

export function getSearchParams(
  ctx: BaseContext<any, any>,
  parser?: ObjectSchema<any>
) {
  const result = Object.fromEntries(ctx.url.searchParams);
  if (parser) {
    const parseResult = safeParse(parser, result);
    if (!parseResult.success) {
      throw new BunicornValidationError(formatIssues(parseResult.issues));
    }
    return parseResult.output;
  }
  return result;
}

export function bunicornError<TData>(
  message: string,
  args?: BunicornErrorArgs<TData>
) {
  return new BunicornError(message, args);
}
