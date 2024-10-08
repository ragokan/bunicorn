import type { GetDependencyFn } from "../helpers/di.ts";
import { formDataToObject } from "../helpers/formDataToObject.ts";
import { __getSearchParams } from "../helpers/pathRegexps.ts";
import { __getParams } from "../helpers/pathUtils.ts";
import type {
	BasePath,
	BunicornResponse,
	__BuiltRoute,
	__ExtractParams,
} from "../router/types.ts";
import type {
	BunicornSchema,
	__InferBunicornOutput,
} from "../validation/types.ts";
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
	public headers: Headers;

	constructor(
		public req: Request,
		public url: TPath,
		public get: GetDependencyFn,
		public params: __ExtractParams<TPath>,
		protected route: __BuiltRoute<TPath>,
	) {
		this.headers = new Headers();
	}

	public async getText(): Promise<string> {
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

	public getSearchParams<
		TSchema extends BunicornSchema | undefined = undefined,
	>(
		schema?: TSchema,
	): TSchema extends BunicornSchema
		? __InferBunicornOutput<TSchema>
		: Record<string, string> {
		const result = (this.__searchParams ??= __getSearchParams(this.req.url));
		return schema ? __validate(schema, result) : result;
	}

	public ok(): BunicornResponse<never> {
		return new Response(undefined, {
			status: 200,
			headers: this.headers,
		}) as BunicornResponse<never>;
	}

	public raw<T extends BodyInit | null>(
		body: T,
		init: BuniResponseInit = {},
	): BunicornResponse<T> {
		this.applyHeaders(init);
		return new Response(body, init) as BunicornResponse<T>;
	}

	public text(
		body: string,
		init: BuniResponseInit = {},
	): BunicornResponse<string> {
		this.headers.set("Content-Type", "text/plain");
		this.applyHeaders(init);
		return new Response(body, init) as BunicornResponse<string>;
	}

	public json<T extends Record<any, any>>(
		body: T,
		init: BuniResponseInit = {},
	): BunicornResponse<T> {
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
				return Response.json(parseResult, init) as BunicornResponse<T>;
			} catch (error) {
				throwValidationError(route, body, error);
			}
		}

		return Response.json(body, init) as BunicornResponse<T>;
	}

	public redirect(url: string, status = 302): BunicornResponse<never> {
		this.headers.set("Location", url);
		return new Response(undefined, {
			status,
			headers: this.headers,
		}) as BunicornResponse<never>;
	}

	// TODO: Move this to a separate handler
	public stream<T>(
		body: ReadableStream<T>,
		init: BuniResponseInit = {},
	): BunicornResponse<ReadableStream<T>> {
		this.headers.set("Content-Type", "text/event-stream");
		this.applyHeaders(init);
		return new Response(body, init) as BunicornResponse<ReadableStream<T>>;
	}

	private applyHeaders(init: BuniResponseInit) {
		(init as ResponseInit).headers = this.headers;
	}
}
