import type { FormattedIssue } from "../validation/formatIssues.ts";

export type ErrorType = "default" | "validation" | "notFound" | (string & {});

export function createError<TData = any>(
	message: string,
	data?: TData,
	status?: number,
	type: ErrorType = "default",
) {
	switch (type) {
		case "validation":
			return new BunicornValidationError(data as FormattedIssue[]);
		case "notFound":
			return new BunicornNotFoundError(message);
		default:
			return new BunicornError(message, data, status, type);
	}
}

export class BunicornError<TData = any> extends Error {
	constructor(
		message: string,
		public data?: TData,
		public status = 500,
		public type: ErrorType = "default",
	) {
		super(message);
		if (typeof data === "number") {
			this.status = data;
		}
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

export class BunicornValidationError extends BunicornError<FormattedIssue[]> {
	constructor(issues: FormattedIssue[]) {
		super("Validation Error", issues, 403, "validation");
	}
}

export class BunicornNotFoundError extends BunicornError {
	constructor(message = "Not found.") {
		super(message, undefined, 404, "notFound");
	}
}
