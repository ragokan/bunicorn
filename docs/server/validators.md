# Validators

Bunicorn, out of the box, supports zod, valibot, typia and function validators. You can also add other validators by using that function validator.

In future, there will be more validators supported.

## Input

```ts
// First create your route builder
const routeBuilder = new RouteBuilder();

// Create a schema with zod
const createTodoSchema = z.object({ title: z.string() });

// Use it
const createTodoRoute = routeBuilder
  // Use the validator
  .input(createTodoSchema)
  .post("/todo", async ctx => {
    // Validation is only executed when you call getBody
    // todo is typed as returned type of createTodoSchema
    const todo = await ctx.getBody();
    // Handle and return
  });
```

### Returned Error

```ts
interface Response {
  status: 403;
  message: "Validation error."; // This is default error.
  args: {
    data: FormattedIssue[]; // Don't worry, it is all typed on client
  };
}

interface FormattedIssue {
  message: string; // Such as expected string, got number
  validation: string; // Such as required, optional
  path: string[]; // Such as ['title']
}

// In client, you can do this:
if (error instanceof BunicornValidationError) {
  console.log("Validation error:", error.args.data[0]!.message);
}
```

### Global Validators

You can use route builders to have global input validators.

```ts
// All the routes created with this route builder will have this validator
// When you specify input, you can't use 'GET' method
const chatRouteBuilder = routeBuilder.input(messageSchema);

const sendMessageRoute = chatRouteBuilder.post("/chat", async ctx => {
  // message is typed as returned type of messageSchema
  const message = await ctx.getBody();
  // Handle and return
});

const updateMessageRoute = chatRouteBuilder.patch("/chat/:id", async ctx => {
  // message is typed as returned type of messageSchema
  const message = await ctx.getBody();
  // Handle and return
});
```

## Output

Output validators are executed when `ctx.json` is called.

```ts
const todoSchema = z.object({
  id: z.number(),
  title: z.string(),
  completed: z.boolean()
});

const getTodos = routeBuilder.output(todoSchema.array()).get("/", ctx => {
  // todos is typed as input type of todoSchema.array()
  // in client, it is typed as output type of todoSchema.array()
  // if todos does not match the schema, it will throw an internal error and log issues.
  return ctx.json(todos);
});
```

## Use both

```ts
const createTodoRoute = routeBuilder
  .input(createTodoSchema)
  .output(todoSchema)
  .post("/todo", async ctx => {
    // todo is typed as returned type of createTodoSchema
    const todo = await ctx.getBody();
    // Handle and return
  });
```

You can also merge multiple schemas.

```ts
import z from "zod";
import { object, string } from "valibot";

const zodTodoCreateSchema = z.object({ title: z.string() });
const valibotTodoSchema = object({ id: string(), title: string() });

const createTodoRoute = routeBuilder
  .input(zodTodoCreateSchema)
  .output(valibotTodoSchema)
  .post("/todo", async ctx => {
    // todo is typed as returned type of zodTodoCreateSchema
    const todo = await ctx.getBody();
    // Handle and return
    const createdTodo = await createTodo(todo);
    // createdTodo is typed as returned type of valibotTodoSchema
    return ctx.json(createdTodo);
  });
```
