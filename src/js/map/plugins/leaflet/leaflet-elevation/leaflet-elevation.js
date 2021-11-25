(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}((function () { 'use strict';

    // Following https://github.com/Leaflet/Leaflet/blob/master/PLUGIN-GUIDE.md
    (function (factory, window) {
      // define an AMD module that relies on 'leaflet'
      if (typeof define === 'function' && define.amd) {
        define(['leaflet'], factory); // define a Common JS module that relies on 'leaflet'
      } else if (typeof exports === 'object') {
        module.exports = factory(require('leaflet'));
      } // attach your plugin to the global 'L' variable


      if (typeof window !== 'undefined' && window.L) {
        factory(window.L);
      }
    })(function (L) {
      L.locales = {};
      L.locale = null;

      L.registerLocale = function registerLocale(code, locale) {
        L.locales[code] = L.Util.extend({}, L.locales[code], locale);
      };

      L.setLocale = function setLocale(code) {
        L.locale = code;
      };

      return L.i18n = L._ = function translate(string, data) {
        if (L.locale && L.locales[L.locale] && L.locales[L.locale][string]) {
          string = L.locales[L.locale][string];
        }

        try {
          // Do not fail if some data is missing
          // a bad translation should not break the app
          string = L.Util.template(string, data);
        } catch (err) {
          /*pass*/
        }

        return string;
      };
    }, window);

    function _typeof(obj) {
      "@babel/helpers - typeof";

      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function (obj) {
          return typeof obj;
        };
      } else {
        _typeof = function (obj) {
          return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
      }

      return _typeof(obj);
    }

    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    }

    /**
     * Recursive deep merge objects.
     * Alternative to L.Util.setOptions(this, options).
     */
    function deepMerge(target) {
      for (var _len = arguments.length, sources = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        sources[_key - 1] = arguments[_key];
      }

      if (!sources.length) return target;
      var source = sources.shift();

      if (isObject(target) && isObject(source)) {
        for (var key in source) {
          if (isObject(source[key])) {
            if (!target[key]) Object.assign(target, _defineProperty({}, key, {}));
            deepMerge(target[key], source[key]);
          } else {
            Object.assign(target, _defineProperty({}, key, source[key]));
          }
        }
      }

      return deepMerge.apply(void 0, [target].concat(sources));
    }
    /**
     * Wait for document load before execute function.
     */

    function deferFunc(f) {
      if (document.readyState !== 'complete') window.addEventListener("load", f, {
        once: true
      });else f();
    }
    /**
     * Debounce function to limit events are being fired.
     */

    function debounce(func, wait, context, immediate) {
      var timeout;
      return function () {
        var args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
          timeout = null;
          if (!immediate) func.apply(context, args);
        }, wait);
        if (immediate && !timeout) func.apply(context, args);
      };
    }
    var SEC = 1000;
    var MIN = SEC * 60;
    var HOUR = MIN * 60;
    var DAY = HOUR * 24;
    /**
     * Convert a duration time (millis) to a human readable string (%Dd %H:%M'%S")
     */

    function formatTime(t) {
      var d = Math.floor(t / DAY);
      var h = Math.floor((t - d * DAY) / HOUR);
      var m = Math.floor((t - d * DAY - h * HOUR) / MIN);
      var s = Math.round((t - d * DAY - h * HOUR - m * MIN) / SEC);

      if (s === 60) {
        m++;
        s = 0;
      }

      if (m === 60) {
        h++;
        m = 0;
      }

      if (h === 24) {
        d++;
        h = 0;
      }

      return (d ? d + "d " : '') + h.toString().padStart(2, 0) + ':' + m.toString().padStart(2, 0) + "'" + s.toString().padStart(2, 0) + '"';
    }
    /**
     * Simple GeoJSON data loader.
     */

    function GeoJSONLoader(data, control) {
      if (typeof data === "string") {
        data = JSON.parse(data);
      }

      control = control || this;
      var distanceMarkers = control.options.distanceMarkers === true ? {
        lazy: true
      } : L.extend({
        lazy: true
      }, control.options.distanceMarkers);
      var wptIcons = control.options.gpxOptions.marker_options.wptIcons;
      var layer = L.geoJson(data, {
        distanceMarkers: distanceMarkers,
        style: function style(feature) {
          var style = L.extend({}, control.options.polyline);

          if (control.options.theme) {
            style.className += ' ' + control.options.theme;
          }

          return style;
        },
        pointToLayer: function pointToLayer(feature, latlng) {
          var prop = feature.properties;
          var desc = prop.desc ? prop.desc : '';
          var name = prop.name ? prop.name : '';
          var sym = (prop.sym ? prop.sym : name).replace(' ', '-').replace('"', '').replace("'", '').toLowerCase(); // generate appropriate icon symbol or retrieve it from cache

          wptIcons[sym] = wptIcons[sym] ? wptIcons[sym] : L.divIcon({
            className: 'elevation-waypoint-marker',
            html: '<i class="elevation-waypoint-icon ' + sym + '"></i>',
            iconSize: [30, 30],
            iconAnchor: [8, 30]
          });
          var marker = L.marker(latlng, {
            icon: wptIcons[sym]
          });

          if (name || desc) {
            marker.bindPopup("<b>" + name + "</b>" + (desc.length > 0 ? '<br>' + desc : '')).openPopup();
          }

          control._registerCheckPoint({
            latlng: latlng,
            label: name
          }, true);

          control.fire('waypoint_added', {
            point: marker,
            element: latlng,
            properties: prop
          });
          return marker;
        },
        onEachFeature: function onEachFeature(feature, layer) {
          if (feature.geometry && feature.geometry.type == 'Point') return; // Standard GeoJSON
          // control.addData(feature, layer);  // NB uses "_addGeoJSONData"
          // Extended GeoJSON

          layer._latlngs.forEach(function (point, i, data) {
            // same properties as L.GPX layer
            point.meta = {
              time: null,
              ele: null,
              hr: null,
              cad: null,
              atemp: null
            };
            if ("alt" in point) point.meta.ele = point.alt;

            if (feature.properties) {
              var prop = feature.properties;
              if ("coordTimes" in prop) point.meta.time = new Date(Date.parse(prop.coordTimes[i]));else if ("times" in prop) point.meta.time = new Date(Date.parse(prop.times[i]));else if ("time" in prop) point.meta.time = new Date(Date.parse(_typeof(prop.time) === 'object' ? prop.time[i] : prop.time));
              if ("heartRates" in prop) point.meta.hr = parseInt(prop.heartRates[i]);else if ("heartRate" in prop) point.meta.hr = parseInt(_typeof(prop.heartRate) === 'object' ? prop.heartRate[i] : prop.heartRate); // TODO: cadence, temperature
            }
          });

          control.addData(layer); // NB uses "_addGPXData"
          // Postpone adding the distance markers (lazy: true)

          if (control.options.distanceMarkers && distanceMarkers.lazy) {
            layer.on('add remove', function (e) {
              var path = e.target;

              if (L.DistanceMarkers && path instanceof L.Polyline) {
                path[e.type + 'DistanceMarkers']();
              }
            });
          }

          control.track_info = L.extend({}, control.track_info, {
            type: "geojson",
            name: data.name
          });
        }
      });

      L.Control.Elevation._d3LazyLoader.then(function () {
        control._fireEvt("eledata_loaded", {
          data: data,
          layer: layer,
          name: control.track_info.name,
          track_info: control.track_info
        });
      });

      return layer;
    }
    /**
     * Check DOM element visibility.
     */

    function isDomVisible(elem) {
      return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
    }
    /**
     * Check object type.
     */

    function isObject(item) {
      return item && _typeof(item) === 'object' && !Array.isArray(item);
    }
    /**
     * Check DOM element viewport visibility.
     */

    function isVisible(elem) {
      if (!elem) return false;
      var styles = window.getComputedStyle(elem);

      function isVisibleByStyles(elem, styles) {
        return styles.visibility !== 'hidden' && styles.display !== 'none';
      }

      function isAboveOtherElements(elem, styles) {
        var boundingRect = elem.getBoundingClientRect();
        var left = boundingRect.left + 1;
        var right = boundingRect.right - 1;
        var top = boundingRect.top + 1;
        var bottom = boundingRect.bottom - 1;
        var above = true;
        var pointerEvents = elem.style.pointerEvents;
        if (styles['pointer-events'] == 'none') elem.style.pointerEvents = 'auto';
        if (document.elementFromPoint(left, top) !== elem) above = false;
        if (document.elementFromPoint(right, top) !== elem) above = false; // Only for completely visible elements
        // if (document.elementFromPoint(left, bottom) !== elem) above = false;
        // if (document.elementFromPoint(right, bottom) !== elem) above = false;

        elem.style.pointerEvents = pointerEvents;
        return above;
      }

      if (!isVisibleByStyles(elem, styles)) return false;
      if (!isAboveOtherElements(elem, styles)) return false;
      return true;
    }
    /**
     * Check JSON object type.
     */

    function isJSONDoc(doc, lazy) {
      lazy = typeof lazy === "undefined" ? true : lazy;

      if (typeof doc === "string" && lazy) {
        doc = doc.trim();
        return doc.indexOf("{") == 0 || doc.indexOf("[") == 0;
      } else {
        try {
          JSON.parse(doc.toString());
        } catch (e) {
          if (_typeof(doc) === "object" && lazy) return true;
          console.warn(e);
          return false;
        }

        return true;
      }
    }
    /**
     * Check XML object type.
     */

    function isXMLDoc(doc, lazy) {
      lazy = typeof lazy === "undefined" ? true : lazy;

      if (typeof doc === "string" && lazy) {
        doc = doc.trim();
        return doc.indexOf("<") == 0;
      } else {
        var documentElement = (doc ? doc.ownerDocument || doc : 0).documentElement;
        return documentElement ? documentElement.nodeName !== "HTML" : false;
      }
    }
    /**
     * Async JS script download.
     */

    function lazyLoader(url, skip, loader) {
      if (skip === false) {
        return Promise.resolve();
      }

      if (loader instanceof Promise) {
        return loader;
      }

      return new Promise(function (resolve, reject) {
        var tag = document.createElement("script");
        tag.addEventListener('load', resolve, {
          once: true
        });
        tag.src = url;
        document.head.appendChild(tag);
      });
    }
    /**
     * Generate download data event.
     */

    function saveFile(dataURI, fileName) {
      var a = create('a', '', {
        href: dataURI,
        target: '_new',
        download: fileName || "",
        style: "display:none;"
      });
      var b = document.body;
      b.appendChild(a);
      a.click();
      b.removeChild(a);
    }
    /**
     * Wait for element visible before execute function.
     */

    function waitHolder(elem) {
      return new Promise(function (resolve, reject) {
        var ticking = false;

        var scrollFn = function scrollFn() {
          if (!ticking) {
            L.Util.requestAnimFrame(function () {
              if (isVisible(elem)) {
                window.removeEventListener('scroll', scrollFn);
                resolve();
              }

              ticking = false;
            });
            ticking = true;
          }
        };

        window.addEventListener('scroll', scrollFn);
        if (elem) elem.addEventListener('mouseenter', scrollFn, {
          once: true
        });
        scrollFn();
      });
    }
    /**
     * A little bit safier than L.DomUtil.addClass
     */

    function addClass(targetNode, className) {
      if (targetNode) className.split(" ").every(function (s) {
        return s && L.DomUtil.addClass(targetNode, s);
      });
    }
    /**
     * A little bit safier than L.DomUtil.removeClass()
     */

    function removeClass(targetNode, className) {
      if (targetNode) className.split(" ").every(function (s) {
        return s && L.DomUtil.removeClass(targetNode, s);
      });
    }
    function toggleClass(targetNode, className, conditional) {
      return (conditional ? addClass : removeClass).call(null, targetNode, className);
    }
    function replaceClass(targetNode, removeClassName, addClassName) {
      if (removeClassName) removeClass(targetNode, removeClassName);
      if (addClassName) addClass(targetNode, addClassName);
    }
    function style(targetNode, name, value) {
      if (typeof value === "undefined") return L.DomUtil.getStyle(targetNode, name);else return targetNode.style.setProperty(name, value);
    }
    function toggleStyle(targetNode, name, value, conditional) {
      return style(targetNode, name, conditional ? value : '');
    }
    function toggleEvent(leafletElement, eventName, handler, conditional) {
      return leafletElement[conditional ? 'on' : 'off'](eventName, handler);
    }
    /**
     * A little bit shorter than L.DomUtil.create()
     */

    function create(tagName, className, attributes, parent) {
      var elem = L.DomUtil.create(tagName, className || "");
      if (attributes) setAttributes(elem, attributes);
      if (parent) append(parent, elem);
      return elem;
    }
    /**
     * Same as node.appendChild()
     */

    function append(parent, child) {
      return parent.appendChild(child);
    }
    /**
     * Same as node.insertAdjacentElement()
     */

    function insert(parent, child, position) {
      return parent.insertAdjacentElement(position, child);
    }
    /**
     * Loop for node.setAttribute()
     */

    function setAttributes(elem, attrs) {
      for (var k in attrs) {
        elem.setAttribute(k, attrs[k]);
      }
    }
    /**
     * Same as node.querySelector().
     */

    function select(selector, context) {
      return (context || document).querySelector(selector);
    }
    /**
     * Alias for L.DomEvent.on.
     */

    var on = L.DomEvent.on;
    /**
     * Alias for L.DomEvent.off.
     */

    var off = L.DomEvent.off;
    /**
     * Alias for L.DomUtil.hasClass.
     */

    var hasClass = L.DomUtil.hasClass;
    function randomId() {
      return Math.random().toString(36).substr(2, 9);
    }
    function each(obj, fn) {
      for (var i in obj) {
        fn(obj[i], i);
      }
    }

    var _ = /*#__PURE__*/Object.freeze({
        __proto__: null,
        deepMerge: deepMerge,
        deferFunc: deferFunc,
        debounce: debounce,
        formatTime: formatTime,
        GeoJSONLoader: GeoJSONLoader,
        isDomVisible: isDomVisible,
        isObject: isObject,
        isVisible: isVisible,
        isJSONDoc: isJSONDoc,
        isXMLDoc: isXMLDoc,
        lazyLoader: lazyLoader,
        saveFile: saveFile,
        waitHolder: waitHolder,
        addClass: addClass,
        removeClass: removeClass,
        toggleClass: toggleClass,
        replaceClass: replaceClass,
        style: style,
        toggleStyle: toggleStyle,
        toggleEvent: toggleEvent,
        create: create,
        append: append,
        insert: insert,
        setAttributes: setAttributes,
        select: select,
        on: on,
        off: off,
        hasClass: hasClass,
        randomId: randomId,
        each: each
    });

    var Colors = {
      'lightblue': {
        area: '#3366CC',
        alpha: 0.45,
        stroke: '#3366CC'
      },
      'magenta': {
        area: '#FF005E'
      },
      'yellow': {
        area: '#FF0'
      },
      'purple': {
        area: '#732C7B'
      },
      'steelblue': {
        area: '#4682B4'
      },
      'red': {
        area: '#F00'
      },
      'lime': {
        area: '#9CC222',
        line: '#566B13'
      }
    };
    var Area = function Area(_ref) {
      var width = _ref.width,
          height = _ref.height,
          xAttr = _ref.xAttr,
          yAttr = _ref.yAttr,
          scaleX = _ref.scaleX,
          scaleY = _ref.scaleY,
          _ref$interpolation = _ref.interpolation,
          interpolation = _ref$interpolation === void 0 ? "curveLinear" : _ref$interpolation;
      return d3.area().curve(typeof interpolation === 'string' ? d3[interpolation] : interpolation).x(function (d) {
        return d.xDiagCoord = scaleX(d[xAttr]);
      }).y0(height).y1(function (d) {
        return scaleY(d[yAttr]);
      });
    };
    var Path = function Path(_ref2) {
      var name = _ref2.name,
          color = _ref2.color,
          strokeColor = _ref2.strokeColor,
          strokeOpacity = _ref2.strokeOpacity,
          fillOpacity = _ref2.fillOpacity;
      var path = d3.create('svg:path');
      if (name) path.classed(name, true);
      path.style("pointer-events", "none");
      path.attr("fill", color || '#3366CC').attr("stroke", strokeColor || '#000').attr("stroke-opacity", strokeOpacity || '1').attr("fill-opacity", fillOpacity || '0.8');
      return path;
    };
    var Axis = function Axis(_ref3) {
      var _ref3$type = _ref3.type,
          type = _ref3$type === void 0 ? "axis" : _ref3$type,
          _ref3$tickSize = _ref3.tickSize,
          tickSize = _ref3$tickSize === void 0 ? 6 : _ref3$tickSize,
          _ref3$tickPadding = _ref3.tickPadding,
          tickPadding = _ref3$tickPadding === void 0 ? 3 : _ref3$tickPadding,
          position = _ref3.position,
          height = _ref3.height,
          width = _ref3.width,
          axis = _ref3.axis,
          scale = _ref3.scale,
          ticks = _ref3.ticks,
          tickFormat = _ref3.tickFormat,
          label = _ref3.label,
          labelX = _ref3.labelX,
          labelY = _ref3.labelY,
          _ref3$name = _ref3.name,
          name = _ref3$name === void 0 ? "" : _ref3$name,
          onAxisMount = _ref3.onAxisMount;
      return function (g) {
        var w = 0,
            h = 0;
        if (position == "bottom") h = height;
        if (position == "right") w = width;

        if (axis == "x" && type == "grid") {
          tickSize = -height;
        } else if (axis == "y" && type == "grid") {
          tickSize = -width;
        }

        var axisScale = d3["axis" + position.replace(/\b\w/g, function (l) {
          return l.toUpperCase();
        })]().scale(scale).ticks(ticks).tickPadding(tickPadding).tickSize(tickSize).tickFormat(tickFormat);
        var axisGroup = g.append("g").attr("class", [axis, type, position, name].join(" ")).attr("transform", "translate(" + w + "," + h + ")").call(axisScale);

        if (label) {
          axisGroup.append("svg:text").attr("x", labelX).attr("y", labelY).text(label);
        }

        if (onAxisMount) {
          axisGroup.call(onAxisMount);
        }

        return axisGroup;
      };
    };
    var Grid = function Grid(props) {
      props.type = "grid";
      return Axis(props);
    };
    var HeightFocusLine = function HeightFocusLine(_ref4) {
      var theme = _ref4.theme,
          _ref4$xCoord = _ref4.xCoord,
          xCoord = _ref4$xCoord === void 0 ? 0 : _ref4$xCoord,
          _ref4$yCoord = _ref4.yCoord,
          yCoord = _ref4$yCoord === void 0 ? 0 : _ref4$yCoord,
          _ref4$length = _ref4.length,
          length = _ref4$length === void 0 ? 0 : _ref4$length;
      return function (line) {
        return line.attr("class", theme + " height-focus line").attr("x1", xCoord).attr("x2", xCoord).attr("y1", yCoord).attr("y2", length);
      };
    };
    var HeightFocusLabel = function HeightFocusLabel(_ref5) {
      var theme = _ref5.theme,
          _ref5$xCoord = _ref5.xCoord,
          xCoord = _ref5$xCoord === void 0 ? 0 : _ref5$xCoord,
          _ref5$yCoord = _ref5.yCoord,
          yCoord = _ref5$yCoord === void 0 ? 0 : _ref5$yCoord,
          label = _ref5.label;
      return function (text) {
        text.attr("class", theme + " height-focus-label").style("pointer-events", "none").attr("x", xCoord + 5).attr("y", yCoord);
        var y = text.select(".height-focus-y");
        if (!y.node()) y = text.append("svg:tspan");
        y.attr("class", "height-focus-y").text(label);
        text.selectAll('tspan').attr("x", xCoord + 5);
        return text;
      };
    };
    var HeightFocusMarker = function HeightFocusMarker(_ref6) {
      var theme = _ref6.theme,
          _ref6$xCoord = _ref6.xCoord,
          xCoord = _ref6$xCoord === void 0 ? 0 : _ref6$xCoord,
          _ref6$yCoord = _ref6.yCoord,
          yCoord = _ref6$yCoord === void 0 ? 0 : _ref6$yCoord;
      return function (circle) {
        return circle.attr("class", theme + " height-focus circle-lower").attr("transform", "translate(" + xCoord + "," + yCoord + ")").attr("r", 6).attr("cx", 0).attr("cy", 0);
      };
    };
    var LegendItem = function LegendItem(_ref7) {
      var name = _ref7.name,
          label = _ref7.label,
          width = _ref7.width,
          height = _ref7.height,
          _ref7$margins = _ref7.margins,
          margins = _ref7$margins === void 0 ? {} : _ref7$margins,
          color = _ref7.color,
          path = _ref7.path;
      return function (g) {
        g.attr("class", "legend-item legend-" + name.toLowerCase()).attr("data-name", name);
        var svg = d3.select(g.node().ownerSVGElement || g);
        g.on('click.legend', function () {
          return svg.dispatch("legend_clicked", {
            detail: {
              path: path.node(),
              name: name,
              legend: g.node(),
              enabled: !path.classed('leaflet-hidden')
            }
          });
        });
        g.append("svg:rect").attr("x", width / 2 - 50).attr("y", height + margins.bottom / 2).attr("width", 50).attr("height", 10).attr("fill", color).attr("stroke", "#000").attr("stroke-opacity", "0.5").attr("fill-opacity", "0.25");
        g.append('svg:text').text(L._(label || name)).attr("x", width / 2 + 5).attr("font-size", 10).style("text-decoration-thickness", "2px").style("font-weight", "700").attr('y', height + margins.bottom / 2).attr('dy', "0.75em");
        return g;
      };
    };
    var MouseFocusLine = function MouseFocusLine(_ref8) {
      var _ref8$xCoord = _ref8.xCoord,
          xCoord = _ref8$xCoord === void 0 ? 0 : _ref8$xCoord,
          height = _ref8.height;
      return function (line) {
        return line.attr('class', 'mouse-focus-line').attr('x2', xCoord).attr('y2', 0).attr('x1', xCoord).attr('y1', height);
      };
    };
    var MouseFocusLabel = function MouseFocusLabel(_ref9) {
      var xCoord = _ref9.xCoord,
          yCoord = _ref9.yCoord,
          _ref9$labelX = _ref9.labelX,
          labelX = _ref9$labelX === void 0 ? "" : _ref9$labelX,
          _ref9$labelY = _ref9.labelY,
          labelY = _ref9$labelY === void 0 ? "" : _ref9$labelY,
          width = _ref9.width;
      return function (g) {
        g.attr('class', 'mouse-focus-label');
        var rect = g.select(".mouse-focus-label-rect");
        var text = g.select(".mouse-focus-label-text");
        var y = text.select(".mouse-focus-label-y");
        var x = text.select(".mouse-focus-label-x");
        if (!rect.node()) rect = g.append("svg:rect");
        if (!text.node()) text = g.append("svg:text");
        if (!y.node()) y = text.append("svg:tspan");
        if (!x.node()) x = text.append("svg:tspan");
        y.text(labelY);
        x.text(labelX); // Sets focus-label-text position to the left / right of the mouse-focus-line

        var xAlign = 0;
        var yAlign = 0;
        var bbox = {
          width: 0,
          height: 0
        };

        try {
          bbox = text.node().getBBox();
        } catch (e) {
          return g;
        }

        if (xCoord) xAlign = xCoord + (xCoord < width / 2 ? 10 : -bbox.width - 10);
        if (yCoord) yAlign = Math.max(yCoord - bbox.height, L.Browser.webkit ? 0 : -Infinity);
        rect.attr("class", "mouse-focus-label-rect").attr("x", xAlign - 5).attr("y", yAlign - 5).attr("width", bbox.width + 10).attr("height", bbox.height + 10).attr("rx", 3).attr("ry", 3);
        text.attr("class", "mouse-focus-label-text").style("font-weight", "700").attr("y", yAlign);
        y.attr("class", "mouse-focus-label-y").attr("dy", "1em");
        x.attr("class", "mouse-focus-label-x").attr("dy", "2em");
        text.selectAll('tspan').attr("x", xAlign);
        return g;
      };
    };
    var Ruler = function Ruler(_ref10) {
      var height = _ref10.height,
          width = _ref10.width;
      return function (g) {
        g.data([{
          "x": 0,
          "y": height
        }]).attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
        var rect = g.selectAll('.horizontal-drag-rect').data([{
          w: width
        }]);
        var line = g.selectAll('.horizontal-drag-line').data([{
          w: width
        }]);
        var label = g.selectAll('.horizontal-drag-label').data([{
          w: width - 8
        }]);
        var symbol = g.selectAll('.horizontal-drag-symbol').data([{
          "type": d3.symbolTriangle,
          "x": width + 7,
          "y": 0,
          "angle": -90,
          "size": 50
        }]);
        rect.exit().remove();
        line.exit().remove();
        label.exit().remove();
        symbol.exit().remove();
        rect.enter().append("svg:rect").attr("class", "horizontal-drag-rect").attr("x", 0).attr("y", -8).attr("height", 8).attr('fill', 'none').attr('pointer-events', 'all').merge(rect).attr("width", function (d) {
          return d.w;
        });
        line.enter().append("svg:line").attr("class", "horizontal-drag-line").attr("x1", 0).merge(line).attr("x2", function (d) {
          return d.w;
        });
        label.enter().append("svg:text").attr("class", "horizontal-drag-label").attr("text-anchor", "end").attr("y", -8).merge(label).attr("x", function (d) {
          return d.w;
        });
        symbol.enter().append("svg:path").attr("class", "horizontal-drag-symbol").merge(symbol).attr("d", d3.symbol().type(function (d) {
          return d.type;
        }).size(function (d) {
          return d.size;
        })).attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ") rotate(" + d.angle + ")";
        });
        return g;
      };
    };
    var Domain = function Domain(_ref11) {
      var min = _ref11.min,
          max = _ref11.max,
          attr = _ref11.attr,
          name = _ref11.name,
          forceBounds = _ref11.forceBounds,
          scale = _ref11.scale;
      return function (data) {
        attr = attr || name;
        if (scale && scale.attr) attr = scale.attr;
        var domain = data && data.length ? d3.extent(data, function (d) {
          return d[attr];
        }) : [0, 1];

        if (typeof min !== "undefined" && (min < domain[0] || forceBounds)) {
          domain[0] = min;
        }

        if (typeof max !== "undefined" && (max > domain[1] || forceBounds)) {
          domain[1] = max;
        }

        return domain;
      };
    };
    var Range = function Range(_ref12) {
      var axis = _ref12.axis;
      return function (width, height) {
        if (axis == 'x') return [0, width];else if (axis == 'y') return [height, 0];
      };
    };
    var Scale = function Scale(_ref13) {
      var data = _ref13.data,
          attr = _ref13.attr,
          min = _ref13.min,
          max = _ref13.max,
          forceBounds = _ref13.forceBounds,
          range = _ref13.range;
      return d3.scaleLinear().range(range).domain(Domain({
        min: min,
        max: max,
        attr: attr,
        forceBounds: forceBounds
      })(data));
    };
    var Bisect = function Bisect(_ref14) {
      var _ref14$data = _ref14.data,
          data = _ref14$data === void 0 ? [0, 1] : _ref14$data,
          scale = _ref14.scale,
          x = _ref14.x,
          attr = _ref14.attr;
      return d3.bisector(function (d) {
        return d[attr];
      }).left(data, scale.invert(x));
    };
    var Chart = function Chart(_ref15) {
      var width = _ref15.width,
          height = _ref15.height,
          _ref15$margins = _ref15.margins,
          margins = _ref15$margins === void 0 ? {} : _ref15$margins,
          ruler = _ref15.ruler;

      var _width = width - margins.left - margins.right;

      var _height = height - margins.top - margins.bottom; // SVG Container


      var svg = d3.create("svg:svg").attr("class", "background"); // SVG Groups

      var g = svg.append("g");
      var panes = {
        grid: g.append("g").attr("class", "grid"),
        area: g.append('g').attr("class", "area"),
        point: g.append('g').attr("class", "point"),
        axis: g.append('g').attr("class", "axis"),
        brush: g.append("g").attr("class", "brush"),
        tooltip: g.append("g").attr("class", "tooltip").attr('display', 'none'),
        ruler: g.append('g').attr('class', 'ruler'),
        legend: g.append('g').attr("class", "legend")
      }; // SVG Paths

      var clipPath = panes.area.append("svg:clipPath").attr("id", 'elevation-clipper');
      var clipRect = clipPath.append("svg:rect"); // Canvas Paths

      var foreignObject = panes.area.append('svg:foreignObject');
      var canvas = foreignObject.append('xhtml:canvas').attr('class', 'canvas-plot');
      var context = canvas.node().getContext('2d'); // Mouse Focus

      var dragG = panes.ruler;
      var focusG = panes.tooltip;
      var brushG = panes.brush;
      focusG.append('svg:line').call(MouseFocusLine({
        xCoord: 0,
        height: _height
      }));
      focusG.append("g").call(MouseFocusLabel({
        xCoord: 0,
        yCoord: 0,
        height: _height,
        width: _width,
        labelX: "",
        labelY: ""
      })); // Add the brushing

      var brush = d3.brushX().on('start.cursor end.cursor brush.cursor', function () {
        return brushG.select(".overlay").attr('cursor', null);
      }); // Scales

      var scale = function scale(opts) {
        return {
          x: Scale(opts.x),
          y: Scale(opts.y)
        };
      };

      var utils = {
        clipPath: clipPath,
        canvas: canvas,
        context: context,
        dragG: dragG,
        focusG: focusG,
        brush: brush
      };
      var chart = {
        svg: svg,
        g: g,
        panes: panes,
        utils: utils,
        scale: scale
      }; // Resize

      chart._resize = function (_ref16) {
        var width = _ref16.width,
            height = _ref16.height,
            _ref16$margins = _ref16.margins,
            margins = _ref16$margins === void 0 ? {} : _ref16$margins,
            ruler = _ref16.ruler;

        var _width = width - margins.left - margins.right;

        var _height = height - margins.top - margins.bottom;

        svg.attr("viewBox", "0 0 ".concat(width, " ").concat(height)).attr("width", width).attr("height", height);
        g.attr("transform", "translate(" + margins.left + "," + margins.top + ")");
        clipRect.attr("x", 0).attr("y", 0).attr("width", _width).attr("height", _height);
        foreignObject.attr('width', _width).attr('height', _height);
        canvas.attr('width', _width).attr('height', _height);

        if (ruler) {
          dragG.call(Ruler({
            height: _height,
            width: _width
          }));
        }

        brushG.call(brush.extent([[0, 0], [_width, _height]]));
        brushG.select(".overlay").attr('cursor', null);
        chart._width = _width;
        chart._height = _height;
        chart.svg.dispatch('resize', {
          detail: {
            width: _width,
            height: _height
          }
        });
      };

      chart.pane = function (name) {
        if (!panes[name]) {
          panes[name] = g.append('g').attr("class", name);
        }

        return panes[name];
      };

      chart.get = function (name) {
        return utils[name];
      };

      chart._resize({
        width: width,
        height: height,
        margins: margins
      });

      return chart;
    };

    var D3 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Colors: Colors,
        Area: Area,
        Path: Path,
        Axis: Axis,
        Grid: Grid,
        HeightFocusLine: HeightFocusLine,
        HeightFocusLabel: HeightFocusLabel,
        HeightFocusMarker: HeightFocusMarker,
        LegendItem: LegendItem,
        MouseFocusLine: MouseFocusLine,
        MouseFocusLabel: MouseFocusLabel,
        Ruler: Ruler,
        Domain: Domain,
        Range: Range,
        Scale: Scale,
        Bisect: Bisect,
        Chart: Chart
    });

    var Chart$1 = L.Class.extend({
      includes: L.Evented ? L.Evented.prototype : L.Mixin.Events,
      initialize: function initialize(opts, control) {
        this.options = opts;
        this.control = control;
        this._data = []; // cache registered components

        this._props = {
          scales: {},
          paths: {},
          areas: {},
          grids: {},
          axes: {},
          legendItems: {},
          focusLabels: {}
        };
        this._scales = {};
        this._domains = {};
        this._ranges = {};
        this._paths = {};
        this._brushEnabled = opts.dragging;
        this._zoomEnabled = opts.zooming;

        if (opts.imperial) {
          this._xLabel = "mi";
          this._yLabel = "ft";
        } else {
          this._xLabel = opts.xLabel;
          this._yLabel = opts.yLabel;
        }

        var chart = this._chart = Chart(opts); // SVG Container

        var svg = this._container = chart.svg; // Panes

        this._grid = chart.pane('grid');
        this._area = chart.pane('area');
        this._point = chart.pane('point');
        this._axis = chart.pane('axis');
        this._legend = chart.pane('legend'); // Scales

        this._initScale(); // Helpers


        this._clipPath = chart.get('clipPath');
        this._canvas = chart.get('canvas');
        this._context = chart.get('context');
        this._dragG = chart.get('dragG');
        this._focusG = chart.get('focusG');
        this._brush = chart.get('brush'); // Tooltip

        this._focusline = this._focusG.select('.mouse-focus-line');
        this._focuslabel = this._focusG.select('.mouse-focus-label');
        this._zoom = d3.zoom();
        this._drag = d3.drag(); // Interactions

        this._initInteractions(); // svg.on('resize', (e)=>console.log(e.detail));

      },
      update: function update(props) {
        if (props) {
          if (props.data) this._data = props.data;
          if (props.options) this.options = props.options;
        }

        this._updateScale();

        this._updateArea();

        this._updateAxis();

        this._updateLegend();

        this._updateClipper();

        return this;
      },
      render: function render() {
        var _this = this;

        return function (container) {
          return container.append(function () {
            return _this._container.node();
          });
        };
      },
      clear: function clear() {
        this._resetDrag();

        this._area.selectAll('path').attr("d", "M0 0");

        this._context.clearRect(0, 0, this._width(), this._height());

        if (this._path) ;
      },
      _drawPath: function _drawPath(name) {
        var opts = this.options;
        var ctx = this._context;
        var path = this._paths[name];
        var area = this._props.areas[name];
        var node = path.node();
        var scaleX = this._scales[area.scaleX];
        var scaleY = this._scales[area.scaleY];
        area = L.extend({}, area, {
          width: this._width(),
          height: this._height(),
          scaleX: scaleX,
          scaleY: scaleY
        });

        if (!scaleY || !scaleY) {
          return console.warn('Unable to render path:' + name);
        }

        path.datum(this._data).attr("d", Area(area));
        if (path.classed('leaflet-hidden')) return;

        if (opts.preferCanvas) {
          path.classed('canvas-path', true);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          var p = new Path2D(path.attr('d'));
          ctx.strokeStyle = path.attr('stroke');
          ctx.fillStyle = path.attr('fill');
          ctx.lineWidth = 1.25;
          ctx.globalCompositeOperation = 'source-over'; // stroke opacity

          ctx.globalAlpha = path.attr('stroke-opacity') || 0.3;
          ctx.stroke(p); // fill opacity

          ctx.globalAlpha = path.attr('fill-opacity') || 0.45;
          ctx.fill(p);
          ctx.globalAlpha = 1;
          ctx.closePath();
        } else {
          this._area.append(function () {
            return node;
          });
        }
      },
      _hasActiveLayers: function _hasActiveLayers() {
        var paths = this._paths;

        for (var i in paths) {
          if (!paths[i].classed('leaflet-hidden')) {
            return true;
          }
        }

        return false;
      },

      /**
       * Initialize "d3-brush".
       */
      _initBrush: function _initBrush(e) {
        var _this2 = this;

        var brush = function brush(e) {
          var extent = e.selection;

          if (extent) {
            var start = _this2._findIndexForXCoord(extent[0]);

            var end = _this2._findIndexForXCoord(extent[1]);

            _this2.fire('dragged', {
              dragstart: _this2._data[start],
              dragend: _this2._data[end]
            });
          }
        };

        var focus = function focus(e) {
          if (e.type == 'brush' && !e.sourceEvent) return;

          var rect = _this2._chart.panes.brush.select('.overlay').node();

          var coords = d3.pointers(e, rect)[0];
          var xCoord = coords[0];

          var item = _this2._data[_this2._findIndexForXCoord(xCoord)];

          _this2.fire("mouse_move", {
            item: item,
            xCoord: xCoord
          });
        };

        this._brush.filter(function (e) {
          return _this2._brushEnabled && !e.shiftKey && !e.button;
        }).on("end.update", brush).on("brush.update", focus);

        this._chart.panes.brush.on("mouseenter.focus touchstart.focus", this.fire.bind(this, "mouse_enter")).on("mouseout.focus touchend.focus", this.fire.bind(this, "mouse_out")).on("mousemove.focus touchmove.focus", focus);
      },

      /**
       * Initialize "d3-zoom"
       */
      _initClipper: function _initClipper() {
        var _this3 = this;

        var svg = this._container;
        var margin = this.options.margins;
        var zoom = this._zoom;

        var onStart = function onStart(e) {
          if (e.sourceEvent && e.sourceEvent.type == "mousedown") svg.style('cursor', 'grabbing');

          if (e.transform.k == 1 && e.transform.x == 0) {
            _this3._container.classed('zoomed', true);
          }

          _this3.zooming = true;
        };

        var onEnd = function onEnd(e) {
          if (e.transform.k == 1 && e.transform.x == 0) {
            _this3._container.classed('zoomed', false);
          }

          _this3.zooming = false;
          svg.style('cursor', '');
        };

        var onZoom = function onZoom(e) {
          // TODO: find a faster way to redraw the chart.
          _this3.zooming = false;

          _this3._updateScale(); // hacky way for restoring x scale when zooming out


          _this3.zooming = true;
          _this3._scales.distance = _this3._x = e.transform.rescaleX(_this3._x); // calculate x scale at zoom level

          _this3._resetDrag();

          if (e.sourceEvent && e.sourceEvent.type == "mousemove") {
            _this3._hideDiagramIndicator();
          }

          _this3.fire('zoom');
        };

        zoom.scaleExtent([1, 10]).extent([[margin.left, 0], [this._width() - margin.right, this._height()]]).translateExtent([[margin.left, -Infinity], [this._width() - margin.right, Infinity]]).filter(function (e) {
          return _this3._zoomEnabled && (e.shiftKey || e.buttons == 4);
        }).on("start", onStart).on("end", onEnd).on("zoom", onZoom);
        svg.call(zoom); // add zoom functionality to "svg" group
        // d3.select("body").on("keydown.grabzoom keyup.grabzoom", (e) => svg.style('cursor', e.shiftKey ? 'move' : ''));
      },
      _initInteractions: function _initInteractions() {
        this._initBrush();

        this._initRuler();

        this._initClipper();

        this._initLegend();
      },

      /**
       * Toggle chart data on legend click
       */
      _initLegend: function _initLegend() {
        var _this4 = this;

        this._container.on('legend_clicked', function (e) {
          var _e$detail = e.detail,
              path = _e$detail.path,
              legend = _e$detail.legend,
              name = _e$detail.name,
              enabled = _e$detail.enabled;
          if (!path) return;

          var label = select('text', legend);

          var rect = select('rect', legend);

          toggleStyle(label, 'text-decoration-line', 'line-through', enabled);

          toggleStyle(rect, 'fill-opacity', '0', enabled);

          toggleClass(path, 'leaflet-hidden', enabled);

          _this4._updateArea();

          _this4.fire("elepath_toggle", {
            path: path,
            name: name,
            legend: legend,
            enabled: enabled
          });
        });
      },

      /**
       * Initialize "ruler".
       */
      _initRuler: function _initRuler() {
        var _this5 = this;

        if (!this.options.ruler) return; // const yMax      = this._height();

        var formatNum = d3.format(".0f");
        var drag = this._drag;

        var label = function label(e, d) {
          var yMax = _this5._height();

          var y = _this5._dragG.data()[0].y;

          if (y >= yMax || y <= 0) _this5._dragG.select(".horizontal-drag-label").text('');

          _this5._hideDiagramIndicator();
        };

        var position = function position(e, d) {
          var yMax = _this5._height();

          var yCoord = d3.pointers(e, _this5._area.node())[0][1];
          var y = yCoord > 0 ? yCoord < yMax ? yCoord : yMax : 0;

          var z = _this5._y.invert(y);

          var data = L.extend(_this5._dragG.data()[0], {
            y: y
          });

          _this5._dragG.data([data]).attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
          }).classed('active', y < yMax);

          _this5._container.select(".horizontal-drag-label").text(formatNum(z) + " " + _this5._yLabel);

          _this5.fire('ruler_filter', {
            coords: yCoord < yMax && yCoord > 0 ? _this5._findCoordsForY(yCoord) : []
          });
        };

        drag.on("start end", label).on("drag", position);

        this._dragG.call(drag);
      },

      /**
       * Initialize x and y scales
       */
      _initScale: function _initScale() {
        var opts = this.options;

        this._registerAxisScale({
          axis: 'x',
          position: 'bottom',
          attr: opts.xAttr,
          min: opts.xAxisMin,
          max: opts.xAxisMax,
          name: 'distance'
        });

        this._registerAxisScale({
          axis: 'y',
          position: 'left',
          attr: opts.yAttr,
          min: opts.yAxisMin,
          max: opts.yAxisMax,
          name: 'altitude'
        });

        this._x = this._scales.distance;
        this._y = this._scales.altitude;
      },
      _registerAreaPath: function _registerAreaPath(props) {
        var opts = this.options;
        if (!props.xAttr) props.xAttr = opts.xAttr;
        if (!props.yAttr) props.yAttr = opts.yAttr;
        if (typeof props.preferCanvas === "undefined") props.preferCanvas = opts.preferCanvas;
        var path = Path(props); // Save paths in memory for latter usage

        this._paths[props.name] = path;
        this._props.areas[props.name] = props;

        if (opts.legend) {
          this._props.legendItems[props.name] = {
            name: props.name,
            label: props.label,
            color: props.color,
            path: path
          };
        }
      },
      _registerAxisGrid: function _registerAxisGrid(props) {
        this._props.grids[props.name || props.axis] = props;
      },
      _registerAxisScale: function _registerAxisScale(props) {
        var opts = this.options;
        var scale = props.scale;

        if (typeof scale !== 'function') {
          scale = L.extend({
            data: this._data,
            forceBounds: opts.forceAxisBounds
          }, scale);
          scale.attr = scale.attr || props.name;
          var domain = this._domains[props.name] = Domain(props);
          var range = this._ranges[props.name] = Range(props);
          scale.range = scale.range || range(this._width(), this._height());
          scale.domain = scale.domain || domain(this._data);
          this._props.scales[props.name] = scale;
          props.scale = this._scales[props.name] = Scale(scale);
        }

        if (!props.ticks) {
          if (props.axis == 'x') props.ticks = opts.xTicks;else if (props.axis == 'y') props.ticks = opts.yTicks;
        }

        this._props.axes[props.name] = props;
        return scale;
      },

      /**
       * Add a waypoint of interest over the chart
       */
      _registerCheckPoint: function _registerCheckPoint(point) {
        if (!this._data.length) return;
        var item, x, y;

        if (point.latlng) {
          item = this._data[this._findIndexForLatLng(point.latlng)];
          x = this._x(item.dist);
          y = this._y(item.z);
        } else if (!isNaN(point.dist)) {
          x = this._x(point.dist);
          item = this._data[this._findIndexForXCoord(x)];
          y = this._y(item.z);
        } else if (isNaN(x) || isNaN(y)) return;

        if (!point.item || !point.item.property('isConnected')) {
          point.position = point.position || "bottom";
          point.item = this._point.append('g');
          point.item.append("svg:line").attr("y1", 0).attr("x1", 0).attr("style", "stroke: rgb(51, 51, 51); stroke-width: 0.5; stroke-dasharray: 2, 2;");
          point.item.append("svg:circle").attr("class", " height-focus circle-lower").attr("r", 3);

          if (point.label) {
            point.item.append("svg:text").attr("dx", "4px").attr("dy", "-4px");
          }
        }

        point.item.datum({
          pos: point.position,
          x: x,
          y: y
        }).attr("class", function (d) {
          return "point " + d.pos;
        }).attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
        point.item.select('line').datum({
          y2: {
            'top': -y,
            'bottom': this._height() - y
          }[point.position],
          x2: {
            'left': -x,
            'right': this._width() - x
          }[point.position] || 0
        }).attr("y2", function (d) {
          return d.y2;
        }).attr("x2", function (d) {
          return d.x2;
        });

        if (point.label) {
          point.item.select('text').text(point.label);
        }
      },
      _registerFocusLabel: function _registerFocusLabel(props) {
        this._props.focusLabels[props.name] = props;
      },
      _updateArea: function _updateArea() {
        var paths = this._paths; // Reset and update chart profiles

        this._context.clearRect(0, 0, this._width(), this._height());

        for (var i in paths) {
          if (!paths[i].classed('leaflet-hidden')) {
            this._drawPath(i);
          }
        }
      },
      _updateAxis: function _updateAxis() {
        var opts = this.options; // Reset chart axis.

        this._grid.selectAll('g').remove();

        this._axis.selectAll('g').remove();

        var grids = this._props.grids;
        var axes = this._props.axes;
        var props, axis, grid;
        var gridOpts = {
          width: this._width(),
          height: this._height(),
          tickFormat: ""
        };
        var axesOpts = {
          width: this._width(),
          height: this._height()
        }; // Render grids

        for (var i in grids) {
          props = L.extend({}, gridOpts, grids[i]);
          grid = Grid(props);

          this._grid.call(grid);
        } // Render axis


        for (var _i in axes) {
          if (opts[_i] === false || opts[_i] === 'summary') continue;
          props = L.extend({}, axesOpts, axes[_i]);
          axis = Axis(props);

          this._axis.call(axis);
        } // Adjust axis scale positions


        this._axis.selectAll('.y.axis.right').each(function (d, i, n) {
          var axis = d3.select(n[i]);
          var transform = axis.attr('transform');
          var translate = transform.substring(transform.indexOf("(") + 1, transform.indexOf(")")).split(",");
          axis.attr('transform', 'translate(' + (+translate[0] + i * 40) + ',' + translate[1] + ')');

          if (i > 0) {
            axis.select(':scope > path').attr('opacity', 0.25);
            axis.selectAll(':scope > .tick line').attr('opacity', 0.75);
          }
        });
      },
      _updateClipper: function _updateClipper() {
        var margin = this.options.margins;

        this._zoom.scaleExtent([1, 10]).extent([[margin.left, 0], [this._width() - margin.right, this._height()]]).translateExtent([[margin.left, -Infinity], [this._width() - margin.right, Infinity]]);
      },
      _updateLegend: function _updateLegend() {
        var _this6 = this;

        if (this.options.legend == false) return;
        var legends = this._props.legendItems;
        var legend; // Reset legend items

        this._legend.selectAll('g').remove();

        for (var i in legends) {
          legend = LegendItem(L.extend({
            width: this._width(),
            height: this._height(),
            margins: this.options.margins
          }, legends[i]));

          this._legend.append("g").call(legend);
        } // Get legend items


        var items = this._legend.selectAll('.legend-item'); // Calculate legend item positions


        var n = items.nodes().length;
        var v = Array(Math.floor(n / 2)).fill(null).map(function (d, i) {
          return (i + 1) * 2 - (1 - Math.sign(n % 2));
        });
        var rev = v.slice().reverse().map(function (d) {
          return -d;
        });

        if (n % 2 !== 0) {
          rev.push(0);
        }

        v = rev.concat(v); // Get chart margins

        var xAxesB = this._axis.selectAll('.x.axis.bottom').nodes().length;

        var marginB = 30 + xAxesB * 2;
        var marginR = n * 30; // Adjust chart right margins

        if (n && this.options.margins.right < marginR) {
          this.options.margins.right = marginR;
          this.fire('margins_updated');
        } // Adjust chart bottom margins


        if (xAxesB && this.options.margins.bottom < marginB) {
          this.options.margins.bottom = marginB;
          this.fire('margins_updated');
        }

        items.each(function (d, i, n) {
          var legend = d3.select(n[i]);
          var rect = legend.select('rect');
          var name = legend.attr('data-name');
          var path = _this6._paths[name];
          var tx = v[i] * 55;
          var ty = xAxesB * 2;
          legend // Adjust legend item positions
          .attr("transform", "translate(" + tx + ", " + ty + ")"); // Set initial state (disabled controls)

          if (name in _this6.options && _this6.options[name] == 'disabled') {
            path.classed('leaflet-hidden', true);
            legend.select('text').style('text-decoration-line', 'line-through');
            legend.select('rect').style('fill-opacity', '0');
          } // Apply d3-zoom (bind <clipPath> mask)


          if (_this6._clipPath) {
            path.attr('clip-path', 'url(#' + _this6._clipPath.attr('id') + ')');
          }
        });
      },
      _updateScale: function _updateScale() {
        if (this.zooming) return {
          x: this._x,
          y: this._y
        };
        var opts = this.options;
        var scales = this._scales;
        var d = this._domains;
        var r = this._ranges;

        for (var i in scales) {
          scales[i].domain(d[i](this._data)).range(r[i](this._width(), this._height()));
        }

        return {
          x: this._x,
          y: this._y
        };
      },

      /**
       * Calculates chart width.
       */
      _width: function _width() {
        return this._chart._width;
      },

      /**
       * Calculates chart height.
       */
      _height: function _height() {
        return this._chart._height;
      },

      /*
       * Finds data entries above a given y-elevation value and returns geo-coordinates
       */
      _findCoordsForY: function _findCoordsForY(y) {
        var data = this._data;

        var z = this._y.invert(y); // save indexes of elevation values above the horizontal line


        var list = data.reduce(function (array, item, index) {
          if (item.z >= z) array.push(index);
          return array;
        }, []);
        var start = 0;
        var next; // split index list into blocks of coordinates

        var coords = list.reduce(function (array, _, curr) {
          next = curr + 1;

          if (list[next] !== list[curr] + 1 || next === list.length) {
            array.push(list.slice(start, next).map(function (i) {
              return data[i].latlng;
            }));
            start = next;
          }

          return array;
        }, []);
        return coords;
      },

      /*
       * Finds a data entry for a given x-coordinate of the diagram
       */
      _findIndexForXCoord: function _findIndexForXCoord(x) {
        var _this7 = this;

        return d3.bisector(function (d) {
          return d[_this7.options.xAttr];
        }).left(this._data || [0, 1], this._x.invert(x));
      },

      /*
       * Finds a data entry for a given latlng of the map
       */
      _findIndexForLatLng: function _findIndexForLatLng(latlng) {
        var result = null;
        var d = Infinity;

        this._data.forEach(function (item, index) {
          var dist = latlng.distanceTo(item.latlng);

          if (dist < d) {
            d = dist;
            result = index;
          }
        });

        return result;
      },

      /*
       * Removes the drag rectangle and zoms back to the total extent of the data.
       */
      _resetDrag: function _resetDrag() {
        if (this._chart.panes.brush.select(".selection").attr('width')) {
          this._chart.panes.brush.call(this._brush.clear);

          this._hideDiagramIndicator();

          this.fire('reset_drag');
        }
      },
      _resetZoom: function _resetZoom() {
        if (this._zoom) {
          this._zoom.transform(this._chart.svg, d3.zoomIdentity);
        }
      },

      /**
       * Display distance and altitude level ("focus-rect").
       */
      _showDiagramIndicator: function _showDiagramIndicator(item, xCoordinate) {
        var opts = this.options;

        var yCoordinate = this._y(item[opts.yAttr]);

        this._focusG.attr("display", null);

        this._focusline.call(MouseFocusLine({
          xCoord: xCoordinate,
          height: this._height()
        }));

        this._focuslabel.call(MouseFocusLabel({
          xCoord: xCoordinate,
          yCoord: yCoordinate,
          height: this._height(),
          width: this._width(),
          labelX: d3.format("." + opts.decimalsX + "f")(item[opts.xAttr]) + " " + this._xLabel,
          labelY: d3.format("." + opts.decimalsY + "f")(item[opts.yAttr]) + " " + this._yLabel
        })); // this._focuslabel.selectAll('tspan').data(Object.values(this._focuslabels));


        var labels = this._props.focusLabels;

        var tooltip = this._focuslabel.select('text');

        var label;

        for (var i in labels) {
          label = tooltip.select(".mouse-focus-label-" + labels[i].name);

          if (!label.size()) {
            label = tooltip.append("svg:tspan", ".mouse-focus-label-x").attr("class", "mouse-focus-label-" + labels[i].name).attr("dy", "1.5em");
          }

          label.text(typeof labels[i].value !== "function" ? labels[i].value : labels[i].value(item));

          this._focuslabel.select('.mouse-focus-label-x').attr("dy", "1.5em");
        }
      },
      _hideDiagramIndicator: function _hideDiagramIndicator() {
        this._focusG.attr("display", 'none');
      }
    });

    var Marker = L.Class.extend({
      initialize: function initialize(options) {
        this.options = options;

        if (this.options.imperial) {
          this._xLabel = "mi";
          this._yLabel = "ft";
        } else {
          this._xLabel = this.options.xLabel;
          this._yLabel = this.options.yLabel;
        }

        if (this.options.marker == 'elevation-line') {
          // this._container = d3.create("g").attr("class", "height-focus-group");
          this._focusline = d3.create('svg:line');
          this._focusmarker = d3.create("svg:circle");
          this._focuslabel = d3.create("svg:text");
        } else if (this.options.marker == 'position-marker') {
          // this._marker   = L.circleMarker([0, 0], { pane: 'overlayPane', radius: 6, fillColor: '#fff', fillOpacity:1, color: '#000', weight:1, interactive: false });
          this._marker = L.marker([0, 0], {
            icon: this.options.markerIcon,
            zIndexOffset: 1000000,
            interactive: false
          });
        }

        this._focuslabels = {};
        return this;
      },
      addTo: function addTo(map) {
        var _this = this;

        this._map = map;

        if (this.options.marker == 'elevation-line') {
          var g = this._container = d3.select(map.getPane('elevationPane')).select("svg > g").attr("class", "height-focus-group");
          g.append(function () {
            return _this._focusline.node();
          });
          g.append(function () {
            return _this._focusmarker.node();
          });
          g.append(function () {
            return _this._focuslabel.node();
          });
        } else if (this.options.marker == 'position-marker') {
          this._marker.addTo(map, {
            pane: 'overlayPane'
          });
        }

        return this;
      },

      /**
       * Update position marker ("leaflet-marker").
       */
      update: function update(props) {
        if (props) this._props = props;else props = this._props;
        if (!props) return;
        if (props.options) this.options = props.options;
        if (!this._map) this.addTo(props.map);
        var opts = this.options;
        var map = this._map;
        this._latlng = props.item.latlng;
        var pos = map.latLngToLayerPoint(this._latlng);

        if (map._rotate) {
          pos = map.rotatedPointToMapPanePoint(pos);
        }

        var point = L.extend({}, props.item, pos);

        if (this.options.marker == 'elevation-line') {
          var normalizedAlt = this._height() / props.maxElevation * point.z;
          var normalizedY = point.y - normalizedAlt;

          this._container.classed("leaflet-hidden", false);

          this._focusmarker.call(HeightFocusMarker({
            theme: opts.theme,
            xCoord: point.x,
            yCoord: point.y
          }));

          this._focusline.call(HeightFocusLine({
            theme: opts.theme,
            xCoord: point.x,
            yCoord: point.y,
            length: normalizedY
          }));

          this._focuslabel.call(HeightFocusLabel({
            theme: opts.theme,
            xCoord: point.x,
            yCoord: normalizedY,
            label: d3.format("." + opts.decimalsY + "f")(point[opts.yAttr]) + " " + this._yLabel
          }));

          var labels = this._focuslabels;
          var tooltip = this._focuslabel;
          var label;

          for (var i in labels) {
            label = tooltip.select(".height-focus-" + labels[i].name);

            if (!label.size()) {
              label = tooltip.append("svg:tspan").attr("class", "height-focus-" + labels[i].name).attr("dy", "1.5em");
            }

            label.text(typeof labels[i].value !== "function" ? labels[i].value : labels[i].value(props.item));

            this._focuslabel.select('.height-focus-y').attr("dy", "-1.5em");
          }
        } else if (this.options.marker == 'position-marker') {
          removeClass(this._marker.getElement(), 'leaflet-hidden');

          this._marker.setLatLng(this._latlng);
        }
      },

      /*
       * Hides the position/height indicator marker drawn onto the map
       */
      remove: function remove() {
        this._props = null;

        if (this.options.marker == 'elevation-line') {
          if (this._container) this._container.classed("leaflet-hidden", true);
        } else if (this.options.marker == 'position-marker') {
          addClass(this._marker.getElement(), 'leaflet-hidden');
        }
      },
      getLatLng: function getLatLng() {
        return this._latlng;
      },

      /**
       * Calculates chart height.
       */
      _height: function _height() {
        var opts = this.options;
        return opts.height - opts.margins.top - opts.margins.bottom;
      },
      _registerFocusLabel: function _registerFocusLabel(props) {
        this._focuslabels[props.name] = props;
      }
    });

    var Summary = L.Class.extend({
      initialize: function initialize(opts, control) {
        this.options = opts;
        this.control = control;

        var summary = this._container = create("div", "elevation-summary " + (opts.summary ? opts.summary + "-summary" : ''));

        style(summary, 'max-width', opts.width ? opts.width + 'px' : '');
      },
      render: function render() {
        var _this = this;

        return function (container) {
          return container.append(function () {
            return _this._container;
          });
        };
      },
      reset: function reset() {
        this._container.innerHTML = '';
      },
      append: function append(className, label, value) {
        this._container.innerHTML += "<span class=\"".concat(className, "\"><span class=\"summarylabel\">").concat(label, "</span><span class=\"summaryvalue\">").concat(value, "</span></span>");
        return this;
      },
      _registerSummary: function _registerSummary(data) {
        for (var i in data) {
          this.append(i, L._(data[i].label), typeof data[i].value !== "function" ? data[i].value : data[i].value(this.control.track_info));
        }
      }
    });

    var Options = {
      autofitBounds: true,
      autohide: !L.Browser.mobile,
      autohideMarker: true,
      almostover: true,
      altitude: true,
      collapsed: false,
      detached: true,
      distance: true,
      distanceFactor: 1,
      distanceMarkers: false,
      decimalsX: 2,
      decimalsY: 0,
      dragging: !L.Browser.mobile,
      downloadLink: 'link',
      elevationDiv: "#elevation-div",
      followMarker: true,
      forceAxisBounds: false,
      gpxOptions: {
        async: true,
        marker_options: {
          startIconUrl: null,
          endIconUrl: null,
          shadowUrl: null,
          wptIcons: {
            '': L.divIcon({
              className: 'elevation-waypoint-marker',
              html: '<i class="elevation-waypoint-icon"></i>',
              iconSize: [30, 30],
              iconAnchor: [8, 30]
            })
          }
        }
      },
      height: 200,
      heightFactor: 1,
      imperial: false,
      interpolation: "curveLinear",
      lazyLoadJS: true,
      legend: true,
      loadData: {
        defer: false,
        lazy: false
      },
      margins: {
        top: 30,
        right: 30,
        bottom: 30,
        left: 40
      },
      marker: 'elevation-line',
      markerIcon: L.divIcon({
        className: 'elevation-position-marker',
        html: '<i class="elevation-position-icon"></i>',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      }),
      placeholder: false,
      position: "topright",
      polyline: {
        className: 'elevation-polyline',
        color: '#000',
        opacity: 0.75,
        weight: 5,
        lineCap: 'round'
      },
      polylineSegments: {
        className: 'elevation-polyline-segments',
        color: '#F00',
        interactive: false
      },
      preferCanvas: false,
      reverseCoords: false,
      ruler: true,
      skipNullZCoords: false,
      theme: "lightblue-theme",
      responsive: true,
      summary: 'inline',
      slope: false,
      speed: false,
      sLimit: undefined,
      time: false,
      timeFactor: 3600,
      timeFormat: false,
      sDeltaMax: undefined,
      sInterpolation: "curveStepAfter",
      sRange: undefined,
      width: 600,
      xAttr: "dist",
      xLabel: "km",
      xTicks: undefined,
      yAttr: "z",
      yAxisMax: undefined,
      yAxisMin: undefined,
      yLabel: "m",
      yTicks: undefined,
      zFollow: false,
      zooming: !L.Browser.Mobile
    };

    var Elevation = L.Control.Elevation = L.Control.extend({
      includes: L.Evented ? L.Evented.prototype : L.Mixin.Events,
      options: Options,
      __mileFactor: 0.621371,
      __footFactor: 3.28084,
      __D3: 'https://unpkg.com/d3@6.5.0/dist/d3.min.js',
      __TOGEOJSON: 'https://unpkg.com/@tmcw/togeojson@4.3.0/dist/togeojson.umd.js',
      __LGEOMUTIL: 'https://unpkg.com/leaflet-geometryutil@0.9.3/src/leaflet.geometryutil.js',
      __LALMOSTOVER: 'https://unpkg.com/leaflet-almostover@1.0.1/src/leaflet.almostover.js',
      __LDISTANCEM: 'https://unpkg.com/@raruto/leaflet-elevation@1.6.8/libs/leaflet-distance-marker.min.js',

      /*
       * Add data to the diagram either from GPX or GeoJSON and update the axis domain and data
       */
      addData: function addData(d, layer) {
        var _this = this;

        if ((typeof layer === "undefined" || layer === null) && d.on) {
          layer = d;
        }

        Elevation._d3LazyLoader = lazyLoader(this.__D3, (typeof d3 === "undefined" ? "undefined" : _typeof(d3)) !== 'object' || !this.options.lazyLoadJS, Elevation._d3LazyLoader).then(function () {
          _this._addData(d);

          _this._addLayer(layer);

          _this._fireEvt("eledata_added", {
            data: d,
            layer: layer,
            track_info: _this.track_info
          });
        });
      },

      /**
       * Adds the control to the given map.
       */
      addTo: function addTo(map) {
        if (this.options.detached) {
          var eleDiv = this._initElevationDiv();

          if (!eleDiv.isConnected) insert(map.getContainer(), eleDiv, 'afterend');

          append(eleDiv, this.onAdd(map));
        } else {
          L.Control.prototype.addTo.call(this, map);
        }

        return this;
      },

      /*
       * Reset data and display
       */
      clear: function clear() {
        if (this._marker) this._marker.remove();
        if (this._chart) this._chart.clear();
        if (this._layers) this._layers.clearLayers();
        this._data = [];
        this.track_info = {};

        this._fireEvt("eledata_clear");
      },

      /**
       * Disable chart brushing.
       */
      disableBrush: function disableBrush() {
        this._chart._brushEnabled = false;

        this._resetDrag();
      },

      /**
       * Enable chart brushing.
       */
      enableBrush: function enableBrush() {
        this._chart._brushEnabled = true;
      },

      /**
       * Alias for enableBrush
       */
      enableDragging: function enableDragging() {
        this.enableBrushing();
      },

      /**
       * Alias for disableBrush
       */
      disableDragging: function disableDragging() {
        this.disableBrushing();
      },

      /**
       * Disable chart zooming.
       */
      disableZoom: function disableZoom() {
        this._chart._zoomEnabled = false;

        this._chart._resetZoom();
      },

      /**
       * Enable chart zooming.
       */
      enableZoom: function enableZoom() {
        this._chart._zoomEnabled = true;
      },

      /**
       * Sets a map view that contains the given geographical bounds.
       */
      fitBounds: function fitBounds(bounds) {
        bounds = bounds || this.getBounds();
        if (this._map && bounds.isValid()) this._map.fitBounds(bounds);
      },
      getBounds: function getBounds(data) {
        data = data || this._data;
        return L.latLngBounds(data.map(function (d) {
          return d.latlng;
        }));
      },

      /**
       * Get default zoom level when "followMarker" is true.
       */
      getZFollow: function getZFollow() {
        return this._zFollow;
      },

      /**
       * Hide current elevation chart profile.
       */
      hide: function hide() {
        style(this._container, "display", "none");
      },

      /**
       * Initialize chart control "options" and "container".
       */
      initialize: function initialize(options) {
        this._data = [];
        this._layers = L.featureGroup();
        this._markedSegments = L.polyline([]);
        this._chartEnabled = true, this.track_info = {};
        this.options = deepMerge({}, this.options, options);
        this._zFollow = this.options.zFollow;
        if (this.options.followMarker) this._setMapView = L.Util.throttle(this._setMapView, 300, this);
        if (this.options.placeholder) this.options.loadData.lazy = this.options.loadData.defer = true;
        if (this.options.legend) this.options.margins.bottom += 30;
        if (this.options.theme) this.options.polylineSegments.className += ' ' + this.options.theme;

        this._markedSegments.setStyle(this.options.polylineSegments); // this._resizeChart   = _.debounce(this._resizeChart,   300, this);
        // this._resizeChart = L.Util.throttle(this._resizeChart, 300, this);
        // if (L.Browser.mobile) {
        // 	this._updateChart   = _.debounce(this._updateChart,   300, this);
        // 	this._updateSummary = _.debounce(this._updateSummary, 300, this);
        // }
        // Leaflet canvas renderer colors


        L.extend(Colors, this.options.colors || {});
      },

      /**
       * Alias for loadData
       */
      load: function load(data, opts) {
        this.loadData(data, opts);
      },

      /**
       * Alias for addTo
       */
      loadChart: function loadChart(map) {
        this.addTo(map);
      },

      /**
       * Load elevation data (GPX, GeoJSON or KML).
       */
      loadData: function loadData(data, opts) {
        opts = L.extend({}, this.options.loadData, opts);

        if (opts.defer) {
          this.loadDefer(data, opts);
        } else if (opts.lazy) {
          this.loadLazy(data, opts);
        } else if (isXMLDoc(data)) {
          this.loadXML(data);
        } else if (isJSONDoc(data)) {
          this.loadGeoJSON(data);
        } else {
          this.loadFile(data);
        }
      },

      /**
       * Wait for document load before download data.
       */
      loadDefer: function loadDefer(data, opts) {
        opts = L.extend({}, this.options.loadData, opts);
        opts.defer = false;

        deferFunc(L.bind(this.loadData, this, data, opts));
      },

      /**
       * Load data from a remote url.
       */
      loadFile: function loadFile(url) {
        var _this2 = this;

        fetch(url).then(function (response) {
          return response.text();
        }).then(function (data) {
          _this2._downloadURL = url; // TODO: handle multiple urls?

          _this2.loadData(data, {
            lazy: false,
            defer: false
          });
        }).catch(function (err) {
          return console.warn(err);
        });
      },

      /**
       * Load raw GeoJSON data.
       */
      loadGeoJSON: function loadGeoJSON(data) {
        GeoJSONLoader(data, this);
      },

      /**
       * Alias for loadXML
       */
      loadGPX: function loadGPX(data) {
        this.loadXML(data);
      },

      /**
       * Load raw XML data.
       */
      loadXML: function loadXML(data) {
        var _this3 = this;

        Elevation._togeojsonLazyLoader = lazyLoader(this.__TOGEOJSON, typeof toGeoJSON !== 'function' || !this.options.lazyLoadJS, Elevation._togeojsonLazyLoader).then(function () {
          var xml = new DOMParser().parseFromString(data, "text/xml");
          var type = xml.documentElement.tagName.toLowerCase(); // "kml" or "gpx"

          if (!(type in toGeoJSON)) {
            type = xml.documentElement.tagName == "TrainingCenterDatabase" ? 'tcx' : 'gpx';
          }

          var geojson = toGeoJSON[type](xml);
          var name = xml.getElementsByTagName('name');

          if (name[0]) {
            geojson.name = name[0].innerHTML;
          } else if (_this3._downloadURL) {
            geojson.name = _this3._downloadURL.split('/').pop().split('#')[0].split('?')[0];
          }

          return _this3.loadGeoJSON(geojson, _this3);
        });
      },

      /**
       * Wait for chart container visible before download data.
       */
      loadLazy: function loadLazy(data, opts) {
        var _this4 = this;

        opts = L.extend({}, this.options.loadData, opts);
        var elem = opts.lazy.parentNode ? opts.lazy : this.placeholder;

        waitHolder(elem).then(function () {
          opts.lazy = false;

          _this4.loadData(data, opts);

          _this4.once('eledata_loaded', function () {
            return _this4.placeholder.parentNode.removeChild(elem);
          });
        });
      },

      /**
       * Create container DOM element and related event listeners.
       * Called on control.addTo(map).
       */
      onAdd: function onAdd(map) {
        var _this5 = this;

        this._map = map;

        var container = this._container = create("div", "elevation-control elevation " + this.options.theme);

        if (!this.options.detached) {
          addClass(container, 'leaflet-control');
        }

        if (this.options.placeholder && !this._data.length) {
          this.placeholder = create('img', 'elevation-placeholder', typeof this.options.placeholder === 'string' ? {
            src: this.options.placeholder,
            alt: ''
          } : this.options.placeholder);

          insert(container, this.placeholder, 'afterbegin');
        }

        Elevation._d3LazyLoader = lazyLoader(this.__D3, (typeof d3 === "undefined" ? "undefined" : _typeof(d3)) !== 'object' || !this.options.lazyLoadJS, Elevation._d3LazyLoader).then(function () {
          _this5._initButton(container);

          _this5._initChart(container);

          _this5._initSummary(container);

          _this5._initMarker(map);

          _this5._initLayer(map);

          map.on('zoom viewreset zoomanim', _this5._hideMarker, _this5).on('resize', _this5._resetView, _this5).on('resize', _this5._resizeChart, _this5).on('rotate', _this5._rotateMarker, _this5).on('mousedown', _this5._resetDrag, _this5);

          on(map.getContainer(), 'mousewheel', _this5._resetDrag, _this5);

          on(map.getContainer(), 'touchstart', _this5._resetDrag, _this5);

          _this5.on('eledata_added eledata_loaded', _this5._updateChart, _this5).on('eledata_added eledata_loaded', _this5._updateSummary, _this5);

          _this5._updateChart();

          _this5._updateSummary();
        });
        return container;
      },

      /**
       * Clean up control code and related event listeners.
       * Called on control.remove().
       */
      onRemove: function onRemove(map) {
        this._container = null;
        map.off('zoom viewreset zoomanim', this._hideMarker, this).off('resize', this._resetView, this).off('resize', this._resizeChart, this).off('mousedown', this._resetDrag, this);

        off(map.getContainer(), 'mousewheel', this._resetDrag, this);

        off(map.getContainer(), 'touchstart', this._resetDrag, this);

        this.off('eledata_added eledata_loaded', this._updateChart, this).off('eledata_added eledata_loaded', this._updateSummary, this);
      },

      /**
       * Redraws the chart control. Sometimes useful after screen resize.
       */
      redraw: function redraw() {
        this._resizeChart();
      },

      /**
       * Set default zoom level when "followMarker" is true.
       */
      setZFollow: function setZFollow(zoom) {
        this._zFollow = zoom;
      },

      /**
       * Hide current elevation chart profile.
       */
      show: function show() {
        style(this._container, "display", "block");
      },

      /*
       * Parsing data either from GPX or GeoJSON and update the diagram data
       */
      _addData: function _addData(d) {
        var _this6 = this;

        if (!d) {
          return;
        }

        var geom = d.geometry;

        if (geom) {
          switch (geom.type) {
            case 'LineString':
              this._addGeoJSONData(geom.coordinates);

              break;

            case 'MultiLineString':
              each(geom.coordinates, function (coords) {
                return _this6._addGeoJSONData(coords);
              });

              break;

            default:
              console.warn('Unsopperted GeoJSON feature geometry type:' + geom.type);
          }
        }

        if (d.type === "FeatureCollection") {
          each(d.features, function (feature) {
            return _this6._addData(feature);
          });
        }

        if (d._latlngs) {
          this._addGPXData(d._latlngs);
        }
      },

      /*
       * Parsing of GeoJSON data lines and their elevation in z-coordinate
       */
      _addGeoJSONData: function _addGeoJSONData(coords) {
        var _this7 = this;

        each(coords, function (point) {
          _this7._addPoint(point[1], point[0], point[2]);

          _this7._fireEvt("elepoint_added", {
            point: point,
            index: _this7._data.length - 1
          });
        });

        this._fireEvt("eletrack_added", {
          coords: coords,
          index: this._data.length - 1
        });
      },

      /*
       * Parsing function for GPX data and their elevation in z-coordinate
       */
      _addGPXData: function _addGPXData(coords) {
        var _this8 = this;

        each(coords, function (point) {
          _this8._addPoint(point.lat, point.lng, point.meta.ele);

          _this8._fireEvt("elepoint_added", {
            point: point,
            index: _this8._data.length - 1
          });
        });

        this._fireEvt("eletrack_added", {
          coords: coords,
          index: this._data.length - 1
        });
      },

      /*
       * Parse and push a single (x, y, z) point to current elevation profile.
       */
      _addPoint: function _addPoint(x, y, z) {
        if (this.options.reverseCoords) {
          var _ref = [y, x];
          x = _ref[0];
          y = _ref[1];
        }

        this._data.push({
          x: x,
          y: y,
          z: z,
          latlng: L.latLng(x, y, z)
        });

        this._fireEvt("eledata_updated", {
          index: this._data.length - 1
        });
      },
      _addLayer: function _addLayer(layer) {
        if (layer) this._layers.addLayer(layer);
      },

      /**
       * Adds the control to the given "detached" div.
       */
      _initElevationDiv: function _initElevationDiv() {
        var eleDiv = select(this.options.elevationDiv);

        if (!eleDiv) {
          this.options.elevationDiv = '#elevation-div_' + randomId();
          eleDiv = create('div', 'leaflet-control elevation elevation-div', {
            id: this.options.elevationDiv.substr(1)
          });
        }

        if (this.options.detached) {
          replaceClass(eleDiv, 'leaflet-control', 'elevation-detached');
        }

        this.eleDiv = eleDiv;
        return this.eleDiv;
      },

      /*
       * Collapse current chart control.
       */
      _collapse: function _collapse() {
        replaceClass(this._container, 'elevation-expanded', 'elevation-collapsed');
      },

      /*
       * Expand current chart control.
       */
      _expand: function _expand() {
        replaceClass(this._container, 'elevation-collapsed', 'elevation-expanded');
      },

      /*
       * Finds a data entry for the given LatLng
       */
      _findItemForLatLng: function _findItemForLatLng(latlng) {
        return this._data[this._chart._findIndexForLatLng(latlng)];
      },

      /*
       * Finds a data entry for the given xDiagCoord
       */
      _findItemForX: function _findItemForX(x) {
        return this._data[this._chart._findIndexForXCoord(x)];
      },

      /**
       * Fires an event of the specified type.
       */
      _fireEvt: function _fireEvt(type, data, propagate) {
        if (this.fire) this.fire(type, data, propagate);
        if (this._map) this._map.fire(type, data, propagate);
      },

      /**
       * Calculates chart height.
       */
      _height: function _height() {
        if (this._chart) return this._chart._height();
        var opts = this.options;
        return opts.height - opts.margins.top - opts.margins.bottom;
      },

      /*
       * Hides the position/height indicator marker drawn onto the map
       */
      _hideMarker: function _hideMarker() {
        if (this.options.autohideMarker) {
          this._marker.remove();
        }
      },

      /**
       * Generate "svg" chart DOM element.
       */
      _initChart: function _initChart(container) {
        var opts = this.options;
        opts.xTicks = this._xTicks();
        opts.yTicks = this._yTicks();

        if (opts.responsive) {
          if (opts.detached) {
            var _this$eleDiv = this.eleDiv,
                offsetWidth = _this$eleDiv.offsetWidth,
                offsetHeight = _this$eleDiv.offsetHeight;
            if (offsetWidth > 0) opts.width = offsetWidth;
            if (offsetHeight > 20) opts.height = offsetHeight - 20; // 20 = horizontal scrollbar size.
          } else {
            var _this$_map$getContain = this._map.getContainer(),
                clientWidth = _this$_map$getContain.clientWidth;

            opts._maxWidth = opts._maxWidth > opts.width ? opts._maxWidth : opts.width;
            this._container.style.maxWidth = opts._maxWidth + 'px';
            if (opts._maxWidth > clientWidth) opts.width = clientWidth - 30;
          }
        }

        var chart = this._chart = new Chart$1(opts, this);
        this._x = this._chart._x;
        this._y = this._chart._y;
        d3.select(container).call(chart.render());
        chart.on('reset_drag', this._hideMarker, this).on('mouse_enter', this._fireEvt.bind('elechart_enter'), this).on('dragged', this._dragendHandler, this).on('mouse_move', this._mousemoveHandler, this).on('mouse_out', this._mouseoutHandler, this).on('ruler_filter', this._rulerFilterHandler, this).on('zoom', this._updateChart, this).on('elepath_toggle', this._toggleChartHandler, this).on('margins_updated', this._resizeChart, this);

        this._fireEvt("elechart_axis");

        if (this.options.legend) this._fireEvt("elechart_legend");

        this._fireEvt("elechart_init");
      },
      _initLayer: function _initLayer() {
        var _this9 = this;

        this._layers.on('layeradd layerremove', function (e) {
          var layer = e.layer;
          var node = layer.getElement && layer.getElement();

          toggleClass(node, _this9.options.polyline.className + ' ' + _this9.options.theme, e.type == 'layeradd');

          toggleEvent(layer, "mousemove", _this9._mousemoveLayerHandler.bind(_this9), e.type == 'layeradd');

          toggleEvent(layer, "mouseout", _this9._mouseoutHandler.bind(_this9), e.type == 'layeradd');
        });
      },
      _initMarker: function _initMarker(map) {
        var pane = map.getPane('elevationPane');

        if (!pane) {
          pane = this._pane = map.createPane('elevationPane', map.getPane('norotatePane') || map.getPane('mapPane'));
          pane.style.zIndex = 625; // This pane is above markers but below popups.

          pane.style.pointerEvents = 'none';
        }

        if (this._renderer) this._renderer.remove();
        this._renderer = L.svg({
          pane: "elevationPane"
        }).addTo(this._map); // default leaflet svg renderer

        this._marker = new Marker(this.options);

        this._fireEvt("elechart_marker");
      },

      /**
       * Inspired by L.Control.Layers
       */
      _initButton: function _initButton(container) {
        //Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
        container.setAttribute('aria-haspopup', true);

        if (!this.options.detached) {
          L.DomEvent.disableClickPropagation(container); //.disableScrollPropagation(container);
        }

        if (L.Browser.mobile) {
          on(container, 'click', L.DomEvent.stopPropagation);
        }

        on(container, 'mousewheel', this._mousewheelHandler, this);

        if (!this.options.detached) {
          var link = this._button = create('a', "elevation-toggle elevation-toggle-icon" + (this.options.autohide ? "" : " close-button"), {
            href: '#',
            title: L._('Elevation')
          }, container);

          if (this.options.collapsed) {
            this._collapse();

            if (this.options.autohide) {
              on(container, 'mouseover', this._expand, this);

              on(container, 'mouseout', this._collapse, this);
            } else {
              on(link, 'click', L.DomEvent.stop);

              on(link, 'click', this._toggle, this);
            }

            on(link, 'focus', this._toggle, this);

            this._map.on('click', this._collapse, this); // TODO: keyboard accessibility

          }
        }
      },
      _initSummary: function _initSummary(container) {
        var summary = this._summary = new Summary({
          summary: this.options.summary
        }, this);
        d3.select(container).call(summary.render());
        this.summaryDiv = this._summary._container;
      },
      _dragendHandler: function _dragendHandler(e) {
        this._hideMarker();

        this.fitBounds(L.latLngBounds([e.dragstart.latlng, e.dragend.latlng]));

        this._fireEvt("elechart_dragged");
      },

      /*
       * Handles the moueseover the chart and displays distance and altitude level.
       */
      _mousemoveHandler: function _mousemoveHandler(e) {
        if (!this._data.length || !this._chartEnabled) {
          return;
        }

        var item = this._findItemForX(e.xCoord);

        if (item) {
          var xCoord = e.xCoord;
          if (this._chartEnabled) this._chart._showDiagramIndicator(item, xCoord);

          this._updateMarker(item);

          this._setMapView(item);

          if (this._map) {
            addClass(this._map.getContainer(), 'elechart-hover');
          }

          this._fireEvt("elechart_change", {
            data: item,
            xCoord: xCoord
          });

          this._fireEvt("elechart_hover", {
            data: item,
            xCoord: xCoord
          });
        }
      },

      /*
       * Handles mouseover events of the data layers on the map.
       */
      _mousemoveLayerHandler: function _mousemoveLayerHandler(e) {
        if (!this._data.length) {
          return;
        }

        var item = this._findItemForLatLng(e.latlng);

        if (item) {
          var xCoord = item.xDiagCoord;
          if (this._chartEnabled) this._chart._showDiagramIndicator(item, xCoord);

          this._updateMarker(item);

          this._fireEvt("elechart_change", {
            data: item,
            xCoord: xCoord
          });
        }
      },

      /*
       * Handles the moueseout over the chart.
       */
      _mouseoutHandler: function _mouseoutHandler() {
        if (!this.options.detached) {
          this._hideMarker();

          this._chart._hideDiagramIndicator();
        }

        if (this._map) {
          removeClass(this._map.getContainer(), 'elechart-hover');
        }

        this._fireEvt("elechart_leave");
      },

      /*
       * Handles the mouesewheel over the chart.
       */
      _mousewheelHandler: function _mousewheelHandler(e) {
        if (this._map.gestureHandling && this._map.gestureHandling._enabled) return;

        var ll = this._marker.getLatLng() || this._map.getCenter();

        var z = this._map.getZoom() + Math.sign(e.deltaY);

        this._resetDrag();

        this._map.flyTo(ll, z);
      },

      /**
       * Add a waypoint marker to the diagram
       */
      _registerCheckPoint: function _registerCheckPoint(props) {
        var _this10 = this;

        this.on("elechart_updated", function () {
          return _this10._chart._registerCheckPoint(props);
        });
      },

      /**
       * Add chart profile to diagram
       */
      _registerAreaPath: function _registerAreaPath(props) {
        var _this11 = this;

        this.on("elechart_init", function () {
          return _this11._chart._registerAreaPath(props);
        });
      },

      /**
       * Add chart grid to diagram
       */
      _registerAxisGrid: function _registerAxisGrid(props) {
        var _this12 = this;

        this.on("elechart_axis", function () {
          return _this12._chart._registerAxisGrid(props);
        });
      },

      /**
       * Add chart axis to diagram
       */
      _registerAxisScale: function _registerAxisScale(props) {
        var _this13 = this;

        this.on("elechart_axis", function () {
          return _this13._chart._registerAxisScale(props);
        });
      },

      /**
       * Add chart or marker tooltip info
       */
      _registerFocusLabel: function _registerFocusLabel(props) {
        var _this14 = this;

        if (props.chart) {
          var label = L.extend({}, props, {
            value: props.chart
          });
          this.on("elechart_init", function () {
            return _this14._chart._registerFocusLabel(label);
          });
        }

        if (props.marker) {
          var _label = L.extend({}, props, {
            value: props.marker
          });

          this.on("elechart_marker", function () {
            return _this14._marker._registerFocusLabel(_label);
          });
        }
      },

      /**
       * Add summary info to diagram
       */
      _registerSummary: function _registerSummary(props) {
        var _this15 = this;

        this.on('elechart_summary', function () {
          return _this15._summary._registerSummary(props);
        });
      },

      /*
       * Removes the drag rectangle and zoms back to the total extent of the data.
       */
      _resetDrag: function _resetDrag() {
        this._chart._resetDrag();

        this._hideMarker();
      },

      /**
       * Resets drag, marker and bounds.
       */
      _resetView: function _resetView() {
        if (this._map && this._map._isFullscreen) return;

        this._resetDrag();

        this._hideMarker();

        if (this.options.autofitBounds) {
          this.fitBounds();
        }
      },

      /**
       * Hacky way for handling chart resize. Deletes it and redraw chart.
       */
      _resizeChart: function _resizeChart() {
        // prevent displaying chart on resize if hidden
        if (style(this._container, "display") == "none") return;
        var opts = this.options;

        if (opts.responsive) {
          var newWidth;

          if (opts.detached) {
            newWidth = (this.eleDiv || this._container).offsetWidth;
          } else {
            var _this$_map$getContain2 = this._map.getContainer(),
                clientWidth = _this$_map$getContain2.clientWidth;

            newWidth = opts._maxWidth > clientWidth ? clientWidth - 30 : opts._maxWidth;
          }

          if (newWidth) {
            var chart = this._chart;
            opts.width = newWidth;

            if (chart && chart._chart) {
              chart._chart._resize(opts);

              opts.xTicks = this._xTicks();
              opts.yTicks = this._yTicks();

              this._updateChart();
            }
          }
        }

        this._updateMapSegments();
      },

      /**
       * Handles the drag event over the ruler filter.
       */
      _rulerFilterHandler: function _rulerFilterHandler(e) {
        this._updateMapSegments(e.coords);
      },

      /**
       * Collapse or Expand current chart control.
       */
      _toggle: function _toggle() {
        if (hasClass(this._container, "elevation-expanded")) this._collapse();else this._expand();
      },

      /**
       * Sets the view of the map (center and zoom). Useful when "followMarker" is true.
       */
      _setMapView: function _setMapView(item) {
        if (!this.options.followMarker || !this._map) return;

        var zoom = this._map.getZoom();

        if ("number" === typeof this._zFollow) {
          if (zoom < this._zFollow) zoom = this._zFollow;

          this._map.setView(item.latlng, zoom, {
            animate: true,
            duration: 0.25
          });
        } else if (!this._map.getBounds().contains(item.latlng)) {
          this._map.setView(item.latlng, zoom, {
            animate: true,
            duration: 0.25
          });
        }
      },

      /**
       * Toggle chart data on legend click
       */
      _toggleChartHandler: function _toggleChartHandler(e) {
        var _this16 = this;

        var path = e.path,
            name = e.name,
            enabled = e.enabled;
        this._chartEnabled = this._chart._hasActiveLayers(); // toggle layer visibility on empty chart

        this._layers.eachLayer(function (layer) {
          var node = layer.getElement && layer.getElement();

          toggleClass(node, _this16.options.polyline.className + ' ' + _this16.options.theme, _this16._chartEnabled);
        }); // toggle option value (eg. altitude = { 'disabled' || 'disabled' })


        this.options[name] = !enabled && this.options[name] == 'disabled' ? 'enabled' : 'disabled'; // remove marker on empty chart

        if (!this._chartEnabled) {
          this._chart._hideDiagramIndicator();

          this._marker.remove();
        }
      },

      /**
       * Calculates [x, y] domain and then update chart.
       */
      _updateChart: function _updateChart() {
        if (!this._data.length || !this._container) return;

        this._fireEvt("elechart_axis");

        this._fireEvt("elechart_area");

        this._chart.update({
          data: this._data,
          options: this.options
        });

        this._x = this._chart._x;
        this._y = this._chart._y;

        this._fireEvt('elechart_updated');
      },

      /*
       * Update the position/height indicator marker drawn onto the map
       */
      _updateMarker: function _updateMarker(item) {
        if (!this._marker) return;

        this._marker.update({
          map: this._map,
          item: item,
          maxElevation: this.track_info.elevation_max || 0,
          options: this.options
        });
      },

      /**
       * Fix marker rotation on rotated maps
       */
      _rotateMarker: function _rotateMarker() {
        if (!this._marker) return;

        this._marker.update();
      },

      /**
       * Highlight track segments on the map.
       */
      _updateMapSegments: function _updateMapSegments(coords) {
        this._markedSegments.setLatLngs(coords || []);

        if (coords && this._map && !this._map.hasLayer(this._markedSegments)) {
          this._markedSegments.addTo(this._map);
        }
      },

      /**
       * Update chart summary.
       */
      _updateSummary: function _updateSummary() {
        var _this17 = this;

        this._summary.reset();

        if (this.options.summary) {
          this._fireEvt("elechart_summary");
        }

        if (this.options.downloadLink && this._downloadURL) {
          // TODO: generate dynamically file content instead of using static file urls.
          this.summaryDiv.innerHTML += '<span class="download"><a href="#">' + L._('Download') + '</a></span>';

          select('.download a', this.summaryDiv).onclick = function (e) {
            e.preventDefault();

            _this17._fireEvt('eletrack_download', {
              downloadLink: _this17.options.downloadLink,
              confirm: saveFile.bind(_this17, _this17._downloadURL)
            });
          };
        }
      },

      /**
       * Calculates chart width.
       */
      _width: function _width() {
        if (this._chart) return this._chart._width();
        var opts = this.options;
        return opts.width - opts.margins.left - opts.margins.right;
      },

      /**
       * Calculate chart xTicks
       */
      _xTicks: function _xTicks() {
        if (this.__xTicks) this.__xTicks = this.options.xTicks;
        return this.__xTicks || Math.round(this._width() / 75);
      },

      /**
       * Calculate chart yTicks
       */
      _yTicks: function _yTicks() {
        if (this.__yTicks) this.__yTicks = this.options.yTicks;
        return this.__yTicks || Math.round(this._height() / 30);
      }
    });
    /**
     * Attach here some useful elevation hooks.
     */

    Elevation.addInitHook(function () {
      this.on('waypoint_added', function (e) {
        var p = e.point,
            pop = p._popup;

        if (pop) {
          pop.options.className = 'elevation-popup';
        }

        if (pop && pop._content) {
          pop._content = decodeURI(pop._content);
          p.bindTooltip(pop._content, {
            direction: 'auto',
            sticky: true,
            opacity: 1,
            className: 'elevation-tooltip'
          }).openTooltip();
        }
      });
      this.on("eletrack_download", function (e) {
        if (e.downloadLink == 'modal' && typeof CustomEvent === "function") {
          document.dispatchEvent(new CustomEvent("eletrack_download", {
            detail: e
          }));
        } else if (e.downloadLink == 'link' || e.downloadLink === true) {
          e.confirm();
        }
      });
      this.on('eledata_loaded', function (e) {
        var _this18 = this;

        var map = this._map;
        var layer = e.layer;

        if (!map) {
          console.warn("Undefined elevation map object");
          return;
        }

        map.once('layeradd', function (e) {
          return _this18.options.autofitBounds && _this18.fitBounds(layer.getBounds());
        });

        if (L.Browser.mobile) {
          if (this.options.polyline) layer.addTo(map);
        } else {
          // leaflet-geometryutil
          Elevation._geomutilLazyLoader = lazyLoader(this.__LGEOMUTIL, typeof L.GeometryUtil !== 'function' || !this.options.lazyLoadJS, Elevation._geomutilLazyLoader).then(function () {
            // leaflet-almostover
            if (_this18.options.almostOver) {
              Elevation._almostoverLazyLoader = lazyLoader(_this18.__LALMOSTOVER, typeof L.Handler.AlmostOver !== 'function' || !_this18.options.lazyLoadJS, Elevation._almostoverLazyLoader).then(function () {
                map.addHandler('almostOver', L.Handler.AlmostOver);

                if (L.GeometryUtil && map.almostOver && map.almostOver.enabled()) {
                  map.almostOver.addLayer(layer);
                  map.on('almost:move', function (e) {
                    return _this18._mousemoveLayerHandler(e);
                  }).on('almost:out', function (e) {
                    return _this18._mouseoutHandler(e);
                  });
                }
              });
            } // leaflet-distance-markers


            if (_this18.options.distanceMarkers) {
              Elevation._distanceMarkersLazyLoader = lazyLoader(_this18.__LDISTANCEM, typeof L.DistanceMarkers !== 'function' || !_this18.options.lazyLoadJS, Elevation._distanceMarkersLazyLoader).then(function () {
                return _this18.options.polyline && layer.addTo(map);
              });
            } else {
              if (_this18.options.polyline) layer.addTo(map);
            }
          });
        }
      }); // Basic canvas renderer support.

      var oldProto = L.Canvas.prototype._fillStroke;
      var control = this;
      L.Canvas.include({
        _fillStroke: function _fillStroke(ctx, layer) {
          if (control._layers.hasLayer(layer)) {
            var theme = control.options.theme.replace('-theme', '');
            var color = Colors[theme] || {};
            var options = layer.options;
            options.color = color.line || color.area || theme;
            options.stroke = !!options.color;
            oldProto.call(this, ctx, layer);

            if (options.stroke && options.weight !== 0) {
              var oldVal = ctx.globalCompositeOperation || 'source-over';
              ctx.globalCompositeOperation = 'destination-over';
              ctx.strokeStyle = '#FFF';
              ctx.lineWidth = options.weight * 1.75;
              ctx.stroke();
              ctx.globalCompositeOperation = oldVal;
            }
          } else {
            oldProto.call(this, ctx, layer);
          }
        }
      }); // Partially fix: https://github.com/Raruto/leaflet-elevation/issues/81#issuecomment-713477050

      this.on('elechart_init', function () {
        this.once('elechart_change elechart_hover', function (e) {
          if (this._chartEnabled) {
            this._chart._showDiagramIndicator(e.data, e.xCoord);

            this._chart._showDiagramIndicator(e.data, e.xCoord);
          }

          this._updateMarker(e.data);
        });
      });
    });

    Elevation.addInitHook(function () {
      var _this2 = this;

      var opts = this.options;
      var distance = {};

      if (this.options.imperial) {
        this._distanceFactor = this.__mileFactor;
        this._xLabel = "mi";
      } else {
        this._distanceFactor = opts.distanceFactor;
        this._xLabel = opts.xLabel;
      }

      this.on("eledata_updated", function (e) {
        var data = this._data;
        var i = e.index;
        var track = this.track_info;
        var dist = track.distance || 0;
        var curr = data[i].latlng;
        var prev = i > 0 ? data[i - 1].latlng : curr;

        var delta = curr.distanceTo(prev) * this._distanceFactor;

        dist += Math.round(delta / 1000 * 100000) / 100000; // handles floating points calc

        data[i].dist = dist;
        track.distance = dist;
      });
      this.on("elechart_axis", function () {
        this._chart._registerAxisGrid({
          axis: "x",
          position: "bottom",
          scale: this._chart._x
        });
      });

      if (this.options.distance != "summary") {
        this.on("elechart_axis", function () {
          var _this = this;

          distance.x = this._chart._x;
          distance.label = this._chart._xLabel;

          this._chart._registerAxisScale({
            axis: "x",
            position: "bottom",
            scale: distance.x,
            label: distance.label,
            labelY: 25,
            labelX: function labelX() {
              return _this._width() + 6;
            },
            name: "distance"
          });
        });
      }

      this._registerSummary({
        "totlen": {
          label: "Total Length: ",
          value: function value(track) {
            return (track.distance || 0).toFixed(2) + '&nbsp;' + _this2._xLabel;
          }
        }
      });
    });

    Elevation.addInitHook(function () {
      var _this = this;

      var opts = this.options;
      var altitude = {};

      if (opts.imperial) {
        this._heightFactor = this.__footFactor;
        this._yLabel = "ft";
      } else {
        this._heightFactor = opts.heightFactor;
        this._yLabel = opts.yLabel;
      }

      this.on("eledata_updated", function (e) {
        var data = this._data;
        var i = e.index;
        var z = data[i].z * this._heightFactor;
        var track = this.track_info;
        var eleMax = track.elevation_max || -Infinity;
        var eleMin = track.elevation_min || +Infinity; // check and fix missing elevation data on last added point

        if (!this.options.skipNullZCoords && i > 0) {
          var prevZ = data[i - 1].z;

          if (isNaN(prevZ)) {
            var lastZ = this._lastValidZ;
            var currZ = z;

            if (!isNaN(lastZ) && !isNaN(currZ)) {
              prevZ = (lastZ + currZ) / 2;
            } else if (!isNaN(lastZ)) {
              prevZ = lastZ;
            } else if (!isNaN(currZ)) {
              prevZ = currZ;
            }

            if (!isNaN(prevZ)) return data.splice(i - 1, 1);
            data[i - 1].z = prevZ;
          }
        } // skip point if it has not elevation


        if (!isNaN(z)) {
          eleMax = eleMax < z ? z : eleMax;
          eleMin = eleMin > z ? z : eleMin;
          this._lastValidZ = z;
        }

        data[i].z = z;
        track.elevation_max = eleMax;
        track.elevation_min = eleMin;
      });
      this.on("elechart_axis", function () {
        this._chart._registerAxisGrid({
          axis: "y",
          position: "left",
          scale: this._chart._y
        });
      });

      if (this.options.altitude != "summary") {
        this.on("elechart_axis", function () {
          altitude.y = this._chart._y;
          altitude.label = this._yLabel;

          this._chart._registerAxisScale({
            axis: "y",
            position: "left",
            scale: altitude.y,
            label: altitude.label,
            labelX: -3,
            labelY: -8,
            name: "altitude"
          });
        });
        this.on("elechart_init", function () {
          var theme = this.options.theme.replace('-theme', '');
          var color = Colors[theme] || {};
          var alpha = this.options.detached ? color.alpha || '0.8' : 1;
          var stroke = this.options.detached ? color.stroke : false;

          this._chart._registerAreaPath({
            name: 'altitude',
            label: 'Altitude',
            scaleX: 'distance',
            scaleY: 'altitude',
            color: color.area || theme,
            strokeColor: stroke || '#000',
            strokeOpacity: "1",
            fillOpacity: alpha,
            preferCanvas: this.options.preferCanvas
          });
        });
      }

      this._registerSummary({
        "maxele": {
          label: "Max Elevation: ",
          value: function value(track) {
            return (track.elevation_max || 0).toFixed(2) + '&nbsp;' + _this._yLabel;
          }
        },
        "minele": {
          label: "Min Elevation: ",
          value: function value(track) {
            return (track.elevation_min || 0).toFixed(2) + '&nbsp;' + _this._yLabel;
          }
        }
      });
    });

    Elevation.addInitHook(function () {
      var _this = this;

      var opts = this.options;
      var time = {};
      time.label = opts.timeLabel || 't';
      this._timeFactor = opts.timeFactor;
      /**
       * Common AVG speeds:
       * ----------------------
       *  slow walk = 1.8  km/h
       *  walking   = 3.6  km/h
       *  running   = 10.8 km/h
       *  cycling   = 18   km/h
       *  driving   = 72   km/h
       * ----------------------
       */

      this._timeAVGSpeed = (opts.timeAVGSpeed || 3.6) * (opts.speedFactor || 1);

      if (!opts.timeFormat) {
        opts.timeFormat = function (time) {
          return new Date(time).toLocaleString().replaceAll('/', '-').replaceAll(',', ' ');
        };
      } else if (opts.timeFormat == 'time') {
        opts.timeFormat = function (time) {
          return new Date(time).toLocaleTimeString();
        };
      } else if (opts.timeFormat == 'date') {
        opts.timeFormat = function (time) {
          return new Date(time).toLocaleDateString();
        };
      }

      opts.xTimeFormat = opts.xTimeFormat || function (t) {
        return formatTime(t).split("'")[0];
      };

      if (opts.time && opts.time != "summary" && !L.Browser.mobile) {
        this._registerAxisScale({
          axis: "x",
          position: "top",
          scale: {
            attr: "duration",
            min: 0
          },
          label: time.label,
          labelY: -10,
          labelX: function labelX() {
            return _this._width();
          },
          name: "time",
          tickFormat: function tickFormat(d) {
            return d == 0 ? '' : opts.xTimeFormat(d);
          },
          onAxisMount: function onAxisMount(axis) {
            axis.select(".domain").remove();
            axis.selectAll("text").attr('opacity', 0.65).style('font-family', 'Monospace').style('font-size', '110%');
            axis.selectAll(".tick line").attr('y2', _this._height()).attr('stroke-dasharray', 2).attr('opacity', 0.75);
          }
        });
      }

      this.on('elepoint_added', function (e) {
        var data = this._data;
        var i = e.index; // Add missing timestamps (see: options.timeAVGSpeed)

        if (!e.point.meta || !e.point.meta.time) {
          e.point.meta = e.point.meta || {};
          var delta = data[i].dist - data[i > 0 ? i - 1 : i].dist;
          var speed = this._timeAVGSpeed;
          e.point.meta.time = new Date(i > 0 ? data[i - 1].time.getTime() + delta / speed * this._timeFactor * 1000 : Date.now());
        }

        var time = e.point.meta.time; // Handle timezone offset

        if (time.getTime() - time.getTimezoneOffset() * 60 * 1000 === 0) {
          time = 0;
        }

        var currT = time;
        var prevT = i > 0 ? data[i - 1].time : currT;
        var deltaT = Math.abs(currT - prevT);
        var duration = (this.track_info.time || 0) + deltaT;
        data[i].time = time;
        data[i].duration = duration;
        this.track_info.time = duration;
      });

      if (this.options.time) {
        this._registerFocusLabel({
          name: 'time',
          chart: function chart(item) {
            return _this.options.timeFormat(item.time);
          }
        });

        this._registerSummary({
          "tottime": {
            label: "Total Time: ",
            value: function value(track) {
              return formatTime(track.time || 0);
            }
          }
        });
      }
    });

    Elevation.addInitHook(function () {
      var _this = this;

      if (!this.options.slope) return;
      var opts = this.options;
      var slope = {};
      slope.label = opts.slopeLabel || '%';

      if (this.options.slope != "summary") {
        this._registerAxisScale({
          axis: "y",
          position: "right",
          scale: {
            min: -1,
            max: +1
          },
          tickPadding: 16,
          label: slope.label,
          labelX: 25,
          labelY: -8,
          name: 'slope'
        });

        this._registerAreaPath({
          name: 'slope',
          label: 'Slope',
          yAttr: 'slope',
          scaleX: 'distance',
          scaleY: 'slope',
          color: '#F00',
          strokeColor: '#000',
          strokeOpacity: "0.5",
          fillOpacity: "0.25"
        });
      }

      this.on("eledata_updated", function (e) {
        var data = this._data;
        var i = e.index;
        var z = data[i].z;
        var delta = (data[i].dist - data[i > 0 ? i - 1 : i].dist) * 1000; // Slope / Gain

        var track = this.track_info;
        var tAsc = track.ascent || 0; // Total Ascent

        var tDes = track.descent || 0; // Total Descent

        var sMax = track.slope_max || 0; // Slope Max

        var sMin = track.slope_min || 0; // Slope Min

        var slope = 0;

        if (!isNaN(z)) {
          var deltaZ = i > 0 ? z - data[i - 1].z : 0;
          if (deltaZ > 0) tAsc += deltaZ;else if (deltaZ < 0) tDes -= deltaZ; // slope in % = ( height / length ) * 100

          if (delta !== 0) slope = deltaZ / delta * 100;
        } // Try to smooth "crazy" slope values.


        if (this.options.sDeltaMax) {
          var deltaS = i > 0 ? slope - data[i - 1].slope : 0;
          var maxDeltaS = this.options.sDeltaMax;

          if (Math.abs(deltaS) > maxDeltaS) {
            slope = data[i - 1].slope + maxDeltaS * Math.sign(deltaS);
          }
        } // Range of acceptable slope values.


        if (this.options.sRange) {
          var range = this.options.sRange;
          if (slope < range[0]) slope = range[0];else if (slope > range[1]) slope = range[1];
        }

        slope = L.Util.formatNum(slope, 2);
        if (slope > sMax) sMax = slope;
        if (slope < sMin) sMin = slope;
        data[i].slope = slope;
        track.ascent = tAsc;
        track.descent = tDes;
        track.slope_max = sMax;
        track.slope_min = sMin;
      });

      this._registerFocusLabel({
        name: 'slope',
        chart: function chart(item) {
          return item.slope + slope.label;
        },
        marker: function marker(item) {
          return Math.round(item.slope) + slope.label;
        }
      });

      this._registerSummary({
        "ascent": {
          label: "Total Ascent: ",
          value: function value(track) {
            return Math.round(track.ascent || 0) + '&nbsp;' + _this._yLabel;
          }
        },
        "descent": {
          label: "Total Descent: ",
          value: function value(track) {
            return Math.round(track.descent || 0) + '&nbsp;' + _this._yLabel;
          }
        },
        "minslope": {
          label: "Min Slope: ",
          value: function value(track) {
            return Math.round(track.slope_min || 0) + '&nbsp;' + slope.label;
          }
        },
        "maxslope": {
          label: "Max Slope: ",
          value: function value(track) {
            return Math.round(track.slope_max || 0) + '&nbsp;' + slope.label;
          }
        }
      });
    });

    Elevation.addInitHook(function () {
      if (!this.options.speed && !this.options.acceleration) return;
      var opts = this.options;
      var speed = {};
      speed.label = opts.speedLabel || L._(this.options.imperial ? 'mph' : 'km/h');
      this._speedFactor = opts.speedFactor || 1;

      if (this.options.speed && this.options.speed != "summary") {
        this._registerAxisScale({
          axis: "y",
          position: "right",
          scale: {
            min: 0,
            max: +1
          },
          tickPadding: 16,
          label: speed.label,
          labelX: 25,
          labelY: -8,
          name: "speed"
        });

        this._registerAreaPath({
          name: 'speed',
          label: 'Speed',
          yAttr: "speed",
          scaleX: 'distance',
          scaleY: 'speed',
          color: '#03ffff',
          strokeColor: '#000',
          strokeOpacity: "0.5",
          fillOpacity: "0.25"
        });
      }

      this.on('elepoint_added', function (e) {
        var data = this._data;
        var i = e.index;
        var currT = data[i].time;
        var prevT = i > 0 ? data[i - 1].time : currT;
        var deltaT = currT - prevT;
        var track = this.track_info;
        var sMax = track.speed_max || -Infinity; // Speed Max

        var sMin = track.speed_min || +Infinity; // Speed Min

        var sAvg = track.speed_avg || 0; // Speed Avg

        var speed = 0;

        if (deltaT > 0) {
          var delta = (data[i].dist - data[i > 0 ? i - 1 : i].dist) * 1000;
          speed = Math.abs(delta / deltaT * this._timeFactor) * this._speedFactor;
        } // Try to smooth "crazy" speed values.


        if (this.options.speedDeltaMax) {
          var deltaS = i > 0 ? speed - data[i - 1].speed : 0;
          var maxDeltaS = this.options.speedDeltaMax;

          if (Math.abs(deltaS) > maxDeltaS) {
            speed = data[i - 1].speed + maxDeltaS * Math.sign(deltaS);
          }
        } // Range of acceptable speed values.


        if (this.options.speedRange) {
          var range = this.options.speedRange;
          if (speed < range[0]) speed = range[0];else if (speed > range[1]) speed = range[1];
        }

        speed = L.Util.formatNum(speed, 2);
        sMax = speed > sMax ? speed : sMax;
        sMin = speed < sMin ? speed : sMin;
        sAvg = (speed + sAvg) / 2.0;
        data[i].speed = speed;
        track.speed_max = sMax;
        track.speed_min = sMin;
        track.speed_avg = sAvg;
      });

      if (this.options.speed) {
        this._registerFocusLabel({
          name: 'speed',
          chart: function chart(item) {
            return item.speed + " " + speed.label;
          },
          marker: function marker(item) {
            return Math.round(item.speed) + " " + speed.label;
          }
        });

        this._registerSummary({
          "minspeed": {
            label: "Min Speed: ",
            value: function value(track) {
              return Math.round(track.speed_min || 0) + '&nbsp;' + speed.label;
            }
          },
          "maxspeed": {
            label: "Max Speed: ",
            value: function value(track) {
              return Math.round(track.speed_max || 0) + '&nbsp;' + speed.label;
            }
          },
          "avgspeed": {
            label: "Avg Speed: ",
            value: function value(track) {
              return Math.round(track.speed_avg || 0) + '&nbsp;' + speed.label;
            }
          }
        });
      }
    });

    Elevation.addInitHook(function () {
      if (!this.options.acceleration) return;
      var opts = this.options;
      var acceleration = {};
      acceleration.label = opts.accelerationLabel || L._(this.options.imperial ? 'ft/s²' : 'm/s²');
      this._accelerationFactor = opts.accelerationFactor || 1;

      if (this.options.acceleration != "summary") {
        this._registerAxisScale({
          axis: "y",
          position: "right",
          scale: {
            min: 0,
            max: +1
          },
          tickPadding: 16,
          label: acceleration.label,
          labelX: 25,
          labelY: -8,
          name: 'acceleration'
        });

        this._registerAreaPath({
          name: 'acceleration',
          label: 'Acceleration',
          yAttr: 'acceleration',
          scaleX: 'distance',
          scaleY: 'acceleration',
          color: '#050402',
          strokeColor: '#000',
          strokeOpacity: "0.5",
          fillOpacity: "0.25"
        });
      }

      this.on('elepoint_added', function (e) {
        var data = this._data;
        var i = e.index;
        var currT = data[i].time;
        var prevT = i > 0 ? data[i - 1].time : currT;
        var deltaT = (currT - prevT) / 1000;
        var track = this.track_info;
        var sMax = track.acceleration_max || -Infinity; // Acceleration Max

        var sMin = track.acceleration_min || +Infinity; // Acceleration Min

        var sAvg = track.acceleration_avg || 0; // Acceleration Avg

        var acceleration = 0;

        if (deltaT > 0) {
          var curr = data[i].speed;
          var prev = i > 0 ? data[i - 1].speed : curr;
          var delta = (curr - prev) * (1000 / this._timeFactor);
          acceleration = Math.abs(delta / deltaT) * this._accelerationFactor;
        } // Try to smooth "crazy" acceleration values.


        if (this.options.accelerationDeltaMax) {
          var deltaA = i > 0 ? acceleration - data[i - 1].acceleration : 0;
          var maxDeltaS = this.options.accelerationDeltaMax;

          if (Math.abs(deltaA) > maxDeltaS) {
            acceleration = data[i - 1].acceleration + maxDeltaS * Math.sign(deltaA);
          }
        } // Range of acceptable acceleration values.


        if (this.options.accelerationRange) {
          var range = this.options.accelerationRange;
          if (acceleration < range[0]) acceleration = range[0];else if (acceleration > range[1]) acceleration = range[1];
        }

        acceleration = L.Util.formatNum(acceleration, 2);
        if (acceleration > sMax) sMax = acceleration;
        if (acceleration < sMin) sMin = acceleration;
        sAvg = (acceleration + sAvg) / 2.0;
        data[i].acceleration = acceleration;
        track.acceleration_max = sMax;
        track.acceleration_min = sMin;
        track.acceleration_avg = sAvg;
      });

      this._registerFocusLabel({
        name: 'acceleration',
        chart: function chart(item) {
          return item.acceleration + " " + acceleration.label;
        },
        marker: function marker(item) {
          return Math.round(item.acceleration) + " " + acceleration.label;
        }
      });

      this._registerSummary({
        "minacceleration": {
          label: "Min Acceleration: ",
          value: function value(track) {
            return Math.round(track.acceleration_min || 0) + '&nbsp;' + acceleration.label;
          }
        },
        "maxacceleration": {
          label: "Max Acceleration: ",
          value: function value(track) {
            return Math.round(track.acceleration_max || 0) + '&nbsp;' + acceleration.label;
          }
        },
        "avgacceleration": {
          label: "Avg Acceleration: ",
          value: function value(track) {
            return Math.round(track.acceleration_avg || 0) + '&nbsp;' + acceleration.label;
          }
        }
      });
    });

    /*
     * Copyright (c) 2019, GPL-3.0+ Project, Raruto
     *
     *  This file is free software: you may copy, redistribute and/or modify it
     *  under the terms of the GNU General Public License as published by the
     *  Free Software Foundation, either version 2 of the License, or (at your
     *  option) any later version.
     *
     *  This file is distributed in the hope that it will be useful, but
     *  WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
     *  General Public License for more details.
     *
     *  You should have received a copy of the GNU General Public License
     *  along with this program.  If not, see .
     *
     * This file incorporates work covered by the following copyright and
     * permission notice:
     *
     *     Copyright (c) 2013-2016, MIT License, Felix “MrMufflon” Bache
     *
     *     Permission to use, copy, modify, and/or distribute this software
     *     for any purpose with or without fee is hereby granted, provided
     *     that the above copyright notice and this permission notice appear
     *     in all copies.
     *
     *     THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL
     *     WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED
     *     WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE
     *     AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR
     *     CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
     *     OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT,
     *     NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
     *     CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     */
    Elevation.Utils = _;
    Elevation.Components = D3;
    Elevation.Chart = Chart$1;

    L.control.elevation = function (options) {
      return new Elevation(options);
    };

})));
//# sourceMappingURL=leaflet-elevation.js.map