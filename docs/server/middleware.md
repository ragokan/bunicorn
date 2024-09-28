# Middleware

Middlewares are the way to

- extend context
- re-use logic across routes without duplicating code
- handle requests before they reach the route handler
- set permissions for routes

## Create a middleware

In the previous pages, you must have seen that we use _Router_ to create routes. There, we have the `use` method that allows us to add middlewares to a route.

```ts
import { Router } from "@bunicorn/server";

const router = new Router().use(ctx => {
  // Here, we have access to the base context (untyped body, params, query, etc)

  // Get header from the context (it is probably a string, it is best to cast on a real use case)
  const count = ctx.req.headers.get("count") ?? 0;
  const newCount = count + 1;
  // When we do headers.set, we are setting the header for the response, when we send the response, it will be sent with the headers we set
  ctx.headers.set("count", newCount);

  // Return the count, so that the next middleware/route can use it
  return {
    count: newCount
  };
});

const helloRoute = router.get("/hello", ctx => {
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
const router = new Router().use(middleware);

// This route will use the middleware
const getTodosRoute = router.get("/todos", getTodosHandler);

const secondRouter = new Router();
// This route will not use the middleware
const getTodoRoute = secondRouter.get("/todos/:id", getTodoHandler);
```

To prevent this, we can use the middleware in the local scope

```ts
const router = new Router();

// Only this route will use the middlewares
const getTodosRoute = router
  .use(middleware)
  .use(anotherMiddleware)
  .get("/todos", getTodosHandler);
```

## Global Middleware

We can use global middlewares by creating a base _Router_ and using it to create all the routes.

```ts
// We can use *createMiddleware* to have a typed middleware
import { createMiddleware, Router } from "@bunicorn/server";

const countMiddleware = createMiddleware(ctx => {
  /* The same code we had above */
});

const baseRouter = new Router().use(countMiddleware);
```

On another file, we can do this:

```ts
// Now, all routes created with this builder will use the count middleware and the another middleware
const todosRouter = baseRouter.use(anotherMiddleware);

const getTodosRoute = todosRouter.get("/todos", getTodosHandler);
```

## Wrapper Middleware

You can use the second argument of middleware to call "next" function which calls all next middlewares and the route handler.

You can update the response before sending it if you need.

```ts
export const loggerMiddleware = createMiddleware(async (_, next) => {
	console.log("Request received.");
	const response = await next();
  // IMPORTANT: Always do response.clone if you want to read the body, 
  // because it is a stream and it can only be read once
	console.log("Response sent with body:", await response.clone().text());
	return response;
});

export const responseTimeMiddleware = createMiddleware(async (ctx, next) => {
	const start = Date.now();
	const response = await next();
	const time = Date.now() - start;
	console.log(`Response time for url ${ctx.req.url}: ${time}ms`);
	return response;
});
```

## Authentication

We will use the same patterns we used before but with some improvements.

```ts
// We will create middlewares depending on the role
import { createMiddleware, HttpError } from "@bunicorn/server";

function authMiddleware(role: IRole) {
  return createMiddleware(async ctx => {
    const jwtToken = ctx.req.headers.get("Authorization");
    if (!jwtToken) {
      // HttpError makes Bunicorn to send a a detailed error, instead of sending status 500.
      throw new HttpError("Unauthorized", 401);
    }
    // Your logic to verify the token
    const userId = await verifyToken(jwtToken);
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HttpError("Unauthorized", 401);
    }
    // We can check the role here
    if (user.role !== role) {
      throw new HttpError("Forbidden", 403);
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
const getPostsRoute = router
  .use(authMiddleware("user"))
  .get("/posts", getPostsHandler);

const getAllPostsRoute = router
  .use(authMiddleware("admin"))
  .get("/admin/posts", getAllPostsHandler);
```
