import assert from "node:assert/strict";
import fs from "node:fs";

const styles = fs.readFileSync("src/styles/css/main.css", "utf8");

assert.doesNotMatch(
  styles,
  /\.list-inline li\s*\{[^}]*width:\s*320px/s,
  "basemap entries do not keep a fixed width",
);
assert.doesNotMatch(
  styles,
  /#collapseBaseMapLayers\s*\{[^}]*margin-left:\s*40px/s,
  "short viewports do not shift the basemap list outside its panel",
);
assert.match(
  styles,
  /#basemap-selector\s*\{[^}]*overflow-y:\s*auto/s,
  "the basemap panel scrolls when the viewport is short",
);
assert.match(
  styles,
  /#collapseBaseMapLayers\s*\{[^}]*width:\s*100%/s,
  "the basemap list follows the width of its panel",
);
assert.match(
  styles,
  /#collapseBaseMapLayers\s*>\s*li\s*\{[^}]*width:\s*100%/s,
  "each basemap entry follows the width of the list",
);
assert.match(
  styles,
  /#collapseBaseMapLayers \.zoom-info-icon \.tooltiptext\s*\{[^}]*right:\s*calc\(100% \+ 0\.5rem\)[^}]*left:\s*auto/s,
  "basemap detail tooltips open toward the inside of the panel",
);

console.log("Basemap responsive layout checks passed.");
