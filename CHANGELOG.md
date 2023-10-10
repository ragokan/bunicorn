# Change Log

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
