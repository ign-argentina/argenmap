/*
 * Leaflet.TextPath - Shows text along a polyline
 * Inspired by Tom Mac Wright article :
 * http://mapbox.com/osmdev/2012/11/20/getting-serious-about-svg/
 */

(function () {
  var __onAdd = L.Polyline.prototype.onAdd,
    __onRemove = L.Polyline.prototype.onRemove,
    __updatePath = L.Polyline.prototype._updatePath,
    __bringToFront = L.Polyline.prototype.bringToFront;

  var PolylineTextPath = {
    onAdd: function (map) {
      __onAdd.call(this, map);
      this._textRedraw();
    },

    onRemove: function (map) {
      map = map || this._map;
      if (map && this._textNode && map._renderer._container)
        map._renderer._container.removeChild(this._textNode);
      __onRemove.call(this, map);
    },

    bringToFront: function () {
      __bringToFront.call(this);
      this._textRedraw();
    },

    _updatePath: function () {
      __updatePath.call(this);
      this._textRedraw();
    },

    _textRedraw: function () {
      var text = this._text,
        options = this._textOptions;
      if (text) {
        this.setText(null).setText(text, options);
      }
    },

    setText: function (text, options) {
      this._text = text;
      this._textOptions = options;

      /* If not in SVG mode or Polyline not added to map yet return */
      /* setText will be called by onAdd, using value stored in this._text */
      if (!L.Browser.svg || typeof this._map === "undefined") {
        return this;
      }

      var defaults = {
        repeat: false,
        fillColor: "black",
        attributes: {},
        below: false,
        minZoom: null,
        maxZoom: null,
        autoHide: true,
        maxAngle: 25,
        pathPadding: 12,
      };
      options = L.Util.extend(defaults, options);

      /* If empty text, hide */
      if (!text) {
        if (this._textNode && this._textNode.parentNode) {
          this._map._renderer._container.removeChild(this._textNode);

          /* delete the node, so it will not be removed a 2nd time if the layer is later removed from the map */
          delete this._textNode;
        }
        return this;
      }

      text = text.replace(/ /g, "\u00A0"); // Non breakable spaces
      var id = "pathdef-" + L.Util.stamp(this);
      var svg = this._map._renderer._container;
      this._path.setAttribute("id", id);

      if (options.repeat) {
        /* Compute single pattern length */
        var pattern = L.SVG.create("text");
        for (var attr in options.attributes)
          pattern.setAttribute(attr, options.attributes[attr]);
        pattern.appendChild(document.createTextNode(text));
        svg.appendChild(pattern);
        var alength = pattern.getComputedTextLength();
        svg.removeChild(pattern);

        /* Create string as long as path */
        text = new Array(
          Math.ceil(
            isNaN(this._path.getTotalLength() / alength)
              ? 0
              : this._path.getTotalLength() / alength,
          ),
        ).join(text);
      }

      /* Put it along the path using textPath */
      var textNode = L.SVG.create("text"),
        textPath = L.SVG.create("textPath");

      var dy =
        options.offset !== undefined
          ? options.offset
          : this._path.getAttribute("stroke-width");

      textPath.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "xlink:href",
        "#" + id,
      );
      textNode.setAttribute("dy", dy);
      for (var attr in options.attributes)
        textNode.setAttribute(attr, options.attributes[attr]);
      textPath.appendChild(document.createTextNode(text));
      textNode.appendChild(textPath);
      this._textNode = textNode;

      if (options.below) {
        svg.insertBefore(textNode, svg.firstChild);
      } else {
        svg.appendChild(textNode);
      }

      if (!this._textFitsPath(textNode, options)) {
        // Keep the SVG node measurable so orientation and centering can still
        // be calculated. The node is recreated on every path/zoom redraw.
        textNode.style.visibility = "hidden";
      }

      /* Center text according to the path's bounding box */
      if (options.center) {
        var textLength = textNode.getComputedTextLength();
        var pathLength = this._path.getTotalLength();
        /* Set the position for the left side of the textNode */
        textNode.setAttribute("dx", pathLength / 2 - textLength / 2);
      }

      /* Change label rotation (if required) */
      if (options.orientation) {
        var rotateAngle = 0;
        switch (options.orientation) {
          case "auto":
            var pathLength = this._path.getTotalLength();
            var sampleDistance = Math.min(2, pathLength / 4);
            var pointBefore = this._path.getPointAtLength(
              Math.max(0, pathLength / 2 - sampleDistance),
            );
            var pointAfter = this._path.getPointAtLength(
              Math.min(pathLength, pathLength / 2 + sampleDistance),
            );
            var deltaX = pointAfter.x - pointBefore.x;
            var deltaY = pointAfter.y - pointBefore.y;
            rotateAngle =
              deltaX < 0 || (Math.abs(deltaX) < 0.01 && deltaY < 0)
                ? 180
                : 0;
            break;
          case "flip":
            rotateAngle = 180;
            break;
          case "perpendicular":
            rotateAngle = 90;
            break;
          default:
            rotateAngle = options.orientation;
        }

        if (rotateAngle !== 0) {
          var rotatecenterX =
            textNode.getBBox().x + textNode.getBBox().width / 2;
          var rotatecenterY =
            textNode.getBBox().y + textNode.getBBox().height / 2;
          textNode.setAttribute(
            "transform",
            "rotate(" +
              rotateAngle +
              " " +
              rotatecenterX +
              " " +
              rotatecenterY +
              ")",
          );
        }
      }

      /* Initialize mouse events for the additional nodes */
      if (this.options.interactive) {
        if (L.Browser.svg || !L.Browser.vml) {
          textPath.setAttribute("class", "leaflet-interactive");
        }

        var events = [
          "click",
          "dblclick",
          "mousedown",
          "mouseover",
          "mouseout",
          "mousemove",
          "contextmenu",
        ];
        for (var i = 0; i < events.length; i++) {
          L.DomEvent.on(textNode, events[i], this.fire, this);
        }
      }

      return this;
    },

    _textFitsPath: function (textNode, options) {
      var zoom = this._map && this._map.getZoom();
      if (options.minZoom !== null && zoom < options.minZoom) return false;
      if (options.maxZoom !== null && zoom > options.maxZoom) return false;
      if (options.autoHide === false) return true;

      var pathLength = this._path.getTotalLength();
      var textLength = textNode.getComputedTextLength();
      if (!pathLength || textLength + options.pathPadding * 2 > pathLength) {
        return false;
      }

      var start = Math.max(0, pathLength / 2 - textLength / 2);
      var end = Math.min(pathLength, pathLength / 2 + textLength / 2);
      var samples = Math.max(3, Math.min(12, Math.ceil(textLength / 18)));
      var previousAngle = null;
      var accumulatedAngle = 0;
      for (var index = 0; index < samples; index++) {
        var from = this._path.getPointAtLength(
          start + ((end - start) * index) / samples,
        );
        var to = this._path.getPointAtLength(
          start + ((end - start) * (index + 1)) / samples,
        );
        var angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);
        if (previousAngle !== null) {
          var difference = Math.abs(angle - previousAngle);
          difference = difference > 180 ? 360 - difference : difference;
          if (difference > options.maxAngle) return false;
          accumulatedAngle += difference;
        }
        previousAngle = angle;
      }
      return accumulatedAngle <= options.maxAngle * 2;
    },
  };

  L.Polyline.include(PolylineTextPath);

  L.LayerGroup.include({
    setText: function (text, options) {
      for (var layer in this._layers) {
        if (typeof this._layers[layer].setText === "function") {
          this._layers[layer].setText(text, options);
        }
      }
      return this;
    },
  });
})();
