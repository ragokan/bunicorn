import {
	BunicornApp,
	BunicornError,
	BunicornNotFoundError,
	RB,
	dependency,
	groupRoutes,
} from "@bunicorn/server";
import { randomNumber } from "@bunicorn/utils";
import z from "zod";

const userSchema = z.object({
	id: z.number(),
	name: z.string(),
	email: z.string().email(),
});

const createUserSchema = userSchema.omit({ id: true });
const updateUserSchema = createUserSchema.partial();

const userStore = dependency(() => {
	const users: z.infer<typeof userSchema>[] = [];

	function addUser(name: string, email: string) {
		const user = { id: randomNumber(), name, email };
		users.push(user);
		return user;
	}

	return { users, addUser };
});

const baseApp = new BunicornApp({ basePath: "/api/v1" });

const router = new RB().use((ctx) => {
	if (ctx.req.headers.get("x-api-key") !== "secret-key") {
		throw new BunicornError("Invalid API key", 401);
	}
	return { apiKey: "secret-key" };
});

const getUsers = router.output(userSchema.array()).get("/users", (ctx) => {
	const users = ctx.get(userStore).users;
	return ctx.json(users);
});

const getUser = router.output(userSchema).get("/users/:id", (ctx) => {
	const users = ctx.get(userStore).users;
	const user = users.find((user) => user.id === parseInt(ctx.params.id));
	if (!user) {
		throw new BunicornNotFoundError("User not found");
	}
	return ctx.json(user);
});

const createUserRoute = router
	.input(createUserSchema)
	.output(userSchema)
	.post("/users", async (ctx) => {
		const body = await ctx.getBody();
		const user = ctx.get(userStore).addUser(body.name, body.email);
		return ctx.json(user, { status: 201 });
	});

const updateUserRoute = router
	.input(updateUserSchema)
	.output(userSchema)
	.put("/users/:id", async (ctx) => {
		const body = await ctx.getBody();
		const user = ctx
			.get(userStore)
			.users.find((user) => user.id === parseInt(ctx.params.id));
		if (!user) {
			throw new BunicornNotFoundError("User not found");
		}
		Object.assign(user, body);
		return ctx.json(user);
	});

const deleteUserRoute = router
	.output(z.object({ success: z.boolean() }))
	.delete("/users/:id", (ctx) => {
		const users = ctx.get(userStore).users;
		const index = users.findIndex(
			(user) => user.id === parseInt(ctx.params.id),
		);
		if (index === -1) {
			throw new BunicornNotFoundError("User not found");
		}
		users.splice(index, 1);
		return ctx.json({ success: true });
	});

const optionsRoute = router.options("/users", (ctx) => {
	ctx.headers.set("Allow", "GET, POST, PUT, DELETE, OPTIONS");
	return ctx.text("OK");
});

const headRoute = router.head("/users", (ctx) => {
	ctx.headers.set("X-Total-Count", ctx.get(userStore).users.length.toString());
	return ctx.text("");
});

const allRoute = router.all("/echo", async (ctx) => {
	const body = await ctx.req.text();
	return ctx.text(`Echoed: ${body}`);
});

const patchRoute = router
	.input(
		z.object({
			name: z.string().optional(),
			email: z.string().email().optional(),
		}),
	)
	.output(userSchema)
	.patch("/users/:id", async (ctx) => {
		const body = await ctx.getBody();
		const user = ctx
			.get(userStore)
			.users.find((user) => user.id === parseInt(ctx.params.id));
		if (!user) {
			throw new BunicornNotFoundError("User not found");
		}
		Object.assign(user, body);
		return ctx.json(user);
	});

const userRoutes = groupRoutes("/", [
	getUsers,
	getUser,
	createUserRoute,
	updateUserRoute,
	deleteUserRoute,
	optionsRoute,
	headRoute,
	allRoute,
	patchRoute,
]);

export const app = baseApp.addRoutes(userRoutes);

export type AppType = typeof app;
