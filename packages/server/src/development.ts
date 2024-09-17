import { z } from "zod";
import { RouteBuilder } from "./router/builder.ts";

const rb = new RouteBuilder().output(z.object({ message: z.string() }));

rb.input(z.object({ message: z.string() })).post("/hey", (ctx) => {
	return ctx.json({ message: "" });
});

const getHelloMessage = new RouteBuilder()
	.output(z.object({ msg: z.string() }))
	.get("/:name", async (ctx) => {
		return ctx.json({
			msg: `Hello ${ctx.params.name}!`,
		});
	});

console.log(rb, getHelloMessage);
