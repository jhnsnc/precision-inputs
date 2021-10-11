# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [1.0.0] - 2021-10-11
This version is listed as a major release due to significant breaking changes. I do not yet consider this project in full release since there are major pieces of functionality that have yet to be implemented, but I felt it was important to make a major version number change to reflect the structural changes to the project.

### Added
- `crel` and `crelns` were added as dependencies and are used to simplify DOM creation and manipulation
- users can now middle click in order to reset an input to its initial value
- the KnobInput class now has a new `setupVisuals` method which accepts an `updateCallback` and `visualElement` as parameters; this should be used instead of the now-removed `visualElement` parameter from the constructor and the removed `updateVisuals` option
- the KnobInput class now accepts `focusActiveClass` and `dragActiveClass` options since CSS class names should no longer be shared across classes
- source maps are now included with the distributed package contents

### Changed
- Webpack build system upgraded to v5
- Dart Sass is now in use instead of Node Sass
- styles are now imported via Sass modules and unused class names have been removed
- CSS class names in distributed CSS files include content hashes generated at build time
- usage of `@import` directive in Sass has been replaced with the `@use` directive
- all use of `var` has been replaced with `const` or `let`

### Deprecated
- note that several breaking changes to the API (especially the base KnobInput class) were made without decrecation notice, per the message about the "alpha" state of this project in the README

### Removed
- unused class names have been removed from DOM elements
- the KnobInput class no longer accepts `visualContext` and `updateVisuals` options, and the `visualElement` second parameter from the KnobInput constructor has been removed; the new `setupVisuals` method should be used instead (see above) and pre-calculated values can be managed with instance properties instead of the now-removed "visualContext" system
- the package contents have been simplified dramatically, removing all formats other than a single UMD module and CSS file

### Fixed
- the SVG defs element should now consistently get added as the first child of `<body>`
- fixed a bug where mouse wheel events weren't firing in Chrome; in order to fix this, the `<input>` element now has a non-zero opacity

### Security
- many dev dependencies with vulnerability warnings have been removed, including Node Sass
