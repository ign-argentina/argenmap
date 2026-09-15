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
assert.match(
  drawSource,
  /addEventListener\(\s*"dblclick",\s*this\._boundOnFinishDoubleClick,\s*!0/,
  "polygon completion observes double clicks before map zoom",
);
assert.match(
  drawSource,
  /addEventListener\(\s*"touchstart",\s*this\._boundOnFinishTouch,\s*!0/,
  "polygon completion observes touch starts before map zoom",
);
assert.match(
  drawSource,
  /finishOnDoubleClickTolerance: 12[\s\S]*?touchFinishOnDoubleClickTolerance: 24[\s\S]*?finishOnDoubleTapDelay: 500/,
  "polygon completion defines mouse, touch, and double-tap thresholds",
);
assert.match(
  drawSource,
  /_markers\[t - 1\]\.on\(\s*"dblclick",\s*this\._onFinishDoubleClick/,
  "the last polygon marker uses the proximity-aware finish handler",
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

const nearLastVertexBody = drawSource.match(
  /_isEventNearLastVertex: function \(t\) \{([\s\S]*?)\n      \},\n      _onFinishTouch/,
)?.[1];
const finishTouchBody = drawSource.match(
  /_onFinishTouch: function \(t\) \{([\s\S]*?)\n      \},\n      _onFinishDoubleClick/,
)?.[1];
const finishDoubleClickBody = drawSource.match(
  /_onFinishDoubleClick: function \(t\) \{([\s\S]*?)\n      \},\n      _updateFinishHandler/,
)?.[1];
assert.ok(nearLastVertexBody, "the polygon proximity check is testable");
assert.ok(finishTouchBody, "the native double-tap handler is testable");
assert.ok(
  finishDoubleClickBody,
  "the proximity-aware polygon finish handler is testable",
);

const point = (x, y) => ({
  x,
  y,
  distanceTo(other) {
    return Math.hypot(this.x - other.x, this.y - other.y);
  },
});
const polygonContext = vm.createContext({
  L: {
    Browser: { touch: false },
    DomEvent: {
      stop(event) {
        event.stopped = true;
      },
    },
  },
});
const nearLastVertex = vm.runInContext(
  `(function (t) {${nearLastVertexBody}\n})`,
  polygonContext,
);
const finishTouch = vm.runInContext(
  `(function (t) {${finishTouchBody}\n})`,
  polygonContext,
);
const finishDoubleClick = vm.runInContext(
  `(function (t) {${finishDoubleClickBody}\n})`,
  polygonContext,
);
let finishedPolygons = 0;
const lastVertex = { x: 100, y: 100 };
const polygonHandler = {
  options: {
    finishOnDoubleClickTolerance: 12,
    touchFinishOnDoubleClickTolerance: 24,
    touchMouseEventDelay: 700,
    finishOnDoubleTapDelay: 500,
  },
  _markers: [
    { getLatLng: () => ({ x: 0, y: 0 }) },
    { getLatLng: () => ({ x: 50, y: 50 }) },
    { getLatLng: () => lastVertex },
  ],
  _map: {
    mouseEventToContainerPoint: (event) => point(event.clientX, event.clientY),
    latLngToContainerPoint: (latlng) => point(latlng.x, latlng.y),
  },
  _isEventNearLastVertex: nearLastVertex,
  _finishShape() {
    finishedPolygons++;
  },
};

const nearMouseEvent = {
  clientX: 108,
  clientY: 106,
  stopImmediatePropagation() {
    this.immediatePropagationStopped = true;
  },
};
finishDoubleClick.call(polygonHandler, nearMouseEvent);
assert.equal(finishedPolygons, 1, "a nearby mouse double click closes the polygon");
assert.equal(nearMouseEvent.stopped, true, "nearby completion prevents map zoom");
assert.equal(
  nearMouseEvent.immediatePropagationStopped,
  true,
  "nearby completion cannot also reach the marker handler",
);

const farMouseEvent = { clientX: 113, clientY: 100 };
finishDoubleClick.call(polygonHandler, farMouseEvent);
assert.equal(finishedPolygons, 1, "a distant mouse double click stays on the map");
assert.equal(farMouseEvent.stopped, undefined, "a distant double click is not consumed");

lastVertex.x = 200;
lastVertex.y = 200;
const newLastVertexEvent = { clientX: 200, clientY: 200 };
finishDoubleClick.call(polygonHandler, newLastVertexEvent);
assert.equal(
  finishedPolygons,
  2,
  "a double click that creates the last vertex also closes the polygon",
);

const originalTouchEvent = {
  clientX: 220,
  clientY: 210,
  sourceCapabilities: { firesTouchEvents: true },
};
const nearTouchEvent = { originalEvent: originalTouchEvent };
finishDoubleClick.call(polygonHandler, nearTouchEvent);
assert.equal(finishedPolygons, 3, "the larger touch tolerance closes the polygon");
assert.equal(originalTouchEvent.stopped, true, "touch completion prevents map zoom");

const firstTouch = {
  type: "touchstart",
  touches: [{ clientX: 200, clientY: 200 }],
};
const secondTouch = {
  type: "touchstart",
  touches: [{ clientX: 208, clientY: 206 }],
  stopImmediatePropagation() {
    this.immediatePropagationStopped = true;
  },
};
finishTouch.call(polygonHandler, firstTouch);
assert.equal(finishedPolygons, 3, "a first tap keeps drawing the polygon");
finishTouch.call(polygonHandler, secondTouch);
assert.equal(finishedPolygons, 4, "a native second tap closes the polygon");
assert.equal(secondTouch.stopped, true, "the second tap prevents map zoom");
assert.equal(
  secondTouch.immediatePropagationStopped,
  true,
  "the second tap cannot add another vertex",
);

console.log("Leaflet.Draw touch initialization checks passed.");
