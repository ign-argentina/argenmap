import assert from "node:assert/strict";
import fs from "node:fs";

const mapSource = fs.readFileSync("src/js/map/map.js", "utf8");

assert.doesNotMatch(
  mapSource,
  /L\.Browser\.webkit\s*&&\s*!window\.location\.origin\.includes\("idecom"\)/,
  "the screenshot control is not restricted to WebKit browsers",
);
assert.match(
  mapSource,
  /case "screenShoter":\s*return !window\.location\.origin\.includes\("idecom"\);/,
  "the screenshot plugin is available in Firefox",
);
assert.match(
  mapSource,
  /L\.simpleMapScreenshoter\(\{\s*domtoimageOptions:\s*\{[\s\S]*?cacheBust: true,/,
  "screenshot tile requests bypass copies cached without CORS headers",
);

console.log("Map screenshot compatibility checks passed.");
