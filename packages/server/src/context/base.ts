import { BunicornApp } from "../app/index.ts";
import { BunicornError } from "../error/index.ts";
import type { GetDependencyFn } from "../helpers/di.ts";
import { formDataToObject } from "../helpers/formDataToObject.ts";
import { __getSearchParams } from "../helpers/pathRegexps.ts";
import { __getParams } from "../helpers/pathUtils.ts";
import type { BasePath, __BuiltRoute } from "../router/types.ts";
import type { BunicornSchema } from "../validation/types.ts";
import { __validate } from "../validation/validate.ts";
import type { BuniResponseInit, __PrivateBunicornContext } from "./types.ts";

export class BunicornContext<
	TPath extends BasePath = BasePath,
	InputSchema = never,
> {
	private __text: string | undefined;
	private __body: object | undefined;
	private __searchParams: object | undefined;
	private resultHeaders: Record<string, string> | undefined;
	private __params: Record<string, string> | undefined;

	constructor(
		public request: Request,
		public url: TPath,
		public get: GetDependencyFn,
		protected match: string[] | boolean,
		protected route: __BuiltRoute<TPath>,
	) {}

	public get params() {
		return (this.__params ??= __getParams(this.route.path, this.match));
	}

	public async getText() {
		return (this.__text ??= await this.request.text());
	}

	public async getBody(): Promise<InputSchema> {
		// Cache body
		if (this.__body !== undefined) {
			return this.__body as InputSchema;
		}

		const { route, request } = this;
		const contentType = request.headers.get("Content-Type") || "";

		let _body: any;

		if (contentType.startsWith("application/json")) {
			_body = await request.json();
		} else if (contentType.startsWith("multipart/form-data")) {
			_body = await request
				.formData()
				.then((data) => formDataToObject(data, route.input));
		} else {
			_body = await request.text();
		}

		return (this.__body = route.input ? __validate(route.input, _body) : _body);
	}

	public getSearchParams(schema?: BunicornSchema) {
		const result = (this.__searchParams ??= __getSearchParams(this.url));
		return schema ? __validate(schema, result) : result;
	}

	public getHeader(name: string) {
		return this.request.headers.get(name);
	}

	public setHeader(name: string, value: string) {
		(this.resultHeaders ??= {})[name] = value;
		return this;
	}

	public ok() {
		return new Response(undefined, {
			status: 200,
			headers: this.resultHeaders,
		}) as any;
	}

	public raw<T extends BodyInit | null>(body: T, init: BuniResponseInit = {}) {
		this.applyHeaders(init);
		return new Response(body, init) as unknown as T;
	}

	public text(body: string, init: BuniResponseInit = {}) {
		(init.headers ??= {})["Content-Type"] = "text/plain";
		this.applyHeaders(init);
		return new Response(body, init) as any;
	}

	public json<T extends Record<any, any>>(
		body: T,
		init: BuniResponseInit = {},
	) {
		const headers = (init.headers ??= {});
		Object.assign(headers, this.resultHeaders);

		const { route } = this;

		if (route.output) {
			try {
				const parseResult = __validate(
					route.output,
					body,
					route.__outputOptions,
				);
				return Response.json(parseResult, init) as any as T;
			} catch (error) {
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
		}

		return Response.json(body, init) as unknown as T;
	}

	public stream<T>(body: ReadableStream<T>, init: BuniResponseInit = {}) {
		init.headers ??= {};
		init.headers["Content-Type"] = "text/event-stream";
		this.applyHeaders(init);
		return new Response(body, init) as unknown as ReadableStream<T>;
	}

	private applyHeaders(init: BuniResponseInit) {
		const resultHeaders = this.resultHeaders;
		if (resultHeaders !== undefined) {
			Object.assign((init.headers ??= {}), resultHeaders);
		}
	}
}
