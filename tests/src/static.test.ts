import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { BunicornApp } from "@bunicorn/server";
import staticHandler from "@bunicorn/server/staticHandler";
import type { Server } from "bun";

const TMP_DIR = join(process.cwd(), "tests", "tmp-static");

let server: Server;

beforeAll(async () => {
	await rm(TMP_DIR, { recursive: true, force: true }).catch(() => {});
	await mkdir(TMP_DIR, { recursive: true });
	await writeFile(join(TMP_DIR, "hello.txt"), "hello static");

	const app = new BunicornApp().addHandler(
		staticHandler({ path: "public", directory: TMP_DIR }),
	);
	server = app.serve({ port: 8110 });
});

afterAll(async () => {
	server.stop(true);
	await rm(TMP_DIR, { recursive: true, force: true }).catch(() => {});
});

describe("static handler", () => {
	it("serves existing file", async () => {
		// sanity check
		const filePath = join(TMP_DIR, "hello.txt");
		expect(await Bun.file(filePath).exists()).toBe(true);
		const res = await fetch("http://localhost:8110/public/hello.txt");
		expect(res.status).toBe(200);
		const body = await res.text();
		expect(body).toBe("hello static");
	});

	it("returns 404 for missing file", async () => {
		const res = await fetch("http://localhost:8110/public/missing.txt");
		expect(res.status).toBe(404);
	});
});
