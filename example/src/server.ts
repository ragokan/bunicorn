import {
	BunicornApp,
	BunicornError,
	BunicornNotFoundError,
	RB,
	RouteBuilder,
	dependency,
	groupRoutes,
} from "@bunicorn/server";
import corsHandler from "@bunicorn/server/corsHandler";
import { matchAll } from "@bunicorn/server/matchers";
import { randomNumber } from "@bunicorn/utils";
import z from "zod";

// SCHEMAS
const todoSchema = z.object({
	id: z.number(),
	title: z.string(),
	completed: z.boolean(),
});
const createTodoSchema = todoSchema.pick({ title: true });
const updateTodoSchema = todoSchema
	.pick({ title: true, completed: true })
	.partial();

// DATA LAYER

const todoStore = dependency(() => {
	const todos: z.infer<typeof todoSchema>[] = [];

	function addTodo(title: string) {
		const todo = { id: randomNumber(), title, completed: false };
		todos.push(todo);
		return todo;
	}

	return { todos, addTodo };
});

// CREATE APP WITH BASE PATH
const baseApp = new BunicornApp({ basePath: "/api" });

// CREATE ROUTE BUILDER AND USE MIDDLEWARE
const routeBuilder = new RB().use((ctx) => {
	if (ctx.getHeader("x-token") !== "123") {
		throw new BunicornError("Unique token is required", 401);
	}
	// Now, we can use ctx.token and anything else we add to the context
	return { token: "123" };
});

// GET TODOS AND ENFORCE OUT TYPE TO BE AN ARRAY OF TODOS
const getTodos = routeBuilder.output(todoSchema.array()).get("/", (ctx) => {
	const todos = ctx.get(todoStore).todos;
	return ctx.json(todos);
});

// CREATE TODO AND ENFORCE OUR INPUT TO BE A TODO
const createTodoRoute = new RouteBuilder()
	.use(() => ({ a: 1 }))
	.input(createTodoSchema)
	.output(todoSchema)
	.post("/", async (ctx) => {
		// BODY IS INFERRED TO BE A CREATE TODO
		const body = await ctx.getBody();
		const todo = ctx.get(todoStore).addTodo(body.title);
		return ctx.json(todo);
	});

// UPDATE TODO AND ENFORCE OUR INPUT TO BE A TODO
const updateTodoRoute = routeBuilder
	.input(updateTodoSchema)
	.output(todoSchema)
	.patch("/:id", async (ctx) => {
		// BODY IS INFERRED TO BE AN UPDATE TODO
		const body = await ctx.getBody();
		// CTX.PARAMS.ID IS ALSO INFERRED, BUT IT IS A STRING
		const todo = ctx
			.get(todoStore)
			.todos.find((todo) => todo.id === parseInt(ctx.params.id));
		if (!todo) {
			throw new BunicornNotFoundError("Todo not found");
		}
		Object.assign(todo, body);
		return ctx.json(todo);
	});

const deleteTodoRoute = routeBuilder
	.output((v) => {
		// CUSTOM OUTPUT VALIDATION, YOU CAN USE TYPIA HERE, TOO
		if (!v || typeof v !== "object" || !("success" in v)) {
			throw new BunicornError("Invalid response for delete");
		}
		return v as { success: boolean };
	})
	.delete("/:id", (ctx) => {
		const todos = ctx.get(todoStore).todos;
		const index = todos.findIndex(
			(todo) => todo.id === parseInt(ctx.params.id),
		);
		if (index === -1) {
			throw new BunicornNotFoundError("Todo not found");
		}
		todos.splice(index, 1);
		return ctx.json({ success: true });
	});

// GROUP ROUTES BY PREFIX
const todoRoutes = groupRoutes("/todos", [
	getTodos,
	createTodoRoute,
	updateTodoRoute,
	deleteTodoRoute,
]);

// Add cors handler and routes to app to infer types
export const app = baseApp
	.addHandler(corsHandler({ origins: [matchAll] }))
	.addRoutes(todoRoutes);

export type AppType = typeof app;
