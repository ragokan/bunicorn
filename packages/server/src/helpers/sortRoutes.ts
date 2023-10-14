import { type PrivateBunicornApp, type BuniApp } from "../app/index.ts";

export function sortRoutes(target: BuniApp) {
  const app = target as PrivateBunicornApp;
  Object.entries(app.routes).forEach(([method, routes]) => {
    // sort app.routes[method] so if the route does not have 'regexp', it should be at last
    app.routes[method as keyof PrivateBunicornApp["routes"]] = routes.sort(
      (a, b) => {
        if (a.regexp && !b.regexp) {
          return 1;
        }
        if (!a.regexp && b.regexp) {
          return -1;
        }
        return 0;
      }
    );
  });
}
