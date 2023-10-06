import { type FormattedIssue } from "src/index.js";

export interface BunicornErrorArgs<TData> {
  data?: TData;
  status?: number;
}

export enum ErrorType {
  Default = "default",
  Validation = "validation",
  NotFound = "notfound"
}

export class BunicornError<TData = any> extends Error {
  constructor(
    message: string,
    public args: BunicornErrorArgs<TData> = {},
    public type: ErrorType = ErrorType.Default
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

export class BunicornValidationError extends BunicornError {
  static message = "Validation error.";
  constructor(issues: FormattedIssue[]) {
    super(
      BunicornValidationError.message,
      { status: 403, data: issues },
      ErrorType.Validation
    );
  }
}

export class BunicornNotFoundError extends BunicornError {
  constructor(message = "Not found.") {
    super(message, { status: 404 }, ErrorType.NotFound);
  }
}
