import { app } from "./server.ts";

app.serve({ port: 8000 });

// Wait for the server to start, just in case
await Bun.sleep(10);
await import("./client.ts");
process.exit(0);
