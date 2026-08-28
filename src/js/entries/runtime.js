import {
  AppDependencyLoader,
  appDependencies,
  enableNativeInteractions,
  onDomReady,
} from "../utils/dependencies/dependency-loader.js";
import "../utils/bootstrap-native.js";

// Temporary compatibility surface for the classic scripts that have not yet
// migrated to ES modules. Keep this list explicit so it can shrink over time.
Object.assign(globalThis, {
  AppDependencyLoader,
  appDependencies,
  enableNativeInteractions,
  onDomReady,
});

window.dispatchEvent(new CustomEvent("argenmap:runtime-ready"));
