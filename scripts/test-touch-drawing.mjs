import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const mapSource = fs.readFileSync("src/js/map/map.js", "utf8");
const drawSource = fs.readFileSync(
  "src/js/map/plugins/leaflet/leaflet-draw/leaflet.draw.js",
  "utf8",
);
const helperSource = mapSource.match(
  /function ensureLeafletDrawTouchHandler\(map\) \{[\s\S]*?\n\}/,
)?.[0];

assert.ok(helperSource, "the late-loaded Leaflet.Draw touch helper exists");
assert.match(
  mapSource,
  /case "Draw":\s*ensureLeafletDrawTouchHandler\(mapa\);/,
  "the touch handler is installed before the draw control is initialized",
);

const TouchExtend = function TouchExtend() {};
const context = vm.createContext({
  L: { Map: { TouchExtend } },
});
vm.runInContext(
  `${helperSource}\nglobalThis.ensureLeafletDrawTouchHandler = ensureLeafletDrawTouchHandler;`,
  context,
);

let addHandlerCalls = 0;
let enableCalls = 0;
const map = {
  addHandler(name, Handler) {
    addHandlerCalls++;
    assert.equal(name, "touchExtend");
    assert.equal(Handler, TouchExtend);
    this.touchExtend = {
      enable() {
        enableCalls++;
      },
    };
  },
};

context.ensureLeafletDrawTouchHandler(map);
context.ensureLeafletDrawTouchHandler(map);

assert.equal(addHandlerCalls, 1, "the handler is installed only once");
assert.equal(enableCalls, 2, "an existing handler is always left enabled");

context.ensureLeafletDrawTouchHandler(null);
context.L.Map.TouchExtend = null;
context.ensureLeafletDrawTouchHandler({});

assert.match(
  drawSource,
  /touchMouseEventDelay: 700/,
  "draw handlers define a compatibility-mouse suppression window",
);
assert.match(
  drawSource,
  /_onMouseDown: function \(t\) \{\s*if \(this\._isTouchGeneratedMouseEvent\(t\)\) return;/,
  "touch-generated mouse-down events cannot add or finish vertices",
);
assert.match(
  drawSource,
  /_onMouseUp: function \(t\) \{\s*if \(this\._isTouchGeneratedMouseEvent\(t\)\)/,
  "touch-generated mouse-up events cannot finish a line",
);
assert.match(
  drawSource,
  /_onTouch: function \(t\) \{[\s\S]*?this\._lastTouchTime = Date\.now\(\);/,
  "every map touch records the compatibility-event suppression time",
);
assert.match(
  drawSource,
  /_onFinishClick: function \(t\) \{\s*this\._isTouchGeneratedMouseEvent\(t\) \|\| this\._finishShape\(\);/,
  "a synthetic click on a newly inserted line vertex cannot finish the line",
);
assert.match(
  drawSource,
  /_markers\[t - 1\]\.on\("click", this\._onFinishClick, this\)/,
  "line completion uses the touch-aware click handler",
);

const compatibilityCheckBody = drawSource.match(
  /_isTouchGeneratedMouseEvent: function \(t\) \{([\s\S]*?)\n      \},\n      _onMouseDown/,
)?.[1];
const finishClickBody = drawSource.match(
  /_onFinishClick: function \(t\) \{([\s\S]*?)\n      \},\n      _updateFinishHandler/,
)?.[1];
assert.ok(compatibilityCheckBody, "the compatibility-event check is testable");
assert.ok(finishClickBody, "the touch-aware finish handler is testable");

const compatibilityCheck = vm.runInNewContext(
  `(function (t) {${compatibilityCheckBody}\n})`,
);
const finishClick = vm.runInNewContext(`(function (t) {${finishClickBody}\n})`);
let finishedLines = 0;
const lineHandler = {
  options: { touchMouseEventDelay: 700 },
  _lastTouchTime: Date.now(),
  _isTouchGeneratedMouseEvent: compatibilityCheck,
  _finishShape() {
    finishedLines++;
  },
};

finishClick.call(lineHandler, { originalEvent: {} });
finishClick.call(lineHandler, {
  originalEvent: { sourceCapabilities: { firesTouchEvents: true } },
});
assert.equal(
  finishedLines,
  0,
  "compatibility clicks immediately following a tap do not finish the line",
);

lineHandler._lastTouchTime = Date.now() - 701;
finishClick.call(lineHandler, { originalEvent: {} });
assert.equal(finishedLines, 1, "a later genuine mouse click can finish the line");

console.log("Leaflet.Draw touch initialization checks passed.");
