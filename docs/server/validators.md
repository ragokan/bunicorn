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
    // getBody is exported from @bunicorn/server
    // Validation is only executed when you call getBody
    // todo is typed as returned type of createTodoSchema
    const todo = await getBody(ctx);
    // Handle and return
  });
```

### Returned Error

```ts
interface Response {
  status: 403;
  message: "Validation error."; // This is default error.
  data: FormattedIssue[]; // Don't worry, it is all typed on client
}

interface FormattedIssue {
  message: string; // Such as expected string, got number
  validation: string; // Such as required, optional
  path: string[]; // Such as ['title']
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
  const message = await getBody(ctx);
  // Handle and return
});

const updateMessageRoute = chatRouteBuilder.patch("/chat/:id", async ctx => {
  // message is typed as returned type of messageSchema
  const message = await getBody(ctx);
  // Handle and return
});
```

## Output

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
