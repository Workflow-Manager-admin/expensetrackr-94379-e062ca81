/// Vitest global setup file for Vue 3, Vuetify 3, Chart.js, and JSDOM testing.
///
/// This file is referenced in `vitest.config.ts` via the 'setupFiles' option for Vitest.
/// Responsible for:
///   1. Globally registering and injecting Vuetify (so all tests use Vuetify components/style).
///   2. Patching Chart.js usage by providing a working canvas implementation in JSDOM environment,
///      using the node 'canvas' package for DOM-less rendering.
///   3. Polyfilling `HTMLCanvasElement.prototype.getContext` and related APIs so Chart.js and any
///      canvas-dependent Vue code runs safely.
///
/// Documented below section by section.

import { config } from "@vue/test-utils";

// --- 1. Vuetify Global Registration ---
import { createVuetify } from "vuetify";
import * as vuetifyComponents from "vuetify/components";
import * as vuetifyDirectives from "vuetify/directives";
import "vuetify/styles";

// Preconfigure a Vuetify instance for all tests:
const vuetify = createVuetify({
  components: vuetifyComponents,
  directives: vuetifyDirectives,
  theme: {
    defaultTheme: "light",
  }
});

// Apply Vuetify to every test wrapper
config.global.plugins = [vuetify];

// --- 2. Node 'canvas' Patch for Chart.js and JSDOM ---

declare global {
  // Ensure matchMedia exists for Vuetify and side-effects
  interface Window {
    matchMedia: (query: string) => MediaQueryList;
  }
}

// Patch JSDOM environment for Chart.js (only if running in a browser-like environment)
if (typeof window !== "undefined" && typeof window.HTMLCanvasElement !== "undefined") {
  // Use dynamic import to load 'canvas' for ESM compatibility and to avoid require()
  (async () => {
    try {
      // @ts-expect-error: dynamic import for node-canvas is intentional (cjs/esm support)
      const nodeCanvas = await import("canvas");

      // Patch getContext
      if (!window.HTMLCanvasElement.prototype.getContext) {
        window.HTMLCanvasElement.prototype.getContext = function getContext2d(
          contextId: string,
          ...args: unknown[]
        ): unknown {
          const c = new nodeCanvas.Canvas(this.width, this.height);
          return c.getContext(contextId, ...args);
        };
      }

      // Patch toDataURL
      if (!window.HTMLCanvasElement.prototype.toDataURL) {
        window.HTMLCanvasElement.prototype.toDataURL = function (): string {
          const c = new nodeCanvas.Canvas(this.width, this.height);
          return c.toDataURL();
        };
      }
    } catch {
      // If 'canvas' can't be loaded (eg, in CI docker), provide NOOP fallback to avoid crashes.
      window.HTMLCanvasElement.prototype.getContext = function (
        // intentionally unused arguments to satisfy Chart.js and avoid ESLint unused error
      ): Record<string, unknown> {
        return {
          clearRect: () => {},
          fillRect: () => {},
          getImageData: () => ({ data: [] }),
          putImageData: () => {},
          createImageData: () => ({}),
          setTransform: () => {},
          drawImage: () => {},
          beginPath: () => {},
          moveTo: () => {},
          lineTo: () => {},
          closePath: () => {},
          stroke: () => {},
          fill: () => {},
          measureText: () => ({ width: 1 })
        };
      };
      window.HTMLCanvasElement.prototype.toDataURL = () => "";
    }
  })();
}

// --- 3. Polyfill other browser APIs if necessary ---
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = function () {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      media: "",
      onchange: null
    };
  };
}

// --- 4. Document setup for test maintainers ---
/**
 * Test Setup Documentation
 * - Vuetify is registered globally via @vue/test-utils config so every mount uses Vuetify context.
 * - The 'canvas' package is required so Chart.js can render during JSDOM tests. If not available,
 *   canvas methods are polyfilled/mocked.
 * - HTMLCanvasElement.prototype.getContext and toDataURL are either patched to real node-canvas
 *   methods or replaced with minimal mocks so Chart.js tests don't error.
 * - matchMedia is polyfilled for UI libraries (Vuetify uses it for breakpoint checks).
 */
