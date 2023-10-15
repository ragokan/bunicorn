# Errors

For the base errors, I would suggest you to read [server errors](../server/errors.md) first.

As you might see on previous parts, when we do a request using the client, we get a response with a `success` property. This property is a boolean which indicates the result type:

```ts
type Success<T> = {
  success: true;
  data: T;
};

type Error<E extends BunicornError | Error> = {
  success: false;
  error: E;
};

// Basically, this is the response type.
type Response = Success<any> | Error<any>;
```

On a request like this:

```ts
const createdTodo = await client.post("/api/todos", {
  input: { title: "Hello world!" }
});
```

We can handle the errors like this:

```ts
if (createdTodo.success) {
  // Todo created successfully.
  createdTodo.data.title; // and we can use it
}
```

But this is for the success case, if we want to think error cases, we have two ways

1: Asserting

```ts
import { assertResult } from "@bunicorn/client";

const createdTodo = await client
  .post("/api/todos", {
    input: { title: "Hello world!" }
  })
  .assert(); // now, it will throw error on failure

createdTodo.data.title; // we can use it as Success Result
```

2: Manual check

```ts
import { BunicornValidationError } from "@bunicorn/server";

const createdTodo = await client.post("/api/todos", {
  input: { title: "Hello world!" }
});

if (!createdTodo.success) {
  const error = createdTodo.error;
  if (error instanceof BunicornValidationError) {
    console.log("We got validation error", error.data![0]!.message);
  } else {
    // This can be either not found error or default BunicornError.
    console.log("We got an error", error.message);
  }
}
```
