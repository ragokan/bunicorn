import { type FormattedIssue } from "src/index.ts";

export interface BunicornErrorArgs<TData> {
  data?: TData;
  status?: number;
}

export type ErrorType = "default" | "validation" | "notFound";

export function createError<TData = any>(
  message: string,
  args: BunicornErrorArgs<TData>,
  type: ErrorType
) {
  if (type === "default") {
    return new BunicornError(message, args, type);
  }
  if (type === "validation") {
    return new BunicornValidationError(args.data as FormattedIssue[]);
  }
  if (type === "notFound") {
    return new BunicornNotFoundError(message);
  }
  return new BunicornError(message, args, type);
}

export class BunicornError<TData = any> extends Error {
  constructor(
    message: string,
    public args: BunicornErrorArgs<TData> = {},
    public type: ErrorType = "default"
  ) {
    super(message);
    this.args.status ??= 500;
  }

  public override toString() {
    const { data, status } = this.args;
    return JSON.stringify({
      message: this.message,
      data,
      status,
      type: this.type
    });
  }
}

export class BunicornValidationError extends BunicornError<FormattedIssue[]> {
  static message = "Validation error.";
  public override args: Required<BunicornErrorArgs<FormattedIssue[]>>;
  constructor(issues: FormattedIssue[]) {
    super(
      BunicornValidationError.message,
      { status: 403, data: issues },
      "validation"
    );
    this.args = super.args as Required<BunicornErrorArgs<FormattedIssue[]>>;
  }
}

export class BunicornNotFoundError extends BunicornError {
  constructor(message = "Not found.") {
    super(message, { status: 404 }, "notFound");
  }
}
