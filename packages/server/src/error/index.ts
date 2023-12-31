import { type FormattedIssue } from "../validation/formatIssues.ts";

export type ErrorType = "default" | "validation" | "notFound";

export function createError<TData = any>(
  message: string,
  data?: TData,
  status?: number,
  type: ErrorType = "default"
) {
  if (type == "default") {
    return new BunicornError(message, data, status, type);
  }
  if (type == "validation") {
    return new BunicornValidationError(data as FormattedIssue[]);
  }
  if (type == "notFound") {
    return new BunicornNotFoundError(message);
  }
  return new BunicornError(message, data, status, type);
}

export class BunicornError<TData = any> extends Error {
  constructor(
    message: string,
    public data?: TData,
    public status: number = 500,
    public type: ErrorType = "default"
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
      type: this.type
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
