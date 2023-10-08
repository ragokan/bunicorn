# Routes

## Route showcase

Create route builder. You can create as many as you want.

```ts
const rb = new RouteBuilder();
```

## GET Route

Check [Dynamic routes](#dynamic-routes) for the usage of `:id`.

```ts

// Path: prefix/
// Method: GET
const getTodosRoute = rb.get("/", ctx => ctx.json(todos));

// Path: prefix/:id, like /prefix/1
// Method: GET
const getTodoRoute = rb.get("/:id", ctx => {
  const todo = /*Code to fetch */;
  return ctx.json(todo);
});
```

## POST Route

```ts
// Path: prefix/
// Method: POST
const createTodoRoute = rb.input(createTodoSchema).post("/", async ctx => {
  const todo = /*Code to create */;
  return ctx.json(todo);
});
```

## PATCH/PUT route

Check [Dynamic routes](#dynamic-routes) for the usage of `:id`.

```ts
// Path: prefix/:id, like /prefix/1
// Method: PATCH
const updateTodoRoute = rb.input(updateTodoSchema).patch("/:id", async ctx => {
    const todo = /*Code to update */;
    return ctx.json(todo);
  });
```

## DELETE route

Check [Dynamic routes](#dynamic-routes) for the usage of `:id`.

```ts

// Path: prefix/:id, like /prefix/1
// Method: DELETE
const deleteTodoRoute = rb.delete("/:id", async ctx => {
const todo = /*Code to delete */;
return ctx.json(todo);
});
```

## Group routes

You can group routes together and add a prefix to them. If you don't want to add a prefix, you can just pass a slash or create a simple array.

```ts
// Now, set prefix to /todos and add it to the app
const todoRoutes = groupRoutes("/todos", [
  getTodosRoute,
  getTodoRoute,
  createTodoRoute,
  updateTodoRoute,
  deleteTodoRoute
]);
// All routes now start with /todos, such as ->
// GET: /todos
// GET: /todos/:id
// POST: /todos
```

::: tip Info
Grouped routes just add the prefix to the route path. It doesn't add any middleware or anything else. Everything is handled in the route builder.

For details, check [middleware page](/server/middleware).
:::

## Dynamic routes

For dynamic routes, you can simply do `/:key` and it will be available in the `ctx.params` object.

```ts
// -> It will match prefix/1, prefix/2, prefix/3, etc.
const getTodoRoute = rb.get("/:id", ctx => {
  // It is typed and validated
  const id = ctx.params.id;
  // Return data
});

// -> It will match prefix/1/John/20, prefix/2/John/20, prefix/3/John/20, etc.
const manyDynamicRoute = rb.get("/:id/:name/:age", ctx => {
  // It is typed and validated
  const { id, name, age } = ctx.params;
  // Return data
});
```

## Match All

For matching all routes, it is also very simple! Just do `/...keys` and it will be available in the `ctx.params` object.

```ts
// -> It will match /todos/a/b/c, /todos/1/2/3, /todos/1/2/3/4, etc. No limit!
const matchAllRoute = rb.get("/todos/...ids", ctx => {
  // It is typed as string[] and validated
  const keys = ctx.params.ids;
  // Return data
});
```

You can also combine dynamic routes with match all.

```ts
// For the case /todos/foo/1/2/3/bar/5
// id -> foo
// keys -> ["1", "2", "3", "bar"]
// lastId -> 5
const combinedRoute = rb.get("/todos/:id/...keys/:lastId", ctx => {
  // It is typed as string[] and validated
  const keys = ctx.params.keys;
  const { id, lastId } = ctx.params;
  // Return data
});
```

::: warning Warning
Dynamic route arguments are always _**string**_. Even if it is something like /todos/1, it will be -> "1". If it is required, you can convert it.
:::

## Edge Router

To use your routes on Edge, you don't need to do anything to the App. You can just use BunicornEdgeApp and it will work.

::: code-group

```ts [bun/node]
import { BunicornEdgeApp } from "@bunicorn/server/edgeApp";
const baseApp = new BunicornEdgeApp();
const app = baseApp.addRoutes(todoRoutes);
```

```ts [deno]
import { BunicornEdgeApp } from "https://cdn.jsdelivr.net/npm/@bunicorn/server/src/app/edgeApp.ts";
const baseApp = new BunicornEdgeApp();
const app = baseApp.addRoutes(todoRoutes);
```

EdgeApp will make routes lazy evaluated. For example, regexes of routes only will be created when they are going to be tested.

- For example, if your app got a GET route, it will compile till it finds, then it will stop. It will not compile all routes.
- It means, other METHOD's routes will not even be compiled.
