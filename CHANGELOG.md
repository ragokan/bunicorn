# Change Log

## [0.0.30] - 2024-09-27

- Update "createNodeServer" to use static routes and handlers, such as openapi

## [0.0.29] - 2024-09-27

- Add "createNodeServer" wrapper for NodeJS environments

## [0.0.28] - 2024-09-25

- Add cache middleware and globam middleware wrappers

## [0.0.27] - 2024-09-17

- Fixes to query parsing

## [0.0.26] - 2024-09-17

- Add new route tree matching for faster routing (up to 10x faster with many routes)
- Fix some tests

## [0.0.25] - 2024-09-17

- Add tests for many cases
- Update how context is working internally (for future)
- Add option to merge headers
- Fix function validator

## [0.0.24] - 2024-09-12

- Finish OpenApi generator
- Add docs for OpenApi generator

## [0.0.23] - 2024-09-09

- Add OpenApi generator

- Add InferDependencyType to the dependency injection package

## [0.0.21] - 2024-09-06

- Update all deps to the latest
- Fix Valibot errors because of breaking API changes
- Fix old type errors

## [0.0.20] - 2024-09-04

- Update deps

## [0.0.19] - 2023-11-06

- Update deps and types.
- Optimizations for Deno.

## [0.0.18] - 2023-10-24

- Update internal context api.

## [0.0.17] - 2023-10-23

- Update type imports

## [0.0.16] - 2023-10-23

- Update type imports

## [0.0.15] - 2023-10-23

- Update js imports to ts

## [0.0.14] - 2023-10-23

- Update types for Deno

## [0.0.13] - 2023-10-23

- Prepare server for Deno

## [0.0.12] - 2023-10-22

- Small performance improvements.
- Prepare for Deno.

## [0.0.11] - 2023-10-20

- Make context creation a little bit faster.

## [0.0.10] - 2023-10-18

- Type updates

## [0.0.9] - 2023-10-18

- Type updates

## [0.0.8] - 2023-10-15

- Add assert to Bunicorn result promise
- Add more docs

## [0.0.7] - 2023-10-12

- Convert context to be a class to be more expensable.
- Add more performance improvements.

## [0.0.6] - 2023-10-11

- Increase performance by updating regexes.
- Add listen method to app.
- Add a way to add global handlers.

## [0.0.5] - 2023-10-10

- Remove the requirement of specifying the basePath in app. Will use '/' by default.
- Make bundler Bun for faster bundling.

## [0.0.4] - 2023-10-10

- Increase path matching performance by equality checks for non regex paths.
- Replace .match with .exec for regex path matching to increase performance.
- Remove use of new URL and use raw regex instead to increase performance.

## [0.0.3] - 2023-10-8

- Add `app.getFromStore` method to get dependencies outside of routes.

## [0.0.2] - 2023-10-8

- Add a new route matching way to increase performance.
- Make edge routing even more lazy with new route matching.

## [0.0.1] - 2023-10-06

- Initial release
