import { z } from "zod";
import { RouteBuilder } from "./router/builder.ts";

const rb = new RouteBuilder().output(z.object({ message: z.string() }));

rb.input(z.object({ message: z.string() })).post("/hey", () => {
	return { message: "" };
});

console.log(rb);
