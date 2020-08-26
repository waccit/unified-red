# Setup Unified-RED development environment:

## Symlink Node-RED to development folder

```
cd ~/.node-red
npm install --save ~/git/unified-red
```

## To unlink Unified-Red development folder

```
cd ~/.node-red/node_modules
unlink unified-red
```
Unlinking is required prior to reinstalling or relinking Unified-Red

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--watch` flag to build automatically on a file save. Use the `--prod` flag for a production build.

# Node-RED Configuration

## Security

To apply Unified user authentication to the Node-RED editor, please set the following parameter in your Node-RED settings.js file:

`adminAuth: require("./node_modules/unified-red/admin-auth"),`

## Static Files

To include static files (CSS, JS, image, etc), please set the following parameter in your Node-RED settings.js file:

`httpStatic: "./node_modules/unified-red/static/",`

# Old Angular CLI notes:

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
