import { z } from "zod";
import { BunicornApp } from "./index.ts";
import { Router } from "./router/base.ts";

const rb = new Router().output(z.object({ message: z.string() }));

rb.input(z.object({ message: z.string() })).post("/hey", (ctx) => {
	return ctx.json({ message: "" });
});

const getHelloMessage = new Router()
	.output(z.object({ msg: z.string() }))
	.get("/:id", async (ctx) => {
		return ctx.json({
			msg: `Hello ${ctx.params.id}!`,
		});
	});

const app = new BunicornApp({ basePath: "/api" }).addRoute(getHelloMessage);

app.serve({
	port: 8080,
});
console.log("Server started on port 8080");
