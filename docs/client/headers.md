# Headers

To add headers to request, we have a global way and local way.

## Global

You can specify headers while creating client.

```ts
const client = bunicornClient<AppType>({
  basePath: "http://localhost:8000",
  // Will be merged, so you can override on local usage.
  headers: { "x-token": "123" }
});

// Or as function

const client = bunicornClient<AppType>({
  basePath: "http://localhost:8000",
  // Will be merged, so you can override on local usage.
  headers: () => ({ "x-token": localStorage.get("x-token") })
});
```

## Local

```ts
const createdTodo = await client.post("/api/todos", {
  input: { title: "Hello world!" },
  with: {
    // Here we can specify all RequestInit options (not body and method)
    headers: { "x-token": "1234" }
  }
});
```
