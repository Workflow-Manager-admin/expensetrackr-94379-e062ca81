# vue-kavia

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

---

## 🧪 Test Environment Configuration (Vitest + Vuetify + Chart.js)

**Global Test Setup:**
- The file `setupTests.ts` is configured as the Vitest `setupFiles` entry point. This sets up for all tests:
  - Vuetify is registered globally using @vue/test-utils, so all components rendered by the test runner have Vuetify context and features.
  - The `canvas` npm library is installed as a devDependency and patched into the JSDOM-derived window object, allowing Chart.js (and other canvas libraries) to function in headless environments.
  - `HTMLCanvasElement.prototype.getContext`, `toDataURL`, etc., are polyfilled either with real implementations (using node-canvas) or with minimal mocks to allow Chart.js to operate in test mode without crashing.
  - Browser APIs like `window.matchMedia` are polyfilled, as Vuetify checks these for rendering breakpoints in components.

**Updating or Debugging:**
- See comments in `setupTests.ts` for instructions on extending the polyfills or mocks.
- If tests using Chart.js fail because of missing canvas methods, check node-canvas is installed and working, or extend the NOOP mocks.
- This setup ensures that UI tests involving Vuetify and chart components (like ExpensePieChart.vue) are reliable in JSDOM/Vitest (Node) environments.

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
