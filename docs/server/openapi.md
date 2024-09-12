# OpenAPI

Bunicorn has built-in OpenAPI generator that does not require you to do anything else than providing input/output.

## Install

::: code-group

```sh [bun]
$ bun add @bunicorn/openapi
```

```sh [npm]
$ npm install @bunicorn/openapi
```

```sh [pnpm]
$ pnpm install @bunicorn/openapi
```

```sh [yarn]
$ yarn add @bunicorn/openapi
```

:::

## Usage

```ts
// Import
import openApiHandler from "@bunicorn/openapi";

const baseApp = new BunicornApp({ basePath: "/api" });
// Add routes like how you do usually
const app = baseApp.addRoutes([defaultRoute]).addRoutes(helloRoutes)

// Before serving app, add this
await app.addAsyncHandler(
	openApiHandler({ apiUrl: "http://localhost:8000" }),
);

// And serve as usual
app.serve({ port: 8000 });
```

We need to specify **apiUrl** to handler to make requests on the Swagger UI.

## OpenAPI JSON

By default, you can reach to OpenAPI JSON by going to `$backendUrl/docs/openapi`.  
You can change this by providing the **openApiJsonPath** to the handler.

```ts
await app.addAsyncHandler(
    openApiHandler({
        apiUrl: "http://localhost:8000",
        openApiJsonPath: "/customPath/openapi.json",
    }),
);
```

## Swagger UI

By default, you can reach to Swagger UI by going to `$backendUrl/docs/swaggerui`.  
You can change this by providing the **swaggerUiPath** to the handler.

```ts
await app.addAsyncHandler(
    openApiHandler({
        apiUrl: "http://localhost:8000",
        swaggerUiPath: "/customPath/swaggerui",
    }),
);
```
