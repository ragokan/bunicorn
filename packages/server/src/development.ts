/* eslint-disable no-console */
import { z } from "zod";
import { BuniApp } from "./app/index.ts";
import { getBody, getSearchParams } from "./context/helpers.ts";
import staticHandler from "./handlers/static.ts";
import { RB } from "./router/builder.ts";

const app = new BuniApp({
  basePath: "/"
});

const rb = new RB();

const R = app
  .addHandler(staticHandler({ path: "/static", directory: "./src" }))
  .addRoutes([
    rb.get("/", ctx => ctx.raw("Hello world!")),
    rb.get("/hello", ctx => {
      return ctx.raw("Hello world!");
    }),
    rb.input(z.object({ message: z.string() })).post("/hello", async ctx => {
      const { message } = await getBody(ctx);
      return ctx.json({
        message: `Hello ${message}!`
      });
    }),
    rb.get("/...rest/:args", ctx => {
      console.log("params", ctx.params);
      console.log("search params", getSearchParams(ctx));
      return ctx.raw("Hello world!" + JSON.stringify(ctx.params));
    })
  ]);

Bun.serve({
  fetch: R.handleRequest,
  port: 8000
});

// eslint-disable-next-line no-console
console.log("Bun server is running on http://localhost:8000/");
