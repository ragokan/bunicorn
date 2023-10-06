import bunicornClient from "@bunicorn/client";
import { type AppType } from "./server.js";
import { ErrorType } from "@bunicorn/server";

// WE INITIALIZE THE CLIENT WITH THE PATH THAT OUR SERVER IS GOING TO USE
// AND PROVIDE THE TYPE OF OUR APP
export const client = bunicornClient<AppType>({
  basePath: "http://localhost:8000"
});

// NOW, IT IS TYPED
const todos = await client.get("/api/todos", {});

if (todos.success) {
  const firstTodo = todos.data[0]!;
} else {
  todos.error.type = "";
}
