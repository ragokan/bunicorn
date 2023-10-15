# Usage

As you might know, Bunicorn provides typed client for server which also does error handling.

## Installation

Firstly, you have to install the _@bunicorn/client_ package.

::: code-group

```sh [bun]
$ bun add @bunicorn/client
```

```sh [npm]
$ npm install @bunicorn/client
```

```sh [pnpm]
$ pnpm install @bunicorn/client
```

```sh [yarn]
$ yarn add @bunicorn/client
```

:::

## Create a client

```ts
import bunicornClient from "@bunicorn/client";
import { type AppType } from "./server.ts"; // This is exported from server, in next section, it shows how to do it.

// Simplest client
export const client = bunicornClient<AppType>({
  basePath: "http://localhost:8000"
});

// Use it
// Url is typed
const createdTodo = await client.post("/api/todos", {
  // This is also typed.
  input: { title: "Hello world!" }
});

if (!createdTodo.success) {
  // We need to check if we have an error.
}
```

If you want to handle errors on a force way, you can import `assertResult` function from client.

```ts
assertResult(createdTodo);
const title = createdTodo.data.title; // This is typed as success result.
```

For error handling, you can check [error handling](./errors.md) section.

### Use the data

```ts
if (createdTodo.success) {
  // Here data is typed as the output of validation schema of output.
  // If no validation schema is provided, it will be typed as return type of route.
  const title = createdTodo.data.title;
}
```

## Sharing server types

```ts
// Add routes and create a new app with them.
const app = baseApp.addRoutes(todoRoutes).addRoute(helloRoute);

// Export the type of app to use on client.
export type AppType = typeof app;
```
