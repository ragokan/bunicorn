import { app } from "./server.js";

Bun.serve({
  fetch(req) {
    return app.handleRequest(req);
  },
  port: 8000
});

// Wait for the server to start, just in case
await Bun.sleep(10);
await import("./client.js");
process.exit(0);
