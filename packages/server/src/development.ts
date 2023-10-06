/* eslint-disable no-console */
import { BunicornApp } from "./app/index.js";
import { getBody, getSearchParams } from "./context/helpers.js";
import staticHandler from "./handlers/static.js";
import { RouteBuilder } from "./router/builder.js";
import { z } from "zod";

const app = new BunicornApp({
  basePath: "/bunicorn"
});

const rb = new RouteBuilder();

const R = app
  .with(staticHandler({ path: "/static", directory: "./src" }))
  .addRoutes([
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
      return ctx.raw("Hello world!");
    })
  ]);

export default R;

Bun.serve({
  async fetch(request) {
    return R.handleRequest(request);
  },
  port: 8000
});

// eslint-disable-next-line no-console
console.log("Bun server is running on http://localhost:8000/");
