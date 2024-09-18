---
outline: deep
---

# Quick Start

## Install

Firstly, you have to install the _@bunicorn/server_ package.

::: code-group

```sh [bun]
$ bun add @bunicorn/server
```

```sh [npm]
$ npm install @bunicorn/server
```

```sh [pnpm]
$ pnpm install @bunicorn/server
```

```sh [yarn]
$ yarn add @bunicorn/server
```

:::

## Import

For Deno, you can directly use Bunicorn from cdn of jsdelivr. Later, it will be uploaded to deno.land

::: code-group

```ts [bun/node]
import { BunicornApp, Router } from "@bunicorn/server";
```

```ts [deno]
import {
  BunicornApp,
  Router
} from "https://cdn.jsdelivr.net/npm/@bunicorn/server/src/index.ts";
```

:::

## Create base app

```ts
// For now, you can only specify *basePath*
const baseApp = new BunicornApp({ basePath: "/api" });
// Route builder does not accept any arguments.
// You can create as many Route Builder as you want.
// You can think them as *procedures* of tRPC
const router = new Router();
```

::: warning
Every path should start with a slash ('/') and should end without a slash.
:::

## Create your routes

```ts
const authenticated = router.use(context => {
  // There are many utilities that can be tree shaken.
  if (ctx.req.headers.get("x-token") !== "123") {
    throw new BunicornError("Unique token is required", { status: 401 });
  }
  // Now, we can use ctx.token and anything else we add to the context
  return { token: "123" };
});

// You can specify input and output schemas
// They can be zod, valibot, typia or a simple function schema
const getTodosRoute = authenticated
  .output(z.array(todoSchema))
  .get("/", ctx => ctx.json(todos));

const getTodoRoute = authenticated.get("/:id", ctx => {
  // ctx.params are typed and id is a string
  const todo = todos.find(todo => todo.id === ctx.params.id);
  return ctx.json(todo);
});

const createTodoRoute = authenticated
  .input(createTodoSchema)
  .post("/", async ctx => {
    // Body is inferred to be result of *createTodoSchema*
    const body = await ctx.getBody();
    const todo = createTodo(body);
    return ctx.json(todo);
  });
```

## Group routes

```ts
// You can group routes with *groupRoutes* function
const todoRoutes = groupRoutes("/todos", [
  getTodosRoute,
  getTodoRoute,
  createTodoRoute
]);
```

## Consume routes

```ts
// We are creating a new app here to have type support.
// You can also do new BunicornApp({ basePath: "/" }).addRoutes(todoRoutes)
const app = baseApp.addRoutes(todoRoutes);
```

## Start the server

::: code-group

```ts [bun]
Bun.serve({
  fetch(req) {
    // handleRequest function requires the Request object
    // and returns a Response object, that simple!
    return app.handleRequest(req);
  },
  port: 8000
});
```

```ts [deno]
Deno.serve({ port: 8000 }, req => {
  // handleRequest function requires the Request object
  // and returns a Response object, that simple!
  return app.handleRequest(req);
});
```

:::

Thats it. You can use the handleRequest with Express, Fastify, NextJS or any other server framework. You can continue the docs to see all the features of Bunicorn and how to use them.
