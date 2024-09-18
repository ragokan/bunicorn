# Context

Context is the way to carry information from input, output and middlewares to the request handler.

## Basic context

```ts
const router = new Router().use(ctx => {
  // this is a simple middleware
  // when we return a value, it will be added to the context
  // if we throw instead, it will be handled by the error handler
  return { count: 0 };
});
```

## Consume the context

```ts
const getCountRoute = router.get("/", ctx => {
  // ctx.count is the value returned by the middleware and it is typed
  return ctx.raw(ctx.count.toString());
});
```

## Context helpers

As you see above, we also used 'ctx.raw', and on previous pages, we also used 'ctx.json' and more. Lets explore what context has;

```ts
interface Context {
  // Getters
  // They are typed on the request.
  request: Request; // The request object
  params: { [key: string]: string };
  // Get a dependency from the container, check the #dependency-injection page
  get: (dependency: Dependency<T>) => T;
  // The url object
  url: URL;

  // Response modifiers
  // You can set headers for the response, you can also use this on middleware
  headers: Headers;

  // Response types
  // Returns a 200 response with no body and with headers set before
  ok();

  // Returns a response with the body and with headers set before merged to init
  text(body: string, init?: ResponseInit);

  // Returns a response with the body and with headers set before merged to init
  json<T>(body: T, init?: ResponseInit);

  // Returns a response with the body and with headers set before merged to init
  raw<T extends BlobPart | BlobPart[] | FormData | URLSearchParams | null>(
    body: T,
    init?: ResponseInit
  );

  // Returns a response with the body and with headers set before merged to init
  stream<T>(body: ReadableStream<T>, init?: ResponseInit);
}
```

## Follow up

Firstly, I recommend you to go to [middleware](./middleware.md) page to learn how to use middlewares.

Then, you can go to [dependency injection](./di.md) page to learn how to use dependency injection with context.
