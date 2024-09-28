import {
	BunicornApp,
	BunicornError,
	BunicornNotFoundError,
	Router,
	Router,
	dependency,
	groupRoutes,
} from "@bunicorn/server";
import corsHandler from "@bunicorn/server/corsHandler";
import { randomNumber } from "@bunicorn/utils";
import * as v from "valibot";

// SCHEMAS
const todoSchema = v.object({
	id: v.number(),
	title: v.string(),
	completed: v.boolean(),
});
const createTodoSchema = v.pick(todoSchema, ["title"]);
const updateTodoSchema = v.partial(v.pick(todoSchema, ["title", "completed"]));

// DATA LAYER

const todoStore = dependency(() => {
	const todos: v.InferOutput<typeof todoSchema>[] = [];

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
const router = new Router().use((ctx) => {
	if (ctx.req.headers.get("x-token") !== "123") {
		throw new BunicornError("Unique token is required", 401);
	}
	// Now, we can use ctx.token and anything else we add to the context
	return { token: "123" };
});

// GET TODOS AND ENFORCE OUT TYPE TO BE AN ARRAY OF TODOS
const getTodos = router.output(v.array(todoSchema)).get("/", (ctx) => {
	const todos = ctx.get(todoStore).todos;
	return ctx.json(todos);
});

// CREATE TODO AND ENFORCE OUR INPUT TO BE A TODO
const createTodoRoute = new Router()
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
const updateTodoRoute = router
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

const deleteTodoRoute = router
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
	.addHandler(corsHandler({ origins: ["*"] }))
	.addRoutes(todoRoutes);

export type AppType = typeof app;
