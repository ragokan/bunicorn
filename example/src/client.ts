/* eslint-disable no-console */
import bunicornClient, { HttpValidationError } from "@bunicorn/client";
import { omit } from "@bunicorn/utils";
import type { AppType } from "./server.ts";

// WE INITIALIZE THE CLIENT WITH THE PATH THAT OUR SERVER IS GOING TO USE
// AND PROVIDE THE TYPE OF OUR APP
export const client = bunicornClient<AppType>({
	serverPath: "http://localhost:8000",
	headers: { "x-token": "123" },
});

const createdTodo = await client.post("/api/todos", {
	input: { title: "Hello world!" },
});

if (!createdTodo.success) {
	const error = createdTodo.error;
	if (error instanceof HttpValidationError) {
		console.log("We got validation error", error.data![0]!.message);
	} else {
		console.log("We got an error", error.message);
	}
	throw error;
}

// NOW, IT IS TYPED
const todos = await client.get("/api/todos", {});
// To not log all the response, we omit it
console.log(omit(todos, "response"));

const updatedTodo = await client.patch("/api/todos/:id", {
	input: { title: "Second Title!", completed: true },
	params: {
		// Args should be string but they are also typed
		id: createdTodo.data.id.toString(),
	},
});
console.log(omit(updatedTodo, "response"));

const deletedTodo = await client.delete("/api/todos/:id", {
	params: {
		id: createdTodo.data.id.toString(),
	},
});
console.log(omit(deletedTodo, "response"));
