import assert from "node:assert/strict";
import fs from "node:fs";

const popupStyles = fs.readFileSync(
  "src/js/components/main-popup/mainPopup.css",
  "utf8",
);
const contentRule = popupStyles.match(
  /#contentWrapperTxt\s*\{([\s\S]*?)\}/,
)?.[1];

assert.ok(contentRule, "the welcome popup has a content container rule");
assert.match(
  contentRule,
  /min-height:\s*0/,
  "the welcome content can shrink on viewports where scrolling is required",
);
assert.doesNotMatch(
  contentRule,
  /max-height:\s*32d?vh/,
  "the welcome content is not clipped to a fixed viewport fraction",
);

console.log("Welcome-popup responsive layout checks passed.");
