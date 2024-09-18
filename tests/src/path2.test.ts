import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import bunicornClient, {
	BunicornError,
	BunicornNotFoundError,
	BunicornValidationError,
} from "@bunicorn/client";
import type { Server } from "bun";
import { type LibraryAppType, libraryApp } from "./server/path2.server.ts";

function assert(value: unknown, message?: string): asserts value;
function assert(value: unknown, message?: string) {
	if (!value) {
		throw new Error(message ?? "Assertion failed");
	}
}

let server: Server;
beforeAll(async () => {
	server = libraryApp.serve({ port: 8102 });
});

afterAll(() => {
	server.stop(true);
});

describe("Library API tests", () => {
	let apiKey = "";
	const client = bunicornClient<LibraryAppType>({
		serverPath: "http://localhost:8102",
		headers: () => ({
			"x-api-key": apiKey,
		}),
	});

	it("1. should require API key", async () => {
		const r = await client.get("/books", {});
		expect(r.success).toBe(false);
		assert(r.success === false);
		expect(r.error).toBeInstanceOf(BunicornError);
		expect(r.error.message).toBe("Invalid API key");
		expect(r.error.status).toBe(401);
	});

	it("2. should get empty books list", async () => {
		apiKey = "library-key";
		const r = await client.get("/books", {}).assert();
		expect(r.success).toBe(true);
		expect(r.data).toEqual([]);
	});

	it("3. should create a book", async () => {
		const r = await client
			.post("/books", {
				input: { title: "1984", author: "George Orwell", year: 1949 },
			})
			.assert();
		expect(r.success).toBe(true);
		expect(r.data.title).toBe("1984");
		expect(r.data.author).toBe("George Orwell");
		expect(r.data.year).toBe(1949);
		expect(r.data.id).toBeNumber();
	});

	it("4. should get books list with one book", async () => {
		const r = await client.get("/books", {}).assert();
		expect(r.success).toBe(true);
		expect(r.data).toHaveLength(1);
		expect(r.data[0]!.title).toBe("1984");
	});

	it("5. should get a single book", async () => {
		const books = await client.get("/books", {}).assert();
		const bookId = books.data[0]!.id;
		const r = await client
			.get("/books/:id", { params: { id: bookId.toString() } })
			.assert();
		expect(r.success).toBe(true);
		expect(r.data.title).toBe("1984");
	});

	it("6. should update a book", async () => {
		const books = await client.get("/books", {}).assert();
		const bookId = books.data[0]!.id;
		const r = await client
			.put("/books/:id", {
				params: { id: bookId.toString() },
				input: { title: "Animal Farm" },
			})
			.assert();
		expect(r.success).toBe(true);
		expect(r.data.title).toBe("Animal Farm");
		expect(r.data.author).toBe("George Orwell");
	});

	it("7. should partially update a book", async () => {
		const books = await client.get("/books", {}).assert();
		const bookId = books.data[0]!.id;
		const r = await client
			.patch("/books/:id", {
				params: { id: bookId.toString() },
				input: { year: 1945 },
			})
			.assert();
		expect(r.success).toBe(true);
		expect(r.data.title).toBe("Animal Farm");
		expect(r.data.year).toBe(1945);
	});

	it("8. should delete a book", async () => {
		const books = await client.get("/books", {}).assert();
		const bookId = books.data[0]!.id;
		const r = await client
			.delete("/books/:id", { params: { id: bookId.toString() } })
			.assert();
		expect(r.success).toBe(true);
		expect(r.data.success).toBe(true);
	});

	it("9. should return 404 for non-existent book", async () => {
		const r = await client.get("/books/:id", { params: { id: "999" } });
		expect(r.success).toBe(false);
		assert(r.success === false);
		expect(r.error).toBeInstanceOf(BunicornNotFoundError);
		expect(r.error.message).toBe("Book not found");
	});

	it("10. should handle OPTIONS request", async () => {
		const r = await client.options("/books", {}).assert();
		expect(r.success).toBe(true);
		expect(r.response.headers.get("Allow")).toBe(
			"GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD",
		);
	});

	it("11. should handle HEAD request", async () => {
		await client
			.post("/books", {
				input: { title: "The Hobbit", author: "J.R.R. Tolkien", year: 1937 },
			})
			.assert();
		const r = await client.head("/books", {}).assert();
		expect(r.success).toBe(true);
		expect(r.response.headers.get("X-Total-Count")).toBe("1");
	});

	it("12. should echo request body for ALL method", async () => {
		const r = await client
			// @ts-expect-error - ALL method is not defined in the type
			.post("/echo", { input: "Hello, Library!" })
			.assert();
		expect(r.success).toBe(true);
		// @ts-expect-error - data is not defined in the type
		expect(r.data).toBe("Echoed: Hello, Library!");
	});

	it("13. should validate book input", async () => {
		const r = await client.post("/books", {
			// @ts-expect-error - author/year is required
			input: { title: "Invalid Book" },
		});
		expect(r.success).toBe(false);
		assert(r.success === false);
		expect(r.error).toBeInstanceOf(BunicornValidationError);
		expect(r.error.message).toBe("Validation Error");
	});

	it("14. should handle concurrent requests", async () => {
		const promises = Array.from({ length: 5 }, (_, i) =>
			client.post("/books", {
				input: { title: `Book ${i}`, author: "Author", year: 2000 + i },
			}),
		);
		const results = await Promise.all(promises);
		expect(results).toHaveLength(5);
		results.forEach((r, i) => {
			expect(r.success).toBe(true);
			assert(r.success === true);
			expect(r.data.title).toBe(`Book ${i}`);
		});
	});

	it("15. should handle large payload", async () => {
		const largeTitle = "a".repeat(1000);
		const r = await client
			.post("/books", {
				input: { title: largeTitle, author: "Large Author", year: 2023 },
			})
			.assert();
		expect(r.success).toBe(true);
		expect(r.data.title).toBe(largeTitle);
	});

	it("16. should handle special characters in book title", async () => {
		const specialTitle = "Book @#$%^&*() Title";
		const r = await client
			.post("/books", {
				input: { title: specialTitle, author: "Special Author", year: 2023 },
			})
			.assert();
		expect(r.success).toBe(true);
		expect(r.data.title).toBe(specialTitle);
	});

	it("17. should return correct content type", async () => {
		const r = await client.get("/books", {}).assert();
		expect(r.success).toBe(true);
		expect(r.response.headers.get("content-type")).toContain(
			"application/json",
		);
	});

	it("18. should handle multiple updates to the same book", async () => {
		const createResp = await client
			.post("/books", {
				input: { title: "Multi Update", author: "Author", year: 2000 },
			})
			.assert();
		const bookId = createResp.data.id;

		for (let i = 0; i < 5; i++) {
			const r = await client
				.put("/books/:id", {
					params: { id: bookId.toString() },
					input: { title: `Multi Update ${i}` },
				})
				.assert();
			expect(r.success).toBe(true);
			expect(r.data.title).toBe(`Multi Update ${i}`);
		}

		const finalGet = await client
			.get("/books/:id", { params: { id: bookId.toString() } })
			.assert();
		expect(finalGet.data.title).toBe("Multi Update 4");
	});
});
