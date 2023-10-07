# Group Routes

You can group routes with a prefix.

```ts
import { groupRoutes } from "@bunicorn/server";

const createTodoRoute = routeBuilder.post("/", ctx => handleCreateTodo);
const getTodoRoute = routeBuilder.get("/:id", ctx => handleGetTodo);
const getTodosRoute = routeBuilder.get("/", ctx => handleGetTodos);

// All of them will be prefixed with /todo
const todoRoutes = groupRoutes("/todo", [
  createTodoRoute, // -> POST /todo
  getTodoRoute, // -> GET /todo/:id
  getTodosRoute // -> GET /todo
]);
```

You can also group routes in multiple levels:

```ts
const contentRoutes = groupRoutes("/content", [
  ...todoRoutes, // -> POST /content/todo, GET /content/todo/:id, GET /content/todo
  ...messageRoutes // -> POST /content/message, GET /content/message/:id, GET /content/message
]);
```

## Add to App

```ts
import { BunicornApp } from "@bunicorn/server";
import { helloRoute } from "./hello-route";
import { todoRoutes } from "./todo-routes";
import { messageRoutes } from "./message-routes";

const baseApp = new BunicornApp({ basePath: "/api" });

const app = baseApp
  // Add single route
  .addRoute(helloRoute)
  // Add multiple routes
  .addRoutes(todoRoutes)
  .addRoutes(messageRoutes);
```
