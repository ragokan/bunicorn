# Dependency Injection

Bunicorn includes a very simple but usefull dependency injection system.

- Full type safety
- Circular dependency support
- Easy to use
- No decorators
- Lazy loading

## How to create a dependency

```ts
import { dependency } from "@bunicorn/server";

const appConfig = dependency(() => {
  // This will be called when the dependency is requested.
  return {
    port: 3000,
    host: "localhost",
    user: "bunicorn"
  };
});

const appDB = dependency(get => {
  const config = get(appConfig); // This will get the appConfig dependency, that simple!
  const dbUrl = `postgres://${config.user}:password@${config.host}:5432/mydb`;
  return new Database(dbUrl);
});
```

## How to consume the dependency

```ts
const getTodosRoute = routeBuilder.get("/todos", async ctx => {
  const db = ctx.get(appDB); // This will get the appDB dependency
  return db.todos.findMany();
});
```

## Usage outside of routes

```ts
function globalFunction() {
  const db = BunicornApp.getFromStore(appDB); // This will get the appDB dependency, it is the same as ctx.get(appDB)
}
```
