# Errors

In Bunicorn, we have two types of errors sent to client;

- BunicorError, mostly sent from validation issues, not found or by hand.
- Regular errors, which could be happened by external libraries you are using, instead, Bunicorn sends status 500 without definiton.

Declaration might help you understand the usage:

```ts
class BunicornError<TData> extends Error {
  message: string; // base of message
  data?: TData; // data to send to client, can be null
  status: number; // status code to send to client, default is 500
  type: ErrorType; // type of error, default is "default"
}

export type ErrorType = "default" | "validation" | "notFound";

// Sent when validation fails
// You can also send that when you want to send 403 for a reason.
class BunicornValidationError extends BunicornError<FormattedIssue[]> {}

// Sent when not found, such as requested path.
// You can also send that when you want to send 404 for a reason.
class BunicornNotFoundError extends BunicornError<undefined> {}
```

## Custom Errors

You can create your own errors either by extending `BunicornError` class or sending default error with function. Here is an example:

```ts
export class CustomError<TPayload> extends BunicornError<TPayload> {
  constructor(payload: TPayload) {
    super("Custom error message", payload, 400, "customErrorType");
  }
}
```

Or

```ts
export function newCustomError<TPayload>(payload: TPayload): BunicornError<TPayload> {
  return new BunicornError("Custom error message", payload, 400, "customErrorType");
}
```

For the next steps, I recommend you to check [client errors](../client/errors.md) page.
