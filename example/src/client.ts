import bunicornClient from "@bunicorn/client";
import { type AppType } from "./server.js";
import {
  type Route,
  type BaseMethod,
  type BunicornApp
} from "@bunicorn/server";

// WE INITIALIZE THE CLIENT WITH THE PATH THAT OUR SERVER IS GOING TO USE
// AND PROVIDE THE TYPE OF OUR APP
export const client = bunicornClient<AppType>({
  basePath: "http://localhost:8000"
});

type ExtractPathsByMethod<
  TApp,
  Method extends BaseMethod
> = TApp extends BunicornApp<any, infer Routes>
  ? {
      [K in keyof Routes]: Routes[K] extends Route<any, infer TMethod, any, any>
        ? TMethod extends Method
          ? Routes[K]["path"]
          : never
        : never;
    }[number]
  : never;

type Get = ExtractPathsByMethod<AppType, "GET">;

// NOW, IT IS TYPED
const todos = await client.get("/api/todos", {});
