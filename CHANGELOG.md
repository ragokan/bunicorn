# Change Log

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
