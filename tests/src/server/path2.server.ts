import {
	BunicornApp,
	HttpError,
	HttpNotFoundError,
	Router,
	dependency,
	groupRoutes,
} from "@bunicorn/server";
import { randomNumber } from "@bunicorn/utils";
import z from "zod";

const bookSchema = z.object({
	id: z.number(),
	title: z.string(),
	author: z.string(),
	year: z.number(),
});

const createBookSchema = bookSchema.omit({ id: true });
const updateBookSchema = createBookSchema.partial();

const bookStore = dependency(() => {
	const books: z.infer<typeof bookSchema>[] = [];

	function addBook(title: string, author: string, year: number) {
		const book = { id: randomNumber(), title, author, year };
		books.push(book);
		return book;
	}

	return { books, addBook };
});

const app = new BunicornApp();

const router = new Router().use((ctx) => {
	if (ctx.req.headers.get("x-api-key") !== "library-key") {
		throw new HttpError({ message: "Invalid API key", status: 401 });
	}
	return { apiKey: "library-key" };
});

const getBooks = router.output(bookSchema.array()).get("/books", (ctx) => {
	const books = ctx.get(bookStore).books;
	return ctx.json(books);
});

const getBook = router.output(bookSchema).get("/books/:id", (ctx) => {
	const books = ctx.get(bookStore).books;
	const book = books.find((book) => book.id === parseInt(ctx.params.id));
	if (!book) {
		throw new HttpNotFoundError("Book not found");
	}
	return ctx.json(book);
});

const createBookRoute = router
	.input(createBookSchema)
	.output(bookSchema)
	.post("/books", async (ctx) => {
		const body = await ctx.getBody();
		const book = ctx.get(bookStore).addBook(body.title, body.author, body.year);
		return ctx.json(book, { status: 201 });
	});

const updateBookRoute = router
	.input(updateBookSchema)
	.output(bookSchema)
	.put("/books/:id", async (ctx) => {
		const body = await ctx.getBody();
		const book = ctx
			.get(bookStore)
			.books.find((book) => book.id === parseInt(ctx.params.id));
		if (!book) {
			throw new HttpNotFoundError("Book not found");
		}
		Object.assign(book, body);
		return ctx.json(book);
	});

const deleteBookRoute = router
	.output(z.object({ success: z.boolean() }))
	.delete("/books/:id", (ctx) => {
		const books = ctx.get(bookStore).books;
		const index = books.findIndex(
			(book) => book.id === parseInt(ctx.params.id),
		);
		if (index === -1) {
			throw new HttpNotFoundError("Book not found");
		}
		books.splice(index, 1);
		return ctx.json({ success: true });
	});

const optionsRoute = router.options("/books", (ctx) => {
	ctx.headers.set("Allow", "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD");
	return ctx.text("OK");
});

const headRoute = router.head("/books", (ctx) => {
	ctx.headers.set("X-Total-Count", ctx.get(bookStore).books.length.toString());
	return ctx.text("");
});

const allRoute = router.all("/echo", async (ctx) => {
	const body = await ctx.req.text();
	return ctx.text(`Echoed: ${body}`);
});

const patchRoute = router
	.input(
		z.object({
			title: z.string().optional(),
			author: z.string().optional(),
			year: z.number().optional(),
		}),
	)
	.output(bookSchema)
	.patch("/books/:id", async (ctx) => {
		const body = await ctx.getBody();
		const book = ctx
			.get(bookStore)
			.books.find((book) => book.id === parseInt(ctx.params.id));
		if (!book) {
			throw new HttpNotFoundError("Book not found");
		}
		Object.assign(book, body);
		return ctx.json(book);
	});

const searchRoute = router
	.output(bookSchema.array())
	.get("/search", async (ctx) => {
		const { query } = ctx.getSearchParams();
		if (!query) {
			throw new HttpError({
				message: "Query parameter is required for test",
				status: 400,
			});
		}
		const books = ctx.get(bookStore).books;
		const results = books.filter(
			(book) =>
				book.title.toLowerCase().includes(query.toLowerCase()) ||
				book.author.toLowerCase().includes(query.toLowerCase()),
		);
		return ctx.json(results);
	});

const bookRoutes = groupRoutes("/", [
	getBooks,
	getBook,
	createBookRoute,
	updateBookRoute,
	deleteBookRoute,
	optionsRoute,
	headRoute,
	allRoute,
	patchRoute,
	searchRoute,
]);

export const libraryApp = app.addRoutes(bookRoutes);

export type LibraryAppType = typeof libraryApp;
