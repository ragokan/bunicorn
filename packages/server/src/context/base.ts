import type { GetDependencyFn } from "../helpers/di.ts";
import { formDataToObject } from "../helpers/formDataToObject.ts";
import { __getSearchParams } from "../helpers/pathRegexps.ts";
import { __getParams } from "../helpers/pathUtils.ts";
import type {
	BasePath,
	__BuiltRoute,
	__ExtractParams,
} from "../router/types.ts";
import type { BunicornSchema } from "../validation/types.ts";
import { __validate } from "../validation/validate.ts";
import { throwValidationError } from "./errors.ts";
import type { BuniResponseInit, __PrivateBunicornContext } from "./types.ts";

export class BunicornContext<
	TPath extends BasePath = BasePath,
	InputSchema = never,
> {
	private __text: string | undefined;
	private __body: object | undefined;
	private __searchParams: object | undefined;
	private __params: Record<string, string> | undefined;
	public headers: Headers;

	constructor(
		public req: Request,
		public url: TPath,
		public get: GetDependencyFn,
		protected match: string[] | boolean,
		protected route: __BuiltRoute<TPath>,
		// TODO: Add global headers
	) {
		this.headers = new Headers();
	}

	public get params() {
		return (this.__params ??= __getParams(
			this.route.path,
			this.match,
		)) as __ExtractParams<TPath>;
	}

	public async getText() {
		return (this.__text ??= await this.req.text());
	}

	public async getBody(): Promise<InputSchema> {
		// Cache body
		if (this.__body !== undefined) {
			return this.__body as InputSchema;
		}

		const { route, req: request } = this;
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

	public ok() {
		return new Response(undefined, {
			status: 200,
			headers: this.headers,
		}) as any;
	}

	public raw<T extends BodyInit | null>(body: T, init: BuniResponseInit = {}) {
		this.applyHeaders(init);
		return new Response(body, init) as unknown as T;
	}

	public text(body: string, init: BuniResponseInit = {}) {
		this.headers.set("Content-Type", "text/plain");
		this.applyHeaders(init);
		return new Response(body, init) as any;
	}

	public json<T extends Record<any, any>>(
		body: T,
		init: BuniResponseInit = {},
	) {
		const route = this.route;
		this.headers.set("Content-Type", "application/json");
		this.applyHeaders(init);

		if (route.output) {
			try {
				const parseResult = __validate(
					route.output,
					body,
					route.__outputOptions,
				);
				return Response.json(parseResult, init) as any as T;
			} catch (error) {
				throwValidationError(route, body, error);
			}
		}

		return Response.json(body, init) as unknown as T;
	}

	// TODO: Move this to a separate handler
	public stream<T>(body: ReadableStream<T>, init: BuniResponseInit = {}) {
		this.headers.set("Content-Type", "text/event-stream");
		this.applyHeaders(init);
		return new Response(body, init) as unknown as ReadableStream<T>;
	}

	private applyHeaders(init: BuniResponseInit) {
		(init as ResponseInit).headers = this.headers;
	}
}
