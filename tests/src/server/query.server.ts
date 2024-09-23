import { BunicornApp, RB, groupRoutes } from "@bunicorn/server";
import z from "zod";

const baseApp = new BunicornApp({ basePath: "/api/v1" });

const router = new RB();

// Without Zod
const getSingleParam = router.get("/single-param", async (ctx) => {
	const { key } = await ctx.getSearchParams();
	return ctx.json({ key });
});

const getMultipleParams = router.get("/multiple-params", async (ctx) => {
	const { x, y } = await ctx.getSearchParams();
	return ctx.json({ x, y });
});

const getArrayParam = router.get("/array-param", async (ctx) => {
	const params = await ctx.getSearchParams();
	// TODO: Fix this
	const values = decodeURIComponent(params.values).split(",");
	return ctx.json({ values });
});

const getBooleanParam = router.get("/boolean-param", async (ctx) => {
	const { flag } = await ctx.getSearchParams();
	return ctx.json({ flag: flag === "true" });
});

const getDefaultParam = router.get("/default-param", async (ctx) => {
	const params: Record<string, string> = await ctx.getSearchParams();
	const value = params.value || "default";
	return ctx.json({ value });
});

// With Zod
const stringSchema = z.object({ x: z.string() });
const getStringParam = router.get("/zod-string", async (ctx) => {
	const { x } = await ctx.getSearchParams(stringSchema);
	return ctx.json({ x });
});

const numberSchema = z.object({ num: z.coerce.number() });
const getNumberParam = router.get("/zod-number", async (ctx) => {
	const { num } = await ctx.getSearchParams(numberSchema);
	return ctx.json({ num });
});

const optionalSchema = z.object({ opt: z.string().optional() });
const getOptionalParam = router.get("/zod-optional", async (ctx) => {
	const { opt } = await ctx.getSearchParams(optionalSchema);
	return ctx.json({ opt });
});

const arraySchema = z.object({
	items: z.string().transform((str) => {
		return decodeURIComponent(str).split(",");
	}),
});
const getZodArrayParam = router.get("/zod-array", async (ctx) => {
	const { items } = await ctx.getSearchParams(arraySchema);
	return ctx.json({ items });
});

const enumSchema = z.object({ color: z.enum(["red", "green", "blue"]) });
const getEnumParam = router.get("/zod-enum", async (ctx) => {
	const { color } = await ctx.getSearchParams(enumSchema);
	return ctx.json({ color });
});

const queryRoutes = groupRoutes("/", [
	getSingleParam,
	getMultipleParams,
	getArrayParam,
	getBooleanParam,
	getDefaultParam,
	getStringParam,
	getNumberParam,
	getOptionalParam,
	getZodArrayParam,
	getEnumParam,
]);

export const app = baseApp.addRoutes(queryRoutes);

export type AppType = typeof app;
