# Changelog

## [1.0.0-next.1](https://github.com/fuf-stack/pixels/compare/atelier-v1.0.0-next.0...atelier-v1.0.0-next.1) (2026-10-25)


### ⚠ BREAKING CHANGES

* Remove the pixel-utils heroui export and public Uniform useInput, useUniformField and useUniformFieldArray hook exports. Applications must import pixel-utils/tokens.css, configure Tailwind source scanning and replace custom --heroui-* variables with --pixel-* variables. Custom fields must migrate to the supported controller and form-context APIs. Selectors targeting removed internal markup or state attributes must migrate to the documented slots and supported attributes.

### Features

* replace HeroUI with owned components and Tailwind 4 styling ([df27899](https://github.com/fuf-stack/pixels/commit/df27899a1675df276d40bebc7ae745e3dc31be5a))


### Bug Fixes

* **release:** merge main into next and repair prerelease bootstrap ([3bb219d](https://github.com/fuf-stack/pixels/commit/3bb219d42bbba9bdff8612e27209d142ff26ca63))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @fuf-stack/pixel-utils bumped to 2.0.0-next.1
    * @fuf-stack/pixels bumped to 2.0.0-next.1

## [0.4.1](https://github.com/fuf-stack/pixels/compare/atelier-v0.4.0...atelier-v0.4.1) (2026-10-19)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @fuf-stack/pixel-utils bumped to 1.4.1
    * @fuf-stack/pixels bumped to 1.14.1

## [0.4.0](https://github.com/fuf-stack/pixels/compare/atelier-v0.3.2...atelier-v0.4.0) (2026-10-14)


### Features

* expand verification and contribution tooling ([cf200f0](https://github.com/fuf-stack/pixels/commit/cf200f0f6985e010b34b81eed494356c27099d55))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @fuf-stack/pixels bumped to 1.14.0

## [0.3.2](https://github.com/fuf-stack/pixels/compare/atelier-v0.3.1...atelier-v0.3.2) (2026-08-13)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @fuf-stack/pixels bumped to 1.13.2

## [0.3.1](https://github.com/fuf-stack/pixels/compare/atelier-v0.3.0...atelier-v0.3.1) (2026-07-29)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @fuf-stack/pixels bumped to 1.13.1

## [0.3.0](https://github.com/fuf-stack/pixels/compare/atelier-v0.2.5...atelier-v0.3.0) (2026-07-17)


### Features

* build esm only, no cjs anymore ([7856711](https://github.com/fuf-stack/pixels/commit/78567111820395bb9b0017c04820e0c8efea0e9f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @fuf-stack/pixel-utils bumped to 1.4.0
    * @fuf-stack/pixels bumped to 1.13.0

## [0.2.5](https://github.com/fuf-stack/pixels/compare/atelier-v0.2.4...atelier-v0.2.5) (2026-07-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @fuf-stack/pixels bumped to 1.12.1

## [0.2.4](https://github.com/fuf-stack/pixels/compare/atelier-v0.2.3...atelier-v0.2.4) (2026-07-05)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @fuf-stack/pixels bumped to 1.12.0

## [0.2.3](https://github.com/fuf-stack/pixels/compare/atelier-v0.2.2...atelier-v0.2.3) (2026-06-30)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @fuf-stack/pixels bumped to 1.11.8

## [0.2.2](https://github.com/fuf-stack/pixels/compare/atelier-v0.2.1...atelier-v0.2.2) (2026-06-26)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @fuf-stack/pixels bumped to 1.11.7

## [0.2.1](https://github.com/fuf-stack/pixels/compare/atelier-v0.2.0...atelier-v0.2.1) (2026-06-26)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @fuf-stack/pixels bumped to 1.11.6

## [0.2.0](https://github.com/fuf-stack/pixels/compare/atelier-v0.1.0...atelier-v0.2.0) (2026-06-25)


### Features

* **atelier:** add customizable app frame package with core APIs and story/test coverage ([ecdcabd](https://github.com/fuf-stack/pixels/commit/ecdcabde04430d952011c35db97231f84fee59e9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @fuf-stack/pixels bumped to 1.11.5
