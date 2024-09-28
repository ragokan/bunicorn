import type { FormattedIssue } from "../validation/formatIssues.ts";

export type ErrorType = "default" | "validation" | "notFound" | (string & {});

export function createError<TData = never>(
	message: string,
	data?: TData,
	status?: number,
	type: ErrorType = "default",
) {
	switch (type) {
		case "validation":
			return new HttpValidationError(data as FormattedIssue[]);
		case "notFound":
			return new HttpNotFoundError(message);
		default:
			return new HttpError({ message, data, status, type });
	}
}

interface ErrorArgs<TData = never> {
	message: string;
	data?: TData;
	status?: number;
	type?: ErrorType;
}

export class HttpError<TData = never> extends Error {
	public data?: TData;
	public status: number;
	public type: ErrorType;

	constructor({
		message,
		data,
		status = 500,
		type = "default",
	}: ErrorArgs<TData>) {
		super(message);
		this.message = message;
		this.data = data;
		this.status = status;
		this.type = type;
	}

	public override toString() {
		return JSON.stringify({
			message: this.message,
			data: this.data,
			status: this.status,
			type: this.type,
		});
	}
}

export class HttpValidationError extends HttpError<FormattedIssue[]> {
	constructor(issues: FormattedIssue[]) {
		super({
			message: "Validation Error",
			data: issues,
			status: 403,
			type: "validation",
		});
	}
}

export class HttpNotFoundError extends HttpError {
	constructor(message = "Not found.") {
		super({ message, status: 404, type: "notFound" });
	}
}
