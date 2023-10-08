# Middleware

Middlewares are the way to

- extend context
- re-use logic across routes without duplicating code
- handle requests before they reach the route handler
- set permissions for routes

## Create a middleware

In the previous pages, you must have seen that we use _RouteBuilder_ to create routes. There, we have the `use` method that allows us to add middlewares to a route.

```ts
import { RouteBuilder, getHeader } from "@bunicorn/server";

const routeBuilder = new RouteBuilder().use(ctx => {
  // Here, we have access to the base context (untyped body, params, query, etc)

  // Get header from the context (it is probably a string, it is best to cast on a real use case)
  const count = getHeader(ctx, "count") ?? 0;
  const newCount = count + 1;
  // When we do ctx.setHeader, we are setting the header for the response, when we send the response, it will be sent with the headers we set
  ctx.setHeader("count", newCount);

  // Return the count, so that the next middleware/route can use it
  return {
    count: newCount
  };
});

const helloRoute = routeBuilder.get("/hello", ctx => {
  // Here, we have access to the context with the count we set in the middleware, it is also typed
  const count = ctx.count;
  return ctx.json({
    message: `Hello, you have visited this route ${count} times`
  });
});
```

## Local Middleware

We can have local middlewares, that will only be used by the route they are attached to.

```ts
// All routes using this builder will use this middleware
const routeBuilder = new RouteBuilder().use(middleware);

// This route will use the middleware
const getTodosRoute = routeBuilder.get("/todos", getTodosHandler);

const secondRouteBuilder = new RouteBuilder();
// This route will not use the middleware
const getTodoRoute = secondRouteBuilder.get("/todos/:id", getTodoHandler);
```

To prevent this, we can use the middleware in the local scope

```ts
const routeBuilder = new RouteBuilder();

// Only this route will use the middlewares
const getTodosRoute = routeBuilder
  .use(middleware)
  .use(anotherMiddleware)
  .get("/todos", getTodosHandler);
```

## Global Middleware

We can use global middlewares by creating a base _RouteBuilder_ and using it to create all the routes.

```ts
// We can use *createMiddleware* to have a typed middleware
import { createMiddleware, RouteBuilder } from "@bunicorn/server";

const countMiddleware = createMiddleware(ctx => {
  /* The same code we had above */
});

const baseRouteBuilder = new RouteBuilder().use(countMiddleware);
```

On another file, we can do this:

```ts
// Now, all routes created with this builder will use the count middleware and the another middleware
const todosRouteBuilder = baseRouteBuilder.use(anotherMiddleware);

const getTodosRoute = todosRouteBuilder.get("/todos", getTodosHandler);
```

## Authentication

We will use the same patterns we used before but with some improvements.

```ts
// We will create middlewares depending on the role
import { createMiddleware, BunicornError } from "@bunicorn/server";

function authMiddleware(role: IRole) {
  return createMiddleware(async ctx => {
    const jwtToken = getHeader(ctx, "Authorization");
    if (!jwtToken) {
      // BunicornError makes Bunicorn to send a a detailed error, instead of sending status 500.
      throw new BunicornError("Unauthorized", 401);
    }
    // Your logic to verify the token
    const userId = await verifyToken(jwtToken);
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BunicornError("Unauthorized", 401);
    }
    // We can check the role here
    if (user.role !== role) {
      throw new BunicornError("Forbidden", 403);
    }
    // We can return the user, so that the next middleware/route can use it
    return {
      user
    };
  });
}
```

Consume the middleware now.

```ts
const getPostsRoute = routeBuilder
  .use(authMiddleware("user"))
  .get("/posts", getPostsHandler);

const getAllPostsRoute = routeBuilder
  .use(authMiddleware("admin"))
  .get("/admin/posts", getAllPostsHandler);
```
