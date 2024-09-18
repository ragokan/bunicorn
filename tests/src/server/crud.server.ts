import {
	BunicornApp,
	BunicornError,
	BunicornNotFoundError,
	RB,
	Router,
	dependency,
	groupRoutes,
} from "@bunicorn/server";
import { randomNumber } from "@bunicorn/utils";
import z from "zod";

const todoSchema = z.object({
	id: z.number(),
	title: z.string(),
	completed: z.boolean(),
});
const createTodoSchema = todoSchema.pick({ title: true });
const updateTodoSchema = todoSchema
	.pick({ title: true, completed: true })
	.partial();

const todoStore = dependency(() => {
	const todos: z.infer<typeof todoSchema>[] = [];

	function addTodo(title: string) {
		const todo = { id: randomNumber(), title, completed: false };
		todos.push(todo);
		return todo;
	}

	return { todos, addTodo };
});

const baseApp = new BunicornApp({ basePath: "/api" });

const router = new RB().use((ctx) => {
	if (ctx.req.headers.get("x-token") !== "123") {
		throw new BunicornError("Unique token is required", 401);
	}
	return { token: "123" };
});

const getTodos = router.output(todoSchema.array()).get("/", (ctx) => {
	const todos = ctx.get(todoStore).todos;
	return ctx.json(todos);
});

const getTodo = router.output(todoSchema).get("/:id", (ctx) => {
	const todos = ctx.get(todoStore).todos;
	const todo = todos.find((todo) => todo.id === parseInt(ctx.params.id));
	if (!todo) {
		throw new BunicornNotFoundError("Todo not found");
	}
	return ctx.json(todo);
});

const createTodoRoute = new Router()
	.use(() => ({ a: 1 }))
	.input(createTodoSchema)
	.output(todoSchema)
	.post("/", async (ctx) => {
		const body = await ctx.getBody();
		const todo = ctx.get(todoStore).addTodo(body.title);
		return ctx.json(todo, { status: 201 });
	});

const updateTodoRoute = router
	.input(updateTodoSchema)
	.output(todoSchema)
	.patch("/:id", async (ctx) => {
		const body = await ctx.getBody();
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

const todoRoutes = groupRoutes("/todos", [
	getTodos,
	getTodo,
	createTodoRoute,
	updateTodoRoute,
	deleteTodoRoute,
]);

export const app = baseApp.addRoutes(todoRoutes);

export type AppType = typeof app;
