import {
  BunicornApp,
  BunicornError,
  BunicornNotFoundError,
  RouteBuilder,
  getBody,
  getHeader,
  groupRoutes
} from "@bunicorn/server";
import corsHandler from "@bunicorn/server/corsHandler";
import { randomNumber } from "@bunicorn/utils";
import { dependency } from "@bunicorn/server/di";
import z from "zod";
import { matchAll } from "@bunicorn/server/matchers";

// SCHEMAS
const todoSchema = z.object({
  id: z.number(),
  title: z.string(),
  completed: z.boolean()
});
const createTodoSchema = todoSchema.pick({ title: true });
const updateTodoSchema = todoSchema
  .pick({ title: true, completed: true })
  .optional();

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
const routeBuilder = new RouteBuilder().use(ctx => {
  if (getHeader(ctx, "x-token") !== "123") {
    throw new BunicornError("Unique token is required", { status: 401 });
  }
  // Now, we can use ctx.token and anything else we add to the context
  return { token: "123" };
});

// GET TODOS AND ENFORCE OUT TYPE TO BE AN ARRAY OF TODOS
const getTodos = routeBuilder.output(todoSchema.array()).get("/", ctx => {
  const todos = ctx.get(todoStore).todos;
  return ctx.json(todos);
});

// CREATE TODO AND ENFORCE OUR INPUT TO BE A TODO
const createTodoRoute = routeBuilder
  .input(createTodoSchema)
  .output(todoSchema)
  .post("/", async ctx => {
    // BODY IS INFERRED TO BE A CREATE TODO
    const body = await getBody(ctx);
    const todo = ctx.get(todoStore).addTodo(body.title);
    return ctx.json(todo);
  });

// UPDATE TODO AND ENFORCE OUR INPUT TO BE A TODO
const updateTodoRoute = routeBuilder
  .input(updateTodoSchema)
  .output(todoSchema)
  .patch("/:id", async ctx => {
    // BODY IS INFERRED TO BE AN UPDATE TODO
    const body = await getBody(ctx);
    // CTX.PARAMS.ID IS ALSO INFERRED, BUT IT IS A STRING
    const todo = ctx
      .get(todoStore)
      .todos.find(todo => todo.id === parseInt(ctx.params.id));
    if (!todo) {
      throw new BunicornNotFoundError("Todo not found");
    }
    Object.assign(todo, body);
    return ctx.json(todo);
  });

const deleteTodoRoute = routeBuilder
  // .output(v => {
  //   // CUSTOM OUTPUT VALIDATION, YOU CAN USE TYPIA HERE, TOO
  //   if (!v || typeof v !== "object" || !("success" in v)) {
  //     throw new BunicornError("Invalid response for delete");
  //   }
  //   return v as { success: boolean };
  // })
  .delete("/:id", ctx => {
    const todos = ctx.get(todoStore).todos;
    const index = todos.findIndex(todo => todo.id === parseInt(ctx.params.id));
    if (index === -1) {
      throw new BunicornNotFoundError("Todo not found");
    }
    todos.splice(index, 1);
    return ctx.ok();
  });

// GROUP ROUTES BY PREFIX
const todoRoutes = groupRoutes("/todos", [
  getTodos,
  createTodoRoute,
  updateTodoRoute,
  deleteTodoRoute
]);

// Add cors handler and routes to app to infer types
export const app = baseApp
  .with(corsHandler({ origins: [matchAll] }))
  .addRoutes(todoRoutes);
export type AppType = typeof app;
