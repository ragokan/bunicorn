import { type Server } from "bun";
import { test, expect, beforeAll, afterAll, describe } from "bun:test";
import bunicornClient, {
  BunicornError,
  BunicornValidationError
} from "@bunicorn/client";
import { type AppType, app } from "./crud/server.ts";
import assert from "assert";

let server: Server;
// @ts-ignore
beforeAll(async () => {
  server = app.serve({ port: 8000 });
});

afterAll(() => {
  server.stop(true);
});

test("api tests", async end => {
  let giveToken = false;
  const client = bunicornClient<AppType>({
    basePath: "http://localhost:8000",
    headers: () => {
      const headers: Record<string, string> = {};
      if (giveToken) {
        headers["x-token"] = "123";
      }
      return headers;
    }
  });

  describe("header tests", async () => {
    const r1 = await client.get("/api/todos", {});
    expect(r1.success).toBe(false);
    if (r1.success) {
      return end("Should not be success");
    }
    expect(r1.error).toBeInstanceOf(BunicornError);
    expect(r1.error.message).toBe("Unique token is required");
    expect(r1.error.status).toBe(401);
    expect(r1.response.status).toBe(401);

    giveToken = true;
    const r2 = await client.get("/api/todos", {}).assert();
    expect(r2.success).toBe(true);
    expect(r2.response.status).toBe(200);
    expect(r2.data).toEqual([]);
    expect(r2.response.headers.get("content-type")).toBe("application/json");
  });

  describe("validation", async () => {
    // as any to avoid type error, because we want to get error
    const r1 = await client.post("/api/todos", { input: {} as any });
    if (r1.success) {
      return end("Should not be success");
    }
    expect(r1.error).toBeInstanceOf(BunicornValidationError);
    expect(r1.error.message).toBe("Validation Error");
    expect(r1.error.status).toBe(403);
    expect(r1.response.status).toBe(403);
    assert(r1.error instanceof BunicornValidationError);
    expect(r1.error.data).toBeArray();
    expect(r1.error.data).toHaveLength(1);
    expect(r1.error.data![0]).toEqual({
      message: "Required",
      validation: "invalid_type",
      path: ["title"]
    });
  });

  end();
});
