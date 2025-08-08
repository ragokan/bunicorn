# Testing

Bunicorn uses Bun's built-in test runner. You can run the tests with:

```sh
bun test
```

## Structure
- Place tests under a `tests/` workspace (already configured).
- Import your app/server types from `@bunicorn/server` and start a server in `beforeAll`, then stop in `afterAll`.

```ts
import { beforeAll, afterAll, it, expect } from "bun:test";
import { BunicornApp, Router } from "@bunicorn/server";
import type { Server } from "bun";

let server: Server;
beforeAll(() => {
  const router = new Router().get("/ping", ctx => ctx.text("pong"));
  const app = new BunicornApp().addRoutes([router.build("/")]);
  server = app.serve({ port: 8123 });
});

afterAll(() => server.stop(true));

it("pings", async () => {
  const res = await fetch("http://localhost:8123/ping");
  expect(res.status).toBe(200);
  expect(await res.text()).toBe("pong");
});
```

## Tips
- Prefer ephemeral ports per suite to avoid conflicts if running in parallel.
- Use `expect().toBeInstanceOf()` for error responses from the client SDK.
- When serving static files in tests, use a temporary directory and clean it up in `afterAll`.