# Handlers

Handlers are a more internal way to handle requests. They are used by app directly and they can have any logic you want.

## Cors Handler

Cors handler is a handler that allows you to set cors headers to your responses. It is a simple handler that handles preflight requests and sets cors headers to your responses.

::: code-group

```ts [bun/node]
import { BunicornApp, RouteBuilder } from "@bunicorn/server";
import corsHandler from "@bunicorn/server/corsHandler";
// We can use matchAll to allow all origins, because we use raw regex, we can't just use "*", instead we use ".*"
import { matchAll } from "@bunicorn/server/matchers";

const baseApp = new BunicornApp().with(corsHandler({ origins: [matchAll] }));

// OR
const baseApp = new BunicornApp().with(
  corsHandler({ origins: ["example.com", `dev.${matchAll}.com`] }) // -> Accepts example.com and all dev.*.com
);
```

```ts [deno]
import { BunicornEdgeApp } from "https://cdn.jsdelivr.net/npm/@bunicorn/server/src/app/edgeApp.ts";
import {  RouteBuilder } from "https://cdn.jsdelivr.net/npm/@bunicorn/server/src/index.ts";
import corsHandler from "https://cdn.jsdelivr.net/npm/@bunicorn/server/src/handlers/cors.ts";
// We can use matchAll to allow all origins, because we use raw regex, we can't just use "*", instead we use ".*"
import { matchAll } from "https://cdn.jsdelivr.net/npm/@bunicorn/server/src/matchers/constants.ts";

const baseApp = new BunicornEdgeApp().with(corsHandler({ origins: [matchAll] }));

// OR
const baseApp = new BunicornApp().with(
  corsHandler({ origins: ["example.com", `dev.${matchAll}.com`] }) // -> Accepts example.com and all dev.*.com
);
```

:::

::: tip Tip
You can combine handlers with `with` method.
So, you can do something like this:

```ts
baseApp
  .with(corsHandler(/* options */))
  .with(staticHandler(/* options */))
  .with(/* other handler */)
  .addRoutes(/* routes */);
```

:::

## Static Handler

Static handler is a handler that allows you to serve static files. It accepts a path

::: code-group

```ts [bun/node]
import { BunicornApp, RouteBuilder } from "@bunicorn/server";
import staticHandler from "@bunicorn/server/staticHandler";

const baseApp = new BunicornApp().with(staticHandler({
    path: "public", // -> This will serve files from public route, such as example.com/public/a.png
    directory: "./static" // -> This will serve files from static directory, so, a request to example.com/a.png will be served from ./static/a.png
 }));
```

```ts [deno]
import { BunicornEdgeApp } from "https://cdn.jsdelivr.net/npm/@bunicorn/server/src/app/edgeApp.ts";
import {  RouteBuilder } from "https://cdn.jsdelivr.net/npm/@bunicorn/server/src/index.ts";
import staticHandler from "https://cdn.jsdelivr.net/npm/@bunicorn/server/src/handlers/static.ts";

const baseApp = new BunicornEdgeApp().with(staticHandler({
    path: "public", // -> This will serve files from public route, such as example.com/public/a.png
    directory: "./static" // -> This will serve files from static directory, so, a request to example.com/a.png will be served from ./static/a.png
 }));
```

:::

## Create a handler

Currently, we don't have a way to create handler in a meaningful way. But still, you can use it like how we use it internally.

```ts
import { createHandler } from "@bunicorn/server";

function exampleHandler(args) {
  return createHandler(app => {
    // App is not just the global app, it also includes private methods and properties.

    const appRoutes = app.routes; // Get all routes of the app and maybe update them
    // We can use app.addRoute, app.addRoutes etc. just like how we use it in the app.
    // But we can also directly push to app.routes.

    app.routes.push({
      path: "/example",
      method: "GET",
      middlewares: [], // you can add middlewares here
      regexp: /^\/example$/i, // you can have custom regexps to match the route,
      async handler(ctx) {
        // we have base ctx here, so you can use it to get request and response
      }
    });
  });
}
```
