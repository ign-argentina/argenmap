var atrib_ign =
  "<a href='https://www.ign.gob.ar/AreaServicios/Argenmap/IntroduccionV2' target='_blank'>Instituto Geográfico Nacional</a> + <a href='https://www.osm.org/copyright' target='_blank'>OpenStreetMap</a>",
  baseMaps = {},
  overlayMaps = new Object(),
  layerName,
  layerData;
var argenmap = "";
var mapa = "";
let currentBaseMap = null;

let countour_styles = false;

gestorMenu.addPlugin("leaflet", PLUGINS.leaflet, function () {
  for (const plugin in PLUGINS) {
    if (
      !app.hasOwnProperty("excluded_plugins") ||
      !app.excluded_plugins.find(
        (excluded_plugin) => excluded_plugin === plugin
      )
    ) {
      gestorMenu.addPlugin(plugin, PLUGINS[plugin]);
    }
  }
});

const onClickAllActiveLayers = () => {
  const inputs = Array.from(
    document.getElementById("activeLayers").getElementsByTagName("input")
  );
  inputs[0].checked = !inputs[0].checked;
  if (inputs.length > 1) {
    inputs.slice(1, inputs.length).forEach((input) => {
      input.checked = inputs[0].checked;
    });
  }
};

const onClickActiveLayer = (activeLayer) => {
  const inputElement = document.getElementById(activeLayer);
  inputElement.checked = !inputElement.checked;
};

const changeMarkerStyles = (layer, borderWidth, borderColor, fillColor) => {
  mapa.setIconToMarker(layer, borderColor, fillColor, borderWidth);
  layer.options.borderWidth = borderWidth;
  layer.options.borderColor = borderColor;
  layer.options.fillColor = fillColor;
};

// Add plugins to map when (and if) avaiable
// Mapa base actual de ArgenMap (Geoserver)
var unordered = "";
var ordered = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
var ordenZoomHome = 1;
var ordenFullScreen = 5;
var ordenMeasure = 2;
var ordenGraticula = 4;
var ordenLocate = 3;
var ordenDraw = 6;
var ordenBetterScale = 7;
var ordenMinimap = 8;
var ordenScreenShoter = 9;
var ordenPrint = 10;
var ordenPdfPriner = 11;
var ordenLoadLayer = 12;
var ordenGeoprocessing = 13;
var ordenConsultData = 14;
var ordenHelp = 15;
var ordenConfig = 16;
var visiblesActivar = true;
var visiblesActivar = true;
$("body").on("pluginLoad", function (event, plugin) {
  unordered = "";
  visiblesActivar = true;
  switch (plugin.pluginName) {
    // Add ordered plugins in order
    case "leaflet":
      unordered = plugin.pluginName;
      break;
    case "menuPrinter":
      showMainMenu();
      break;
    case "ZoomHome":
      ordered.splice(ordenZoomHome, 1, plugin.pluginName);
      break;
    case "locate":
      ordered.splice(ordenLocate, 1, plugin.pluginName);
      break;
    case "Measure":
      ordered.splice(ordenMeasure, 1, plugin.pluginName);
      break;
    case "graticula":
      ordered.splice(ordenGraticula, 1, plugin.pluginName);
      break;
    case "FullScreen":
      ordered.splice(ordenFullScreen, 1, plugin.pluginName);
      break;
    case "Draw":
      ordered.splice(ordenDraw, 1, plugin.pluginName);
      break;
    case "betterScale":
      ordered.splice(ordenBetterScale, 1, plugin.pluginName);
      break;
    case "minimap":
      ordered.splice(ordenMinimap, 1, plugin.pluginName);
      break;
    case "screenShoter":
      ordered.splice(ordenScreenShoter, 1, plugin.pluginName);
      break;
    case "geoprocessing":
      ordered.splice(ordenGeoprocessing, 1, plugin.pluginName);
      break;
    case "loadLayer":
      ordered.splice(ordenLoadLayer, 1, plugin.pluginName);
      break;
    case "pdfPrinter":
      ordered.splice(ordenPdfPriner, 1, plugin.pluginName);
      break;
    case "consultData":
      ordered.splice(ordenConsultData, 1, plugin.pluginName);
      break;
    case "groupLayerSelector":
      ordered.splice(ordenGroupLayerSelector, 1, plugin.pluginName);
      break;
    case "helpTour":
      ordered.splice(ordenHelp, 1, plugin.pluginName);
      break;
    case "configTool":
      ordered.splice(ordenConfig, 1, plugin.pluginName);
      break;
    default:
      // Add unordered plugins
      unordered = plugin.pluginName;
      break;
  }
  // oredered plugins status chek
  if (visiblesActivar && gestorMenu.pluginExists("leaflet")) {
    if (gestorMenu.plugins["leaflet"].getStatus() != "visible") {
      visiblesActivar = false;
    }
  }
  if (visiblesActivar && gestorMenu.pluginExists("ZoomHome")) {
    if (
      gestorMenu.plugins["ZoomHome"].getStatus() == "ready" ||
      gestorMenu.plugins["ZoomHome"].getStatus() == "fail"
    ) {
    } else {
      visiblesActivar = false;
    }
  }
  if (visiblesActivar && gestorMenu.pluginExists("FullScreen")) {
    if (
      gestorMenu.plugins["FullScreen"].getStatus() == "ready" ||
      gestorMenu.plugins["FullScreen"].getStatus() == "fail"
    ) {
    } else {
      visiblesActivar = false;
    }
  }
  if (visiblesActivar && gestorMenu.pluginExists("locate")) {
    if (
      gestorMenu.plugins["locate"].getStatus() == "ready" ||
      gestorMenu.plugins["locate"].getStatus() == "fail"
    ) {
    } else {
      visiblesActivar = false;
    }
  }
  if (visiblesActivar && gestorMenu.pluginExists("graticula")) {
    if (
      gestorMenu.plugins["graticula"].getStatus() == "ready" ||
      gestorMenu.plugins["graticula"].getStatus() == "fail"
    ) {
    } else {
      visiblesActivar = false;
    }
  }
  if (visiblesActivar && gestorMenu.pluginExists("Measure")) {
    if (
      gestorMenu.plugins["Measure"].getStatus() == "ready" ||
      gestorMenu.plugins["Measure"].getStatus() == "fail"
    ) {
    } else {
      visiblesActivar = false;
    }
  }
  if (visiblesActivar && gestorMenu.pluginExists("pdfPrinter")) {
    if (
      gestorMenu.plugins["pdfPrinter"].getStatus() == "ready" ||
      gestorMenu.plugins["pdfPrinter"].getStatus() == "fail"
    ) {
    } else {
      visiblesActivar = false;
    }
  }
  if (visiblesActivar && gestorMenu.pluginExists("consultData")) {
    if (
      gestorMenu.plugins["consultData"].getStatus() == "ready" ||
      gestorMenu.plugins["consultData"].getStatus() == "fail"
    ) {
    } else {
      visiblesActivar = false;
    }
  }
  if (visiblesActivar && gestorMenu.pluginExists("groupLayerSelector")) {
    if (
      gestorMenu.plugins["groupLayerSelector"].getStatus() == "ready" ||
      gestorMenu.plugins["groupLayerSelector"].getStatus() == "fail"
    ) {
    } else {
      visiblesActivar = false;
    }
  }
  if (visiblesActivar && gestorMenu.pluginExists("Draw")) {
    if (
      gestorMenu.plugins["Draw"].getStatus() == "ready" ||
      gestorMenu.plugins["Draw"].getStatus() == "fail"
    ) {
    } else {
      visiblesActivar = false;
    }
  }
  if (visiblesActivar && gestorMenu.pluginExists("betterScale")) {
    if (
      gestorMenu.plugins["betterScale"].getStatus() == "ready" ||
      gestorMenu.plugins["betterScale"].getStatus() == "fail"
    ) {
    } else {
      visiblesActivar = false;
    }
  }
  if (visiblesActivar && gestorMenu.pluginExists("minimap")) {
    if (
      gestorMenu.plugins["minimap"].getStatus() == "ready" ||
      gestorMenu.plugins["minimap"].getStatus() == "fail"
    ) {
    } else {
      visiblesActivar = false;
    }
  }
  if (visiblesActivar && gestorMenu.pluginExists("screenShoter")) {
    if (
      gestorMenu.plugins["screenShoter"].getStatus() == "ready" ||
      gestorMenu.plugins["screenShoter"].getStatus() == "fail"
    ) {
    } else {
      visiblesActivar = false;
    }
  }
  if (visiblesActivar && gestorMenu.pluginExists("geoprocessing")) {
    if (
      gestorMenu.plugins["geoprocessing"].getStatus() == "ready" ||
      gestorMenu.plugins["geoprocessing"].getStatus() == "fail"
    ) {
    } else {
      visiblesActivar = false;
    }
  }
  if (visiblesActivar && gestorMenu.pluginExists("loadLayer")) {
    if (
      gestorMenu.plugins["loadLayer"].getStatus() == "ready" ||
      gestorMenu.plugins["loadLayer"].getStatus() == "fail"
    ) {
    } else {
      visiblesActivar = false;
    }
  }
  if (visiblesActivar && gestorMenu.pluginExists("helpTour")) {
    if (
      gestorMenu.plugins["helpTour"].getStatus() == "ready" ||
      gestorMenu.plugins["helpTour"].getStatus() == "fail"
    ) {
    } else {
      visiblesActivar = false;
    }
  }
  if (visiblesActivar && gestorMenu.pluginExists("configTool")) {
    if (
      gestorMenu.plugins["configTool"].getStatus() == "ready" ||
      gestorMenu.plugins["configTool"].getStatus() == "fail"
    ) {
    } else {
      visiblesActivar = false;
    }
  }
  if (visiblesActivar) {
    ordered.forEach(async function (e) {
      switch (e) {
        case "screenShoter":
          let isIdecom = window.location.origin.includes("idecom");
          if (L.Browser.webkit && !isIdecom) {
            let d = new Date();
            let n = d.getTime();
            L.simpleMapScreenshoter({
              hideElementsWithSelectors: [
                ".leaflet-top.leaflet-left",
                ".leaflet-top.leaflet-right",
                ".leaflet-bottom.leaflet-right",
                "leaflet-control-container",
                "#zoom-level",
                "#btn-logout",
                "#developerLogo"
              ],
              screenName: "mapaIGN" + n,
              position: 'topleft'
            }).addTo(mapa);

            document.getElementsByClassName(
              "leaflet-control-simpleMapScreenshoter"
            )[0].id = "screenShoter";
            let screenShoter = document.getElementById("screenShoter");
            screenShoter.classList.remove(
              "leaflet-control-simpleMapScreenshoter"
            );
            screenShoter.classList.add("leaflet-bar");
            screenShoter.children[0].id = "screenShoter-btn";
            screenShoter.title = "Captura de pantalla";

            let screenShoterBtn = document.getElementById("screenShoter-btn");
            screenShoterBtn.classList.remove(
              "leaflet-control-simpleMapScreenshoter-btn"
            );
            screenShoterBtn.innerHTML = '<i class="fas fa-camera"></i>';

            gestorMenu.plugins["screenShoter"].setStatus("visible");
          }
          break;
        case 'ZoomHome':
          // Leaflet Zoomhome plugin https://github.com/torfsen/leaflet.
          let zoomHome = L.Control.zoomHome({
            zoomHomeTitle: 'Inicio',
            zoomInTitle: 'Acercarse',
            zoomOutTitle: 'Alejarse',
            //zoomHomeIcon: 'solid fa-earth-americas',
            homeCoordinates: [app.mapConfig.center.latitude, app.mapConfig.center.longitude],
            homeZoom: app.mapConfig.zoom.initial,
            position: 'bottomright'
          });

          zoomHome.addTo(mapa);

          // Select the zoomHome icon and add 'center-flex' class
          let zoomHomeIcon = document.querySelector(".leaflet-control-zoomhome-home");
          zoomHomeIcon.classList.add("center-flex");

          // Change icon on hover to 'fa fa-home' using CSS classes
          zoomHomeIcon.classList.add("zoom-home-icon");
          zoomHomeIcon.innerHTML = `<i class="fas fa-home"></i><span class="zoom-home-text">${mapa.getZoom()}</span>`;

          // Update zoom level displayed on zoom end
          mapa.on("zoomend", () => {
            const zoomText = zoomHomeIcon.querySelector(".zoom-home-text");
            zoomText.textContent = mapa.getZoom();
          });

          gestorMenu.plugins['ZoomHome'].setStatus('visible');
          break;
        case 'FullScreen':
          const fs = new Fullscreen();
          fs.createComponent();
          break;
        case 'helpTour':
          const help = new HelpTour;
          const helpData = await help.fetchHelpTourData();
          help.createComponent(helpData);
          break;
        case 'loadLayer':
          const loadLayersModal = new LoadLayersModal();
          //modal.createModal();          //loadLayersModal.createComponent();
          break;
        case 'betterScale':
          // Leaflet BetterScale plugin
          /*
          L.control.betterscale({
            metric: true,
            imperial: false
          }).addTo(mapa);
          */
          L.control
            .scale({
              metric: true,
              imperial: false,
            })
            .addTo(mapa);
          gestorMenu.plugins["betterScale"].setStatus("visible");
          loadDeveloperLogo();
          break;
        case 'minimap':
          // Leaflet-MiniMap plugin https://github.com/Norkart/Leaflet-MiniMap
          var miniArgenmap = new L.TileLayer(argenmap._url, {
            minZoom: 0,
            maxZoom: 21,
            attribution: atrib_ign,
            tms: true
          });
          var miniMap = new L.Control.MiniMap(miniArgenmap, {
            toggleDisplay: false,
            minimized: false,
            position: 'bottomleft',
            //collapsedWidth: 32,
            //collapsedHeight: 32,
            width: 100,
            height: 100,
            strings: {
              hideText: 'Ocultar minimapa',
              showText: 'Mostrar minimapa'
            }
          }).addTo(mapa);
          gestorMenu.plugins['minimap'].setStatus('visible');
          break;
        case 'locate':
          // Leaflet-Locate plugin https://github.com/domoritz/leaflet-locatecontrol
          var locateControl = L.control.locate({
            position: "topleft",
            drawCircle: true,
            follow: true,
            setView: true,
            keepCurrentZoomLevel: true,
            markerStyle: {
              weight: 1,
              opacity: 0.8,
              fillOpacity: 0.8
            },
            circleStyle: {
              weight: 1,
              clickable: false
            },
            icon: "fa fa-crosshairs",
            metric: true,
            strings: {
              title: "Mi posición",
              popup: "Usted se encuentra a {distance} {unit} desde este punto",
              outsideMapBoundsMsg: "Se encuentra situado fuera de los límites del mapa"
            },
            locateOptions: {
              maxZoom: 21,
              watch: true,
              enableHighAccuracy: true,
              maximumAge: 10000,
              timeout: 10000
            }
          }).addTo(mapa);
          gestorMenu.plugins['locate'].setStatus('visible');
          break;
        case 'graticula':
          // Leaflet-SimpleGraticule plugin https://github.com/turban/Leaflet.Graticule
          var customGraticule = null;
          L.Control.CustomGraticule = L.Control.extend({
            onAdd: function (map) {
              var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar leaflet-control-customgraticule');
              container.title = 'Cuadrícula';
              var icon = L.DomUtil.create('a', 'leaflet-control-customgraticule');
              container.appendChild(icon);

              container.onclick = function () {
                if (customGraticule == null) {
                  //drawGrid(mapa.getZoom());
                  var options = {
                    interval: 10,
                    showshowOriginLabel: true,
                    labelsFormat: "dms",
                    zoomIntervals: [
                      { start: 2, end: 3, interval: 20 },
                      { start: 4, end: 5, interval: 5 },
                      { start: 6, end: 6, interval: 3 },
                      { start: 7, end: 8, interval: 0.8 },
                      { start: 9, end: 9, interval: 0.5 },
                      { start: 10, end: 10, interval: 0.2 },
                      { start: 11, end: 12, interval: 0.08 },
                      { start: 13, end: 13, interval: 0.02 },
                      { start: 14, end: 14, interval: 0.01 },
                      { start: 15, end: 15, interval: 0.008 },
                      { start: 16, end: 16, interval: 0.004 },
                      { start: 17, end: 20, interval: 0.001 },
                    ],
                    redraw: "move",
                  };
                  customGraticule = L.simpleGraticule(options).addTo(mapa);
                } else {
                  mapa.removeControl(customGraticule);
                  customGraticule = null;
                }
              };
              return container;
            },
          });
          L.control.customgraticule = function (opts) {
            return new L.Control.CustomGraticule(opts);
          };
          L.control.customgraticule({ position: "topleft" }).addTo(mapa);
          gestorMenu.plugins["graticula"].setStatus("visible");
          break;
        case "Measure":
          // Leaflet-Measure plugin https://github.com/ljagis/leaflet-measure
          // set decimal and thousands dividers from local configuration

          var measureControl = new L.Control.Measure({
            position: "topleft",
            primaryLengthUnit: "meters",
            secondaryLengthUnit: "kilometers",
            primaryAreaUnit: "sqmeters",
            secondaryAreaUnit: "hectares",
            collapsed: true,
            decPoint: DECIMAL_SEPARATOR,
            thousandsSep: THOUSANDS_SEPARATOR,
            activeColor: '#157DB9',
            completedColor: '#0db2e0'
          });
          measureControl.addTo(mapa);
          /* if (!L.Browser.android) {
            // replaces event listener for Measure icon in favor of click
            L.DomEvent.off(measureControl._container, 'mouseenter', measureControl._expand, measureControl);
            L.DomEvent.off(measureControl._container, 'mouseleave', measureControl._collapse, measureControl);
            L.DomEvent.on(measureControl._container, 'click', measureControl._expand, measureControl);
            L.DomEvent.on(measureControl._container, 'click', measureControl._collapse, measureControl);
          } */
          gestorMenu.plugins['Measure'].setStatus('visible');
          break;
        case "geoprocessing":
          if (loadGeoprocessing) {
            let HTMLhead = document.querySelector("head");
            HTMLhead.insertAdjacentHTML(
              "beforeend",
              '<link rel="stylesheet" type="text/css" href="src/js/components/geoprocessing/geoprocessing.css">'
            );
            HTMLhead.insertAdjacentHTML(
              "beforeend",
              '<link rel="stylesheet" type="text/css" href="src/js/components/form-builder/form-builder.css">'
            );
            HTMLhead.insertAdjacentHTML(
              "beforeend",
              '<link rel="stylesheet" href="src/js/map/plugins/leaflet/leaflet-elevation/leaflet-elevation.css">'
            );
            $.getScript(
              "src/js/plugins/geoprocess-executor/geoprocess-executor.js"
            ).done(function () {
              $.getScript(
                "src/js/components/form-builder/form-builder.js"
              ).done(function () {
                geoProcessingManager = new Geoprocessing();
                geoProcessingManager.createIcon();
                geoProcessingManager.setAvailableGeoprocessingConfig(
                  app.geoprocessing
                );
                geoProcessingManager.getProcesses().forEach((process) => {
                  if (process.geoprocess === "waterRise") {
                    // script loading test without jQuery
                    app._loadScript(
                      "./src/js/components/geoprocessing/IHeight.js"
                    );
                  }
                  geoProcessingManager.getNewProcessPrefix();
                });
              });
            });
          }
          break;
        case 'pdfPrinter':
          if (!L.Browser.safari) {
            const pdfP = new PdfPrinter();
            pdfP.createComponent();
          }
          break;
        case 'consultData':
          const consultData = new ConsultData();
          consultData.createComponent();
          break;
        case 'Draw':

          var orgReadbleDistance = L.GeometryUtil.readableArea;

          L.GeometryUtil.readableArea = function (area, isMetric, precision) {
            // adapts area unit from m2 to ha to km2 based on its size
            let _area = L.GeometryUtil.formattedNumber(area, 2) + " m²";
            if (area >= 10000 && area < 1000000) {
              _area = L.GeometryUtil.formattedNumber(area / 10000, 2) + " ha";
            }
            if (area >= 1000000) {
              _area =
                L.GeometryUtil.formattedNumber(area / 1000000, 2) + " km²";
            }
            return _area;
          };

          drawnItems = L.featureGroup().addTo(mapa);

          mapa.editableLayers = {
            marker: [],
            circle: [],
            circlemarker: [],
            rectangle: [],
            polygon: [],
            polyline: [],
            label: [],
          };

          mapa.groupLayers = {};

          mapa.drawControl = new L.Control.Draw({
            edit: {
              featureGroup: drawnItems,
              poly: {
                allowIntersection: true,
              },
            },
            draw: {
              polygon: { metric: true },
              circlemarker: { metric: true },
              polyline: { metric: true },
              circle: { metric: true },
              rectangle: { metric: true },
              label: { metric: true },
            },
            position: "topright",
          });

          L.EditToolbar.Edit.include({
            enable: function () {
              let _nodes = null,
                _complexGeom = ["polyline", "rectangle", "polygon"];
              this._featureGroup.eachLayer((lyr) => {
                let isComplex = _complexGeom.find((elem) => elem === lyr.type);
                if (isComplex) {
                  if (lyr.type === "polyline") {
                    _nodes += lyr._latlngs.length;
                  } else {
                    _nodes += lyr._latlngs[0].length;
                  }
                }
              });

              if (_nodes > 3000) {
                if (
                  window.confirm(
                    `ADVERTENCIA: Existen ${_nodes} vértices en el mapa. Esta cantidad puede afectar el funcionamiento del navegador, ocasionando que deje de responder.`
                  )
                ) {
                  !this._enabled &&
                    this._hasAvailableLayers() &&
                    (this.fire("enabled", { handler: this.type }),
                      this._map.fire(L.Draw.Event.EDITSTART, {
                        handler: this.type,
                      }),
                      L.Handler.prototype.enable.call(this),
                      this._featureGroup
                        .on("layeradd", this._enableLayerEdit, this)
                        .on("layerremove", this._disableLayerEdit, this));
                }
              } else {
                !this._enabled &&
                  this._hasAvailableLayers() &&
                  (this.fire("enabled", { handler: this.type }),
                    this._map.fire(L.Draw.Event.EDITSTART, {
                      handler: this.type,
                    }),
                    L.Handler.prototype.enable.call(this),
                    this._featureGroup
                      .on("layeradd", this._enableLayerEdit, this)
                      .on("layerremove", this._disableLayerEdit, this));
              }
            },
            _enableLayerEdit: function (t) {
              var e,
                i,
                o = t.layer || t.target || t;
              if (typeof o != "string" && !o._uneditable) {
                //to disallow editing in geoprocesses
                this._backupLayer(o),
                  this.options.poly &&
                  ((i = L.Util.extend({}, this.options.poly)),
                    (o.options.poly = i)),
                  this.options.selectedPathOptions &&
                  ((e = L.Util.extend({}, this.options.selectedPathOptions)),
                    e.maintainColor &&
                    ((e.color = o.options.color),
                      (e.fillColor = o.options.fillColor)),
                    (o.options.original = L.extend({}, o.options)),
                    (o.options.editing = e)),
                  o instanceof L.Marker
                    ? (o.editing && o.editing.enable(),
                      o.dragging.enable(),
                      o
                        .on("dragend", this._onMarkerDragEnd)
                        .on("touchmove", this._onTouchMove, this)
                        .on("MSPointerMove", this._onTouchMove, this)
                        .on("touchend", this._onMarkerDragEnd, this)
                        .on("MSPointerUp", this._onMarkerDragEnd, this))
                    : o.editing.enable();
              }
            },
            _disableLayerEdit: function (t) {
              var e = t.layer || t.target || t;
              if (typeof e != "string" && !e._uneditable) {
                //to disallow editing in geoprocesses
                (e.edited = !1),
                  e.editing && e.editing.disable(),
                  delete e.options.editing,
                  delete e.options.original,
                  this._selectedPathOptions &&
                  (e instanceof L.Marker
                    ? this._toggleMarkerHighlight(e)
                    : (e.setStyle(e.options.previousOptions),
                      delete e.options.previousOptions)),
                  e instanceof L.Marker
                    ? (e.dragging.disable(),
                      e
                        .off("dragend", this._onMarkerDragEnd, this)
                        .off("touchmove", this._onTouchMove, this)
                        .off("MSPointerMove", this._onTouchMove, this)
                        .off("touchend", this._onMarkerDragEnd, this)
                        .off("MSPointerUp", this._onMarkerDragEnd, this))
                    : e.editing.disable();
              }
            },
          });

          L.EditToolbar.Delete.include({
            revertLayers: function () {
              this._deletedLayers.eachLayer(function (t) {
                this._deletableLayers.addLayer(t),
                  mapa.editableLayers[t.type].push(t), //add layer to editableLayers from _deletableLayers
                  t.fire("revert-deleted", { layer: t });
                addLayerToDrawingsGroup(
                  t.name,
                  t,
                  "Dibujos",
                  "dibujos",
                  "dibujos"
                ); //add layer to groupLayer[dibujos] and addedLayers from _deletableLayers
              }, this);
            },
            _enableLayerDelete: function (t) {
              var e = t.layer || t.target || t;
              if (typeof e != "string" && !e._uneditable && !e.value)
                e.on("click", this._removeLayer, this);
            },
            _disableLayerDelete: function (t) {
              var e = t.layer || t.target || t;
              if (typeof e != "string" && !e._uneditable && !e.value) {
                e.off("click", this._removeLayer, this),
                  this._deletedLayers.removeLayer(e);
              }
            },
            _removeLayer: function (t) {
              var e = t.layer || t.target || t;
              let isFile = e.id
                ? e.id.includes("json") ||
                e.id.includes("zip") ||
                e.id.includes("kml")
                : false;
              if (
                typeof e != "string" &&
                !e._uneditable &&
                !e.value &&
                !isFile
              ) {
                mapa.deleteLayer(e.name), //remove geometry from groupLayer[dibujos], drawItem, editableLayers and addedLayers
                  this._deletedLayers.addLayer(e),
                  e.fire("deleted");
              }
            },
          });

          //Customizing language and text in Leaflet.draw
          L.drawLocal.draw.toolbar.finish.title = "Finalizar dibujo";
          L.drawLocal.draw.toolbar.finish.text = "Finalizar";
          L.drawLocal.draw.toolbar.actions.title = "Cancelar dibujo";
          L.drawLocal.draw.toolbar.actions.text = "Cancelar";
          L.drawLocal.draw.toolbar.undo.title =
            "Eliminar el último punto dibujado";
          L.drawLocal.draw.toolbar.undo.text = "Eliminar el último punto";
          L.drawLocal.draw.toolbar.buttons.polyline = "Dibujar una línea";
          L.drawLocal.draw.toolbar.buttons.polygon = "Dibujar un polígono";
          L.drawLocal.draw.toolbar.buttons.rectangle = "Dibujar un rectángulo";
          L.drawLocal.draw.toolbar.buttons.circle = "Dibujar un círculo";
          L.drawLocal.draw.toolbar.buttons.marker = "Dibujar un marcador";
          L.drawLocal.draw.toolbar.buttons.circlemarker =
            "Dibujar un marcador circular";
          L.drawLocal.draw.handlers.circle.tooltip.start =
            "Click y arrastra para dibujar un círculo";
          L.drawLocal.draw.handlers.circle.radius = "Radio";
          L.drawLocal.draw.handlers.circlemarker.tooltip.start =
            "Click sobre el mapa para posicionar el marcador circular";
          L.drawLocal.draw.handlers.marker.tooltip.start =
            "Click sobre el mapa para posicionar el marcador";
          L.drawLocal.draw.handlers.polygon.tooltip.start =
            "Click para comenzar a dibujar la forma";
          L.drawLocal.draw.handlers.polygon.tooltip.cont =
            "Click para continuar dibujando la forma";
          L.drawLocal.draw.handlers.polygon.tooltip.end =
            "Click en el primer punto para cerrar la forma";
          L.drawLocal.draw.handlers.polyline.error =
            "<strong>Error:</strong> los border de la forma no deben cruzarse";
          L.drawLocal.draw.handlers.polyline.tooltip.start =
            "Click para comenzar a dibujar la línea";
          L.drawLocal.draw.handlers.polyline.tooltip.cont =
            "Click para continuar dibujando la línea";
          L.drawLocal.draw.handlers.polyline.tooltip.start =
            "Click en el último punto para finalizar la línea";
          L.drawLocal.draw.handlers.rectangle.tooltip.start =
            "Click y arrastra para dibujar un rectángulo";
          L.drawLocal.draw.handlers.simpleshape.tooltip.end =
            "Soltar el mouse para finalizar el dibujo";
          L.drawLocal.edit.toolbar.actions.save.title = "Guardar cambios";
          L.drawLocal.edit.toolbar.actions.save.text = "Guardar";
          L.drawLocal.edit.toolbar.actions.cancel.title =
            "Cancelar edición, descartar todos los cambios";
          L.drawLocal.edit.toolbar.actions.cancel.text = "Cancelar";
          L.drawLocal.edit.toolbar.actions.clearAll.title =
            "Limpiar todas las capas";
          L.drawLocal.edit.toolbar.actions.clearAll.text = "Limpiar todo";
          L.drawLocal.edit.toolbar.buttons.edit = "Editar capas";
          L.drawLocal.edit.toolbar.buttons.editDisabled =
            "No hay capas para editar";
          L.drawLocal.edit.toolbar.buttons.remove = "Eliminar capas";
          L.drawLocal.edit.toolbar.buttons.removeDisabled =
            "No hay capas para eliminar";
          L.drawLocal.edit.handlers.edit.tooltip.text =
            "Arrastrar polígonos o marcadores para editar sus características";
          L.drawLocal.edit.handlers.edit.tooltip.subtext =
            "Click en cancelar para deshacer los cambios";
          L.drawLocal.edit.handlers.remove.tooltip.text =
            "Click sobre la característica a eliminar";
          mapa.addControl(mapa.drawControl);

          mapa.on("draw:drawstart", (e) => {
            currentlyDrawing = true;
          });

          mapa.on("draw:editstart", (e) => {
            currentlyDrawing = true;
          });

          mapa.on("draw:created", (e) => {
            //create layer
            const layer = e.layer;
            const type = e.layerType;

            //add information & methods to layer
            layer.options.fillColor = !layer.options.fillColor
              ? layer.options.color
              : layer.options.fillColor;
            layer.type = type;
            addInfoAndMethodsToLayer(layer);

            //add layer to
            _addLayerToAllGroups(layer);

            //aditional settings
            let geoJSON = layer.getGeoJSON();
            layer.data = { geoJSON };

            if (isSelectionDrawingActive) {
              layer.id =
                "selection_" +
                Math.floor(Math.random() * (999 - 100 + 1) + 100).toString();
              isSelectionDrawingActive = false;
            } else {
              addLayerToDrawingsGroup(
                layer.name,
                layer,
                "Dibujos",
                "dibujos",
                "dibujos"
              );
            }

            mapa.methodsEvents["add-layer"].forEach((method) =>
              method(mapa.editableLayers)
            );

            if (layer.type === "marker") {
              //Default marker styles
              layer.options.borderWidth = DEFAULT_MARKER_STYLES.borderWidth;
              layer.options.borderColor = DEFAULT_MARKER_STYLES.borderColor;
              layer.options.fillColor = DEFAULT_MARKER_STYLES.fillColor;
            }

            if (geoProcessingManager) {
              geoProcessingManager.updateLayerSelect(layer.name, true);
            }
          });

          mapa.on("draw:edited", (e) => {
            var layers = e.layers;
            //Each layer recently edited..
            /* layers.eachLayer(function (layer) {
              mapa.checkLayersInDrawedGeometry(layer, layer.type);
            }); */
            mapa.methodsEvents["edit-layer"].forEach((method) =>
              method(mapa.editableLayers)
            );
          });

          mapa.on("draw:deleted", function (e) {
            var layers = e.layers;
            /* Object.values(layers._layers).forEach(deletedLayer => {
              const lyrIdx = mapa.editableLayers[deletedLayer.type].findIndex((lyr) => deletedLayer.name == lyr.name);
              if (lyrIdx >= 0) {
                let layerSection;
                addedLayers.forEach(lyr => {
                  if (lyr.id === deletedLayer.id) {
                    let index = addedLayers.indexOf(lyr);
                    if (index > -1) {
                      layerSection = lyr.section;
                      addedLayers.splice(index, 1);
                      updateNumberofLayers(layerSection);
                      showTotalNumberofLayers();
                    }
                  }
                });
                mapa.editableLayers[deletedLayer.type].splice(lyrIdx, 1);
                deleteLayerFromMenu(deletedLayer);
              }
            }); */

            /*if(geoProcessingManager){
              let layerName = Object.values(layers._layers)[0].name;
              geoProcessingManager.updateLayerSelect(layerName, false);
            }*/

            //mapa.methodsEvents['delete-layer'].forEach(method => method(mapa.editableLayers));
          });

          deleteLayerFromMenu = (deletedLayer) => {
            // Delete layers entries from menu if exists
            Object.entries(mapa.groupLayers).forEach(([k, v]) => {
              v.forEach((e) => {
                if (e === deletedLayer.name) {
                  deleteLayerGeometry(k, true);
                }
              });
            });
          };

          mapa.on("draw:drawstop", (e) => {
            setTimeout(() => {
              currentlyDrawing = false;
              // if(perfilTopografico.isActive){
              // 	// reset profile status
              // 	perfilTopografico.isActive = false;
              // }
            }, 300);
          });

          mapa.on("draw:editstop", (e) => {
            currentlyDrawing = false;
          });

          mapa.on("zoomend", (e) => {
            let contextPopup = null;
            const contextMenu = new ContextMenu();
            $(".context-quehay").slideUp();
          });

          mapa.on("dragend", (e) => {
            let contextPopup = null;
            const contextMenu = new ContextMenu();
            $(".context-quehay").slideUp();
          });

          mapa.on("click", (e) => {
            let contextPopup = null;
            const contextMenu = new ContextMenu();
            mapa.closePopup(contextPopup);
            $(".context-quehay").slideUp();
          });

          mapa.on("contextmenu", (e) => {
            var capa = "";
            $.each(mapa._layers, function (ml) {
              $.each(mapa._layers[ml], function (v) {
                if (mapa._layers[ml]._url != undefined) {
                  capa = mapa._layers[ml]._url;
                }
              });
            });

            var zoom = e.target._zoom;
            var count = 0;

            var imagen = "";
            $.each(e.target._zoomBoundLayers, function (clave, valor) {
              $.each(valor._tiles, function (key, value) {
                if (count == 0) {
                  imagen = value.el.currentSrc;
                }
                count++;
              });
            });

            let contextPopup = null;
            const contextMenu = new ContextMenu();

            const lng = e.latlng.lng.toFixed(6);
            const lat = e.latlng.lat.toFixed(6);

            contextMenu.createOption({
              isDisabled: false,
              text: `<div title="Copiar" style="cursor: default"><span><b id="copycoords" class="non-selectable-text">${lat}, ${lng}</b></span> <i class="far fa-copy" aria-hidden="true"></i></div>`,
              onclick: (option) => {
                mapa.closePopup(contextPopup);
                copytoClipboard(`${lat}, ${lng}`);
              },
            });

            contextMenu.createOption({
              isDisabled: false,
              text: "Mas información",
              onclick: (option) => {
                mapa.closePopup(contextPopup);
                $("#search_bar")
                  .val(lat + "," + lng)
                  .focus();
              },
            });

            if (L.Browser.mobile) {
              // check if running in a mobile device
              contextMenu.createOption({
                isDisabled: false,
                text: "Abrir en...",
                onclick: (option) => {
                  mapa.closePopup(contextPopup);
                  let _url = `geo:${lat},${lng}`;
                  window.open(_url);
                },
              });
            }

            /* if (Object.values(drawnItems._layers).length != 0) {
              contextMenu.createOption({
                isDisabled: false,
                text: 'Descargar todas las capas',
                onclick: (option) => {
                  mapa.closePopup(contextPopup);
                  mapa.downloadAllActiveLayer();
                }
              });
            } */

            /* contextMenu.createOption({
              isDisabled: false,
              text: "Share",
              onclick: (option) => {
                mapa.closePopup(contextPopup);
                let _url = `${window.location.protocol}//${window.location.host}${window.location.pathname}${window.location.search}`;
                window.open(_url);
                }
              }); */

            /* contextMenu.createOption({
              isDisabled: false,
              text: "Save",
              onclick: () => {
                mapa.closePopup(contextPopup);
                let markedId = 0;
                (!app.markers) ? app.markers = {} : markedId = Object.keys(app.markers).length++;
              	
                let marker = window.prompt("Set marker name","name...");
                let _markerName;
                (marker == null || marker == "")
                ? _markerName = `${lat},${lng}`
                : _markerName = marker;

                app.markers[markedId] = { 
                  name: _markerName,
                  location: [lat,lng] 
                };
                new UserMessage(`${lat},${lng} saved on Markers`, true, "information");
              },
              }); */

            contextMenu.createOption({
              isDisabled: false,
              text: "Agregar marcador",
              onclick: (option) => {
                let name = "marker_";

                if (mapa.editableLayers["marker"].length === 0) {
                  name += "1";
                } else {
                  const lastLayerName =
                    mapa.editableLayers["marker"][
                      mapa.editableLayers["marker"].length - 1
                    ].name;
                  name += parseInt(lastLayerName.split("_")[1]) + 1;
                }

                let geojsonMarker = {
                  type: "Feature",
                  properties: {},
                  geometry: { type: "Point", coordinates: [lng, lat] },
                };

                let result = mapa.createLayerFromGeoJSON(
                  geojsonMarker,
                  "addedMarker_" + name
                );
                addLayerToAllGroups(result, "addedMarker_" + name);

                mapa.closePopup(contextPopup);
              },
            });

            if (gestorMenu.getActiveBasemap() === "esri_imagery") {
              contextMenu.createOption({
                isDisabled: false,
                text: "Datos de imagen satelital",
                onclick: (option) => {
                  mapa.closePopup(contextPopup);
                  mapa.esriImagery(lat, lng, zoom);
                },
              });
            }

            contextPopup = L.popup({
              closeButton: false,
              className: "context-popup",
            })
              .setLatLng(e.latlng)
              .setContent(contextMenu.menu);
            mapa.openPopup(contextPopup);
          });

          mapa.esriImagery = (lat, lng, zoom) => {
            //Close
            if (document.getElementById("esriwrapper")) {
              document.getElementById("esriwrapper").remove();
            }

            //Main Wrapper
            const wrapper = document.createElement("div");
            wrapper.id = "esriwrapper";
            wrapper.style =
              "top: 150px; left: 600px; position: absolute; background-color: white !important";
            wrapper.innerHTML = "Datos de imagen satelital";

            //Close Button
            let btncloseWrapper = document.createElement("a");
            btncloseWrapper.id = "btnclose-wrapper";
            btncloseWrapper.href = "javascript:void(0)";
            btncloseWrapper.style =
              "float:right; color:#676767; overflow-y:auto;";
            btncloseWrapper.innerHTML = '<i class="fa fa-times"></i>';
            btncloseWrapper.onclick = () => {
              wrapper.remove();
            };
            wrapper.appendChild(btncloseWrapper);

            //Data
            let imgData = new Fechaimagen(lat, lng, zoom).area;
            let esriTable = document.createElement("table");
            esriTable.id = "esriTable";
            esriTable.style = "width: 300px;text-align:left;align=left";
            esriTable.innerHTML = "No existen datos a este nivel de zoom.";

            let copytoClipboard = `<a onclick=
								"copytoClipboard(\'Imagen satelital tomada el ${imgData.date}. Una resolución espacial de ${imgData.resolution} m. La Exactitud es de ${imgData.accuracy} m y el sensor es ${imgData.sensor_texto}. El proveedor es ${imgData.provider_texto} y el producto ${imgData.product}. \');" 
								href="#"><i class="far fa-copy" aria-hidden="true"></i> Copiar datos</a>`;

            if (imgData != "") {
              esriTable.innerHTML =
                copytoClipboard +
                `<tr><td>Fecha:</td><td>${imgData.date}</td></tr>
								<tr><td title="Relación de metros por lado de pixel">Resolución espacial:</td><td>${imgData.resolution} m</td></tr>
								<tr><td>Exactitud:</td><td>${imgData.accuracy} m</td></tr>
								<tr><td title="Misión aérea o constelación satelital">Sensor:</td><td>${imgData.sensor}</td></tr>
								<tr><td>Proveedor:</td><td>${imgData.provider}</td></tr>
								<tr><td>Producto:</td><td>${imgData.product}</td></tr>
								<tr><td>Zoom mínimo:</td><td>${imgData.minZoom}</td></tr>
								<tr><td>Zoom máximo:</td><td>${imgData.maxZoom}</td></tr>`;
            }

            //Info Wrapper
            const esriInfo = document.createElement("div");
            esriInfo.id = "esriInfo";
            esriInfo.appendChild(esriTable);
            wrapper.appendChild(esriInfo);

            document.body.appendChild(wrapper);
            $("#esriwrapper").draggable({
              scroll: false,
              cancel: "#esriInfo",
              containment: "body",
            });
          };

          mapa.addMethodToEvent = (method, event) => {
            mapa.methodsEvents[event].push(method);
          };

          /**
           * Centers the map view to the extent of a given layer.
           * @param {L.Layer|Object} layer - A Leaflet layer or GeoJSON object.
           * @returns {UserMessage|undefined} - Returns a UserMessage object with an error message if the layer is not available, otherwise returns undefined.
           */
          mapa.centerLayer = (layer) => {
            if (!layer) {
              return new UserMessage(
                "La capa ya no se encuentra disponible.",
                true,
                "error"
              );
            }
            if (layer.hasOwnProperty("_leaflet_id")) {
              layer = layer.toGeoJSON();
            }
            const bbox = turf.bbox(layer);
            mapa.fitBounds([
              [bbox[1], bbox[0]],
              [bbox[3], bbox[2]],
            ]);
          };

          mapa.addContextMenuToLayer = (layer) => {
            let contextPopup = null;

            const contextMenu = new ContextMenu();

            contextMenu.createOption({
              isDisabled: true,
              text: "Ver información",
              onclick: (option) => {
                if (!option.disabled) {
                  mapa.closePopup(contextPopup);
                }
              },
            });

            contextMenu.createOption({
              isDisabled: false,
              text: "Editar estilos",
              onclick: (option) => {
                mapa.closePopup(contextPopup);
                if (document.getElementById("editContainer")) {
                  document.getElementById("editContainer").remove();
                }

                const wrapper = document.createElement("div");
                wrapper.id = "editContainer";

                let btncloseWrapper = document.createElement("a");
                btncloseWrapper.id = "btnclose-wrapper";
                btncloseWrapper.href = "javascript:void(0)";
                btncloseWrapper.innerHTML = '<i class="fa fa-times"></i>';
                btncloseWrapper.onclick = () => {
                  wrapper.remove();
                };

                wrapper.appendChild(btncloseWrapper);
                wrapper.appendChild(mapa.createEditStylePopup(layer));
                document.body.appendChild(wrapper);
                $("#editContainer").draggable({
                  scroll: false,
                  containment: "#mapa",
                });
              },
            });

            contextMenu.createOption({
              isDisabled: false,
              text: "Acercar",
              onclick: (option) => {
                mapa.closePopup(contextPopup);
                if (
                  layer.type === "marker" ||
                  layer.type === "circlemarker" ||
                  layer.type === "label"
                ) {
                  mapa.fitBounds(L.latLngBounds([layer.getLatLng()]));
                } else {
                  mapa.fitBounds(layer.getBounds());
                }
              },
            });

            if (
              layer.type !== "marker" &&
              layer.type !== "circlemarker" &&
              layer.type !== "polyline" &&
              layer.type !== "label"
            ) {
              contextMenu.createOption({
                isDisabled: false,
                text: "Usar como filtro de capas",
                onclick: (option) => {
                  mapa.closePopup(contextPopup);
                  addSelectionLayersMenuToLayer(layer);
                },
              });
            }

            /* contextMenu.createOption({
              isDisabled: true,
              text: 'Ocultar geometría',
              onclick: (option) => {
                if (!option.disabled) {
                  mapa.closePopup(contextPopup);
                  mapa.hideLayer(layer.name);
                }
              }
            }); */

            contextMenu.createOption({
              isDisabled: false,
              text: "Descargar geometría",
              onclick: (option) => {
                mapa.closePopup(contextPopup);
                layer.downloadGeoJSON();
              },
            });

            /* if (Object.values(drawnItems._layers).length != 0) {
              contextMenu.createOption({
                isDisabled: false,
                text: 'Descargar todas la capas',
                onclick: (option) => {
                  mapa.closePopup(contextPopup);
                  mapa.downloadAllActiveLayer();
                }
              });
            } */

            contextMenu.createOption({
              isDisabled: false,
              text: "Medir",
              onclick: (option) => {
                mapa.closePopup(contextPopup);
                mapa.measurementsWrapper(layer);
              },
            });

            contextMenu.createOption({
              isDisabled: false,
              text: STRINGS.delete_geometry,
              onclick: (option) => {
                mapa.closePopup(contextPopup);
                if (
                  typeof layer != "string" &&
                  !layer._uneditable &&
                  !layer.value
                ) {
                  mapa.deleteLayer(layer.name, layer.id);
                }
              },
            });

            layer.on("contextmenu", (e) => {
              contextPopup = L.popup({
                closeButton: false,
                className: "context-popup",
              })
                .setLatLng(e.latlng)
                .setContent(contextMenu.menu);
              mapa.openPopup(contextPopup);
              L.DomEvent.stopPropagation(e);
            });

            L.DomEvent.on(contextMenu, "click", function (e) {
              L.DomEvent.stopPropagation(e);
            });

            /* L.DomEvent.on(editStylePopup, 'click', function (e) {
              L.DomEvent.stopPropagation(e);
            }); */
          };

          mapa.measurementsWrapper = (layer) => {
            if (document.getElementById("measurementWrapper")) {
              document.getElementById("measurementWrapper").remove();
            }

            const wrapper = document.createElement("div");
            wrapper.id = "measurementWrapper";
            wrapper.style = "top: 100px; left: 300px; position: absolute;";
            wrapper.innerHTML = "Medidas";

            let btncloseWrapper = document.createElement("a");
            btncloseWrapper.id = "btnclose-wrapper";
            btncloseWrapper.href = "javascript:void(0)";
            btncloseWrapper.style =
              "float:right; color:#676767; overflow-y:auto;";
            btncloseWrapper.innerHTML = '<i class="fa fa-times"></i>';
            btncloseWrapper.onclick = () => {
              wrapper.remove();
            };
            wrapper.appendChild(btncloseWrapper);

            const measurement = document.createElement("div");
            measurement.id = "measurementInfo";
            wrapper.appendChild(measurement);

            document.body.appendChild(wrapper);
            $("#measurementWrapper").draggable({
              scroll: false,
              cancel: "#measurementInfo",
              containment: "body",
            });

            mapa.getMeasurementsInfo(layer);
          };

          mapa.getMeasurementsInfo = (layer) => {
            //TODO:usar funciones de calculo para extender

            const type =
              layer.type[0].toUpperCase() + layer.type.slice(1).toLowerCase();
            mapa.showMeasurements("Tipo", type, "");
            try {
              if (layer.type === "polyline") {
                const longitude = mapa.getLongitude(layer).toFixed(3);
                const boundingBox = mapa.getBoundingBox(layer);
                mapa.showMeasurements("Longitud", longitude, "km");
                mapa.showMeasurements("BoundingBox", boundingBox, "");
              }
              if (layer.type === "polygon" || layer.type === "rectangle") {
                const area = mapa.getAreaPolygon(layer).toFixed(7);
                const centroid = mapa.getCentroidPolygon(layer);
                const perimeter = mapa.getPerimeter(layer).toFixed(3);
                const boundingBox = mapa.getBoundingBox(layer);
                mapa.showMeasurements("Área", area, "km²");
                mapa.showMeasurements("Centroide", centroid, "");
                mapa.showMeasurements("Perímetro", perimeter, "km");
                mapa.showMeasurements("BoundingBox", boundingBox, "");
              }
              if (layer.type === "circle") {
                const radius = (layer.getRadius() / 1000).toFixed(3);
                const centroid = mapa.getCentroidCircle(layer);
                const cricumference = (
                  mapa.getCricumference(layer) / 1000
                ).toFixed(3);
                const area = (mapa.getAreaCircle(layer) / 1000000).toFixed(7);
                const boundingBox = mapa.getBoundingBox(layer);
                mapa.showMeasurements("Área", area, "km²");
                mapa.showMeasurements("Centroide", centroid, "");
                mapa.showMeasurements("Circunferencia", cricumference, "km");
                mapa.showMeasurements("Radio", radius, "km");
                mapa.showMeasurements("BoundingBox", boundingBox, "");
              }
              if (
                layer.type === "marker" ||
                layer.type === "circlemarker" ||
                layer.type === "label"
              ) {
                const centroid = mapa.getCentroidCircle(layer);
                mapa.showMeasurements("Centroide", centroid, "");
              }
            } catch (error) {
              console.error(error);
            }
          };

          mapa.showMeasurements = (name, measurement, unit) => {
            const wrapper = document.getElementById("measurementInfo"),
              newDiv = document.createElement("tr"),
              infoName = document.createElement("td");
            infoName.innerHTML = `${name}:`;
            infoDesc = document.createElement("td");
            infoDesc.innerHTML = `${measurement} ${unit}`;

            newDiv.appendChild(infoName);
            newDiv.appendChild(infoDesc);
            wrapper.appendChild(newDiv);
          };

          mapa.getLongitude = (layer) => {
            let geojson = layer.getGeoJSON(),
              longitude = turf.length(geojson);
            return longitude;
          };

          mapa.getPerimeter = (layer) => {
            let geojson = layer.getGeoJSON(),
              perimeter = turf.length(geojson);
            return perimeter;
          };

          mapa.getAreaPolygon = (layer) => {
            let geojson = layer.getGeoJSON(),
              area = turf.area(geojson) / 1000000;
            return area;
          };

          mapa.getCentroidPolygon = (layer) => {
            let geojson = layer.getGeoJSON(),
              centroid0 = turf.centroid(geojson).geometry.coordinates[0],
              centroid1 = turf.centroid(geojson).geometry.coordinates[1],
              resultado = `${centroid1.toFixed(6)}, ${centroid0.toFixed(6)}`;
            return resultado;
          };

          mapa.getCentroidCircle = (layer) => {
            let lat = layer.getLatLng().lat,
              lng = layer.getLatLng().lng,
              resultado = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            return resultado;
          };

          mapa.getAreaCircle = (layer) => {
            let radius = layer.getRadius(),
              area = Math.PI * (radius * radius);
            return area;
          };

          mapa.getCricumference = (layer) => {
            let radius = layer.getRadius(),
              cricumference = Math.PI * radius;
            return cricumference;
          };

          mapa.getBoundingBox = (layer) => {
            let north = layer.getBounds().getNorth().toFixed(8),
              east = layer.getBounds().getEast().toFixed(8),
              south = layer.getBounds().getSouth().toFixed(8),
              west = layer.getBounds().getWest().toFixed(8),
              boundingBox = document.createElement("div");
            boundingBox.innerHTML = `<div>northEast: ${north}, ${east}<br>southWest: ${south}, ${west}</div>`;
            return boundingBox.innerHTML;
          };

          mapa.createEditStylePopup = (layer) => {
            const container = document.createElement("div");
            container.className = "edit-style-popup-container";

            //Lines
            const lineSection = document.createElement("div");
            lineSection.className = "section-popup";

            //Title
            const title = document.createElement("p");
            title.className = "section-title non-selectable-text";
            title.textContent = "Línea";
            lineSection.appendChild(title);

            //Opacity
            const opacityInputDiv1 = document.createElement("div");
            opacityInputDiv1.className = "section-item";
            const opacityInput1 = document.createElement("input");
            opacityInput1.className = "section-item-input";
            opacityInput1.id = "opacity-input-1";
            opacityInput1.type = "range";
            opacityInput1.min = 0;
            opacityInput1.max = 1;
            opacityInput1.step = 0.01;
            opacityInput1.value = layer.options.opacity;
            opacityInput1.addEventListener("change", (e) => {
              layer.setStyle({ opacity: opacityInput1.value });
            });
            opacityInput1.addEventListener("input", (e) => {
              layer.setStyle({ opacity: opacityInput1.value });
            });
            const opacityLabel1 = document.createElement("label");
            opacityLabel1.setAttribute("for", "opacity-input-1");
            opacityLabel1.className = "non-selectable-text";
            opacityLabel1.innerHTML = "Opacidad";
            opacityInputDiv1.appendChild(opacityLabel1);
            opacityInputDiv1.appendChild(opacityInput1);
            lineSection.appendChild(opacityInputDiv1);

            //Weight
            const weightInputDiv = document.createElement("div");
            weightInputDiv.className = "section-item";
            const weightInput = document.createElement("input");
            weightInput.className = "section-item-input";
            weightInput.id = "weight-input";
            weightInput.type = "range";
            weightInput.min = 0;
            weightInput.max = 10;
            weightInput.step = 1;
            weightInput.value = layer.options.weight;
            weightInput.addEventListener("change", (e) => {
              layer.setStyle({
                weight: weightInput.value,
                opacity: opacityInput1.value,
                fillOpacity: opacityInput2.value,
              });
            });
            weightInput.addEventListener("input", (e) => {
              layer.setStyle({
                weight: weightInput.value,
                opacity: opacityInput1.value,
                fillOpacity: opacityInput2.value,
              });
            });
            const weightLabel = document.createElement("label");
            weightLabel.setAttribute("for", "weight-input");
            weightLabel.className = "non-selectable-text";
            weightLabel.innerHTML = "Grosor";
            weightInputDiv.appendChild(weightLabel);
            weightInputDiv.appendChild(weightInput);
            lineSection.appendChild(weightInputDiv);

            //Dash
            const dashArrayInputDiv = document.createElement("div");
            dashArrayInputDiv.className = "section-item";
            const dashArrayInput = document.createElement("input");
            dashArrayInput.className = "section-item-input";
            dashArrayInput.id = "dash-input";
            dashArrayInput.type = "range";
            dashArrayInput.min = 0;
            dashArrayInput.max = 50;
            dashArrayInput.step = 1;
            dashArrayInput.value = layer.options.dashArray
              ? layer.options.dashArray
              : 0;
            dashArrayInput.addEventListener("change", (e) => {
              layer.setStyle({
                dashArray: dashArrayInput.value,
              });
            });
            dashArrayInput.addEventListener("input", (e) => {
              layer.setStyle({
                dashArray: dashArrayInput.value,
              });
            });
            const dashLabel = document.createElement("label");
            dashLabel.setAttribute("for", "dash-input");
            dashLabel.innerHTML = "Discontinuidad";
            dashArrayInputDiv.appendChild(dashLabel);
            dashArrayInputDiv.appendChild(dashArrayInput);
            lineSection.appendChild(dashArrayInputDiv);

            //Join
            const joinSelectDiv = document.createElement("div");
            joinSelectDiv.className = "section-item";
            const joinSelect = document.createElement("select");
            joinSelect.className = "section-item-input";
            joinSelect.id = "join-select";
            const joinOptions = ["round", "bevel", "miter", "miter-clip"];
            joinOptions.forEach((optionName) => {
              const option = document.createElement("option");
              option.value = optionName;
              option.text = optionName;
              option.selected = layer.lineJoin === optionName;
              joinSelect.appendChild(option);
            });
            joinSelect.addEventListener("change", (e) => {
              layer.setStyle({
                lineJoin: joinSelect.value,
              });
            });
            const joinLabel = document.createElement("label");
            joinLabel.setAttribute("for", "join-select");
            joinLabel.innerHTML = "Unión";
            joinSelectDiv.appendChild(joinLabel);
            joinSelectDiv.appendChild(joinSelect);
            //Should be visible if geometry only is rectangle, polygon or polyline
            if (
              layer.type === "rectangle" ||
              layer.type === "polygon" ||
              layer.type === "polyline"
            ) {
              lineSection.appendChild(joinSelectDiv);
            }

            //Cap
            const capSelectDiv = document.createElement("div");
            capSelectDiv.className = "section-item";
            const capSelect = document.createElement("select");
            capSelect.className = "section-item-input";
            capSelect.id = "cap-select";
            const capOptions = ["round", "butt", "square"];
            capOptions.forEach((optionName) => {
              const option = document.createElement("option");
              option.value = optionName;
              option.text = optionName;
              option.selected = layer.lineCap === optionName;
              capSelect.appendChild(option);
            });
            capSelect.addEventListener("change", (e) => {
              layer.setStyle({
                lineCap: capSelect.value,
              });
            });
            const capLabel = document.createElement("label");
            capLabel.setAttribute("for", "cap-select");
            capLabel.innerHTML = "Terminación";
            capSelectDiv.appendChild(capLabel);
            capSelectDiv.appendChild(capSelect);
            //Should be visible if geometry only is polyline
            if (layer.type === "polyline")
              lineSection.appendChild(capSelectDiv);

            //Color
            const colorInputDiv1 = document.createElement("div");
            colorInputDiv1.className = "section-item";
            const colorInput1 = document.createElement("input");
            colorInput1.className = "section-item-input";
            colorInput1.id = "color-input-1";
            colorInput1.type = "color";
            colorInput1.value = layer.options.color;
            colorInput1.addEventListener("change", (e) => {
              layer.setStyle({ color: colorInput1.value });
            });
            colorInput1.addEventListener("input", (e) => {
              layer.setStyle({ color: colorInput1.value });
            });
            const colorLabel1 = document.createElement("label");
            colorLabel1.setAttribute("for", "color-input-1");
            colorLabel1.innerHTML = "Color";
            colorInputDiv1.appendChild(colorLabel1);
            colorInputDiv1.appendChild(colorInput1);
            lineSection.appendChild(colorInputDiv1);

            //Fill
            const fillSection = document.createElement("div");
            fillSection.className = "section-popup";

            //Title
            const title2 = document.createElement("p");
            title2.className = "section-title";
            title2.textContent = "Relleno";
            fillSection.appendChild(title2);

            //Color
            const colorInputDiv2 = document.createElement("div");
            colorInputDiv2.className = "section-item";
            const colorInput2 = document.createElement("input");
            colorInput2.className = "section-item-input";
            colorInput2.id = "color-input-2";
            colorInput2.type = "color";
            colorInput2.value = layer.options.fillColor
              ? layer.options.fillColor
              : layer.options.color;
            colorInput2.addEventListener("change", (e) => {
              layer.setStyle({ fillColor: colorInput2.value });
            });
            colorInput2.addEventListener("input", (e) => {
              layer.setStyle({ fillColor: colorInput2.value });
            });
            const colorLabel2 = document.createElement("label");
            colorLabel2.setAttribute("for", "color-input-2");
            colorLabel2.innerHTML = "Color";
            colorInputDiv2.appendChild(colorLabel2);
            colorInputDiv2.appendChild(colorInput2);
            fillSection.appendChild(colorInputDiv2);

            //Opacity
            const opacityInputDiv2 = document.createElement("div");
            opacityInputDiv2.className = "section-item";
            const opacityInput2 = document.createElement("input");
            opacityInput2.className = "section-item-input";
            opacityInput2.id = "opacity-input-2";
            opacityInput2.type = "range";
            opacityInput2.min = 0;
            opacityInput2.max = 1;
            opacityInput2.step = 0.01;
            opacityInput2.value = layer.options.fillOpacity;
            opacityInput2.addEventListener("change", (e) => {
              layer.setStyle({ fillOpacity: opacityInput2.value });
            });
            opacityInput2.addEventListener("input", (e) => {
              layer.setStyle({ fillOpacity: opacityInput2.value });
            });
            const opacityLabel2 = document.createElement("label");
            opacityLabel2.setAttribute("for", "opacity-input-2");
            opacityLabel2.innerHTML = "Opacidad";
            opacityInputDiv2.appendChild(opacityLabel2);
            opacityInputDiv2.appendChild(opacityInput2);
            fillSection.appendChild(opacityInputDiv2);

            //Circle
            const circleSection = document.createElement("div");
            circleSection.className = "section-popup";

            //Title
            const title3 = document.createElement("p");
            title3.className = "section-title";
            title3.textContent = "Círculo";
            circleSection.appendChild(title3);

            const radiusInputDiv = document.createElement("div");
            radiusInputDiv.className = "section-item";
            const radiusInput = document.createElement("input");
            radiusInput.className = "section-item-input";
            radiusInput.id = "radius-input";
            radiusInput.type = "range";
            radiusInput.min = 1;
            radiusInput.max = 1250000;
            radiusInput.step = 0.1;
            radiusInput.value = layer.options.radius;
            radiusInput.addEventListener("change", (e) => {
              layer.setRadius(radiusInput.value);
            });
            radiusInput.addEventListener("input", (e) => {
              layer.setRadius(radiusInput.value);
            });
            const radiusLabel = document.createElement("label");
            radiusLabel.setAttribute("for", "radius-input");
            radiusLabel.innerHTML = "Radio";
            radiusInputDiv.appendChild(radiusLabel);
            radiusInputDiv.appendChild(radiusInput);
            circleSection.appendChild(radiusInputDiv);

            //Marker
            const markerSection = document.createElement("div");
            markerSection.className = "section-popup";

            if (layer.type === "marker") {
              //Title
              const title4 = document.createElement("p");
              title4.className = "section-title";
              title4.textContent = "Marcador";
              markerSection.appendChild(title4);

              //Enable
              const enableMarkerInputDiv = document.createElement("div");
              enableMarkerInputDiv.className = "section-item";
              const enableMarkerInput = document.createElement("input");
              enableMarkerInput.className = "section-item-input";
              enableMarkerInput.id = "enable-marker-input";
              enableMarkerInput.type = "checkbox";
              enableMarkerInput.checked =
                layer.options.hasOwnProperty("customMarker");
              enableMarkerInput.addEventListener("change", (e) => {
                weightInput2.disabled = !enableMarkerInput.checked;
                colorInput3.disabled = !enableMarkerInput.checked;
                colorInput4.disabled = !enableMarkerInput.checked;
                downloadBtn1.classList.add(
                  enableMarkerInput.checked
                    ? "download-btn-active"
                    : "download-btn-disable"
                );
                downloadBtn1.classList.remove(
                  enableMarkerInput.checked
                    ? "download-btn-disable"
                    : "download-btn-active"
                );
                downloadBtn2.classList.add(
                  enableMarkerInput.checked
                    ? "download-btn-active"
                    : "download-btn-disable"
                );
                downloadBtn2.classList.remove(
                  enableMarkerInput.checked
                    ? "download-btn-disable"
                    : "download-btn-active"
                );
                if (!enableMarkerInput.checked) {
                  layer.setIcon(new L.Icon.Default());
                } else {
                  const weight = weightInput2.value;
                  const borderColor = colorInput3.value;
                  const fillColor = colorInput4.value;
                  mapa.setIconToMarker(layer, borderColor, fillColor, weight);
                }
              });
              const enableMarkerLabel = document.createElement("label");
              enableMarkerLabel.setAttribute("for", "enable-marker-input");
              enableMarkerLabel.innerHTML = "Personalizado";
              enableMarkerInputDiv.appendChild(enableMarkerLabel);
              enableMarkerInputDiv.appendChild(enableMarkerInput);
              markerSection.appendChild(enableMarkerInputDiv);

              //Opacity
              const opacityInputDiv3 = document.createElement("div");
              opacityInputDiv3.className = "section-item";
              const opacityInput3 = document.createElement("input");
              opacityInput3.className = "section-item-input";
              opacityInput3.id = "opacity-input-3";
              opacityInput3.type = "range";
              opacityInput3.min = 0;
              opacityInput3.max = 1;
              opacityInput3.step = 0.01;
              opacityInput3.value = layer.options.opacity;
              opacityInput3.addEventListener("change", (e) => {
                layer.setOpacity(opacityInput3.value);
              });
              opacityInput3.addEventListener("input", (e) => {
                layer.setOpacity(opacityInput3.value);
              });
              const opacityLabel3 = document.createElement("label");
              opacityLabel3.setAttribute("for", "opacity-input-3");
              opacityLabel3.innerHTML = "Opacidad";
              opacityInputDiv3.appendChild(opacityLabel3);
              opacityInputDiv3.appendChild(opacityInput3);
              markerSection.appendChild(opacityInputDiv3);

              //Weight
              const weightInputDiv2 = document.createElement("div");
              weightInputDiv2.className = "section-item";
              const weightInput2 = document.createElement("input");
              weightInput2.className = "section-item-input";
              weightInput2.id = "weight-input-2";
              weightInput2.type = "range";
              weightInput2.min = 0;
              weightInput2.max = 3.2;
              weightInput2.step = 0.1;
              weightInput2.value = layer.options.borderWidth;
              weightInput2.disabled = !enableMarkerInput.checked;
              weightInput2.addEventListener("change", (e) => {
                const weight = weightInput2.value;
                const borderColor = colorInput3.value;
                const fillColor = colorInput4.value;
                changeMarkerStyles(layer, weight, borderColor, fillColor);
              });
              weightInput2.addEventListener("input", (e) => {
                const weight = weightInput2.value;
                const borderColor = colorInput3.value;
                const fillColor = colorInput4.value;
                changeMarkerStyles(layer, weight, borderColor, fillColor);
              });
              const weightLabel2 = document.createElement("label");
              weightLabel2.setAttribute("for", "weight-input-2");
              weightLabel2.className = "non-selectable-text";
              weightLabel2.innerHTML = "Anchura del borde";
              weightInputDiv2.appendChild(weightLabel2);
              weightInputDiv2.appendChild(weightInput2);
              markerSection.appendChild(weightInputDiv2);

              //Color
              const colorInputDiv3 = document.createElement("div");
              colorInputDiv3.className = "section-item";
              const colorInput3 = document.createElement("input");
              colorInput3.className = "section-item-input";
              colorInput3.id = "color-input-3";
              colorInput3.type = "color";
              colorInput3.value = layer.options.borderColor;
              colorInput3.disabled = !enableMarkerInput.checked;
              colorInput3.addEventListener("change", (e) => {
                const weight = weightInput2.value;
                const borderColor = colorInput3.value;
                const fillColor = colorInput4.value;
                changeMarkerStyles(layer, weight, borderColor, fillColor);
              });
              colorInput3.addEventListener("input", (e) => {
                const weight = weightInput2.value;
                const borderColor = colorInput3.value;
                const fillColor = colorInput4.value;
                changeMarkerStyles(layer, weight, borderColor, fillColor);
              });
              const colorLabel3 = document.createElement("label");
              colorLabel3.setAttribute("for", "color-input-3");
              colorLabel3.innerHTML = "Color del borde";
              colorInputDiv3.appendChild(colorLabel3);
              colorInputDiv3.appendChild(colorInput3);
              markerSection.appendChild(colorInputDiv3);

              //Color
              const colorInputDiv4 = document.createElement("div");
              colorInputDiv4.className = "section-item";
              const colorInput4 = document.createElement("input");
              colorInput4.className = "section-item-input";
              colorInput4.id = "color-input-4";
              colorInput4.type = "color";
              colorInput4.value = layer.options.fillColor;
              colorInput4.disabled = !enableMarkerInput.checked;
              colorInput4.addEventListener("change", (e) => {
                const weight = weightInput2.value;
                const borderColor = colorInput3.value;
                const fillColor = colorInput4.value;
                changeMarkerStyles(layer, weight, borderColor, fillColor);
              });
              colorInput4.addEventListener("input", (e) => {
                const weight = weightInput2.value;
                const borderColor = colorInput3.value;
                const fillColor = colorInput4.value;
                changeMarkerStyles(layer, weight, borderColor, fillColor);
              });
              const colorLabel4 = document.createElement("label");
              colorLabel4.setAttribute("for", "color-input-4");
              colorLabel4.innerHTML = "Color del relleno";
              colorInputDiv4.appendChild(colorLabel4);
              colorInputDiv4.appendChild(colorInput4);
              markerSection.appendChild(colorInputDiv4);

              //Download
              const downloadDiv = document.createElement("div");
              downloadDiv.className = "section-item";

              const downloadTitle = document.createElement("label");
              downloadTitle.className = "";
              downloadTitle.innerHTML = "Descargar como";

              const downloadBtnsDiv = document.createElement("div");
              downloadBtnsDiv.className = "download-item";

              const downloadBtn1 = document.createElement("div");
              downloadBtn1.className = "popup-btn download-btn";
              downloadBtn1.innerHTML =
                '<p class="non-selectable-text" style="font-weight: bold; margin: 0;">SVG</p>';
              downloadBtn1.onclick = () => {
                if (enableMarkerInput.checked) {
                  const weight = weightInput2.value;
                  const borderColor = colorInput3.value;
                  const fillColor = colorInput4.value;
                  mapa.downloadMarker("svg", borderColor, fillColor, weight);
                }
              };
              downloadBtnsDiv.appendChild(downloadBtn1);

              const downloadBtn2 = document.createElement("div");
              downloadBtn2.className = "popup-btn download-btn";
              downloadBtn2.innerHTML =
                '<p class="non-selectable-text" style="font-weight: bold; margin: 0;">PNG</p>';
              downloadBtn2.onclick = () => {
                if (enableMarkerInput.checked) {
                  const weight = weightInput2.value;
                  const borderColor = colorInput3.value;
                  const fillColor = colorInput4.value;
                  mapa.downloadMarker("png", borderColor, fillColor, weight);
                }
              };
              downloadBtnsDiv.appendChild(downloadBtn2);

              downloadBtn1.classList.add(
                enableMarkerInput.checked
                  ? "download-btn-active"
                  : "download-btn-disable"
              );
              downloadBtn1.classList.remove(
                enableMarkerInput.checked
                  ? "download-btn-disable"
                  : "download-btn-active"
              );
              downloadBtn2.classList.add(
                enableMarkerInput.checked
                  ? "download-btn-active"
                  : "download-btn-disable"
              );
              downloadBtn2.classList.remove(
                enableMarkerInput.checked
                  ? "download-btn-disable"
                  : "download-btn-active"
              );

              downloadDiv.appendChild(downloadTitle);
              downloadDiv.appendChild(downloadBtnsDiv);
              markerSection.appendChild(downloadDiv);
            }

            //Labels
            const labelSection = document.createElement("div");
            labelSection.className = "section-popup";

            if (layer.type === "label") {
              //Title
              const title4 = document.createElement("p");
              title4.className = "section-title";
              title4.textContent = "Etiqueta";
              labelSection.appendChild(title4);

              //Enable
              const enableLabelInputDiv = document.createElement("div");
              enableLabelInputDiv.className = "section-item";
              const enableLabelInput = document.createElement("input");
              enableLabelInput.className = "section-item-input";
              enableLabelInput.id = "enable-marker-input";
              enableLabelInput.type = "checkbox";
              enableLabelInput.checked =
                layer.options.hasOwnProperty("customLabel");
              enableLabelInput.addEventListener("change", (e) => {
                weightInput2.disabled = !enableLabelInput.checked;
                colorInput3.disabled = !enableLabelInput.checked;
                colorInput4.disabled = !enableLabelInput.checked;
                colorInput5.disabled = !enableLabelInput.checked;
              });
              const enableLabelTag = document.createElement("label");
              enableLabelTag.setAttribute("for", "enable-marker-input");
              enableLabelTag.innerHTML = "Personalizado";
              enableLabelInputDiv.appendChild(enableLabelTag);
              enableLabelInputDiv.appendChild(enableLabelInput);
              labelSection.appendChild(enableLabelInputDiv);

              //Opacity
              const opacityInputDiv3 = document.createElement("div");
              opacityInputDiv3.className = "section-item";
              const opacityInput3 = document.createElement("input");
              opacityInput3.className = "section-item-input";
              opacityInput3.id = "opacity-input-3";
              opacityInput3.type = "range";
              opacityInput3.min = 0;
              opacityInput3.max = 1;
              opacityInput3.step = 0.01;
              opacityInput3.value = layer.options.opacity;
              opacityInput3.addEventListener("change", (e) => {
                layer.setOpacity(opacityInput3.value);
                layer.options.opacity = opacityInput3.value;
              });
              opacityInput3.addEventListener("input", (e) => {
                layer.setOpacity(opacityInput3.value);
              });
              const opacityLabel3 = document.createElement("label");
              opacityLabel3.setAttribute("for", "opacity-input-3");
              opacityLabel3.innerHTML = "Opacidad";
              opacityInputDiv3.appendChild(opacityLabel3);
              opacityInputDiv3.appendChild(opacityInput3);
              labelSection.appendChild(opacityInputDiv3);

              //Weight
              const weightInputDiv2 = document.createElement("div");
              weightInputDiv2.className = "section-item";
              const weightInput2 = document.createElement("input");
              weightInput2.className = "section-item-input";
              weightInput2.id = "weight-input-2";
              weightInput2.type = "range";
              weightInput2.min = 0;
              weightInput2.max = 3.2;
              weightInput2.step = 0.1;
              weightInput2.value = 2;
              weightInput2.disabled = !enableLabelInput.checked;
              weightInput2.addEventListener("input", (e) => {
                const borderWidth = weightInput2.value;
                layer.options.icon.options.html.style.borderWidth =
                  borderWidth + "px";
                layer.options.weight = borderWidth;
              });
              const weightLabel2 = document.createElement("label");
              weightLabel2.setAttribute("for", "weight-input-2");
              weightLabel2.className = "non-selectable-text";
              weightLabel2.innerHTML = "Anchura del borde";
              weightInputDiv2.appendChild(weightLabel2);
              weightInputDiv2.appendChild(weightInput2);
              labelSection.appendChild(weightInputDiv2);

              //Border color
              const colorInputDiv3 = document.createElement("div");
              colorInputDiv3.className = "section-item";
              const colorInput3 = document.createElement("input");
              colorInput3.className = "section-item-input";
              colorInput3.id = "color-input-3";
              colorInput3.type = "color";
              colorInput3.value = "#000000";
              colorInput3.disabled = !enableLabelInput.checked;
              colorInput3.addEventListener("input", (e) => {
                const borderColor = colorInput3.value;
                layer.options.icon.options.html.style.setProperty(
                  "border-color",
                  borderColor,
                  "important"
                );
                layer.options.borderColor = borderColor;
              });
              const colorLabel3 = document.createElement("label");
              colorLabel3.setAttribute("for", "color-input-3");
              colorLabel3.innerHTML = "Color del borde";
              colorInputDiv3.appendChild(colorLabel3);
              colorInputDiv3.appendChild(colorInput3);
              labelSection.appendChild(colorInputDiv3);

              //Fill color
              const colorInputDiv4 = document.createElement("div");
              colorInputDiv4.className = "section-item";
              const colorInput4 = document.createElement("input");
              colorInput4.className = "section-item-input";
              colorInput4.id = "color-input-4";
              colorInput4.type = "color";
              colorInput4.value = "#ffffff";
              colorInput4.disabled = !enableLabelInput.checked;
              colorInput4.addEventListener("input", (e) => {
                const fillColor = colorInput4.value;
                layer.options.icon.options.html.style.setProperty(
                  "background-color",
                  fillColor,
                  "important"
                );
                layer.options.fillColor = fillColor;
              });
              const colorLabel4 = document.createElement("label");
              colorLabel4.setAttribute("for", "color-input-4");
              colorLabel4.innerHTML = "Color de relleno";
              colorInputDiv4.appendChild(colorLabel4);
              colorInputDiv4.appendChild(colorInput4);
              labelSection.appendChild(colorInputDiv4);

              //Remove background color
              const colorInputDiv6 = document.createElement("div");
              colorInputDiv6.className = "section-item";
              const transparentLabel = document.createElement("input");
              transparentLabel.className = "section-item-input";
              transparentLabel.id = "remove-bg-input";
              transparentLabel.type = "button";
              transparentLabel.value = "Quitar fondo";
              transparentLabel.onclick = function () {
                layer.options.icon.options.html.style.backgroundColor =
                  "transparent";
                layer.options.fillColor = "transparent";
              };
              colorInputDiv6.appendChild(transparentLabel);
              labelSection.appendChild(colorInputDiv6);

              //Text color
              const colorInputDiv5 = document.createElement("div");
              colorInputDiv5.className = "section-item";
              const colorInput5 = document.createElement("input");
              colorInput5.className = "section-item-input";
              colorInput5.id = "color-input-5";
              colorInput5.type = "color";
              colorInput5.value = "#000000";
              colorInput5.disabled = !enableLabelInput.checked;
              colorInput5.addEventListener("input", (e) => {
                const textColor = colorInput5.value;
                layer.options.icon.options.html.style.setProperty(
                  "color",
                  textColor,
                  "important"
                );
                layer.options.color = textColor;
              });
              const colorLabel5 = document.createElement("label");
              colorLabel5.setAttribute("for", "color-input-5");
              colorLabel5.innerHTML = "Color del texto";
              colorInputDiv5.appendChild(colorLabel5);
              colorInputDiv5.appendChild(colorInput5);
              labelSection.appendChild(colorInputDiv5);
            }

            switch (layer.type) {
              case "marker":
                {
                  container.appendChild(markerSection);
                }
                break;
              case "label":
                {
                  container.appendChild(labelSection);
                }
                break;
              case "circlemarker":
                {
                  container.appendChild(lineSection);
                  container.appendChild(fillSection);
                }
                break;
              case "circle":
                {
                  container.appendChild(lineSection);
                  container.appendChild(fillSection);
                  container.appendChild(circleSection);
                }
                break;
              case "polyline":
                {
                  container.appendChild(lineSection);
                }
                break;
              case "polygon":
                {
                  container.appendChild(lineSection);
                  container.appendChild(fillSection);
                }
                break;
              case "rectangle":
                {
                  container.appendChild(lineSection);
                  container.appendChild(fillSection);
                }
                break;
            }
            return container;
          };

          mapa.addLayerToPopUp = (container, activeLayer) => {
            let layerName;
            activeLayer.name
              ? (layerName = activeLayer.name)
              : (layerName = activeLayer);

            const inputDiv = document.createElement("div");
            inputDiv.className = "active-layer";
            inputDiv.id = "container_" + layerName;
            inputDiv.style.display = "flex";
            inputDiv.style.flexDirection = "row";
            inputDiv.style.justifyContent = "flex-start";
            inputDiv.style.alignItems = "center";
            inputDiv.style.marginBottom = "2px";
            inputDiv.style.padding = "4px";
            inputDiv.style.borderRadius = "3px";
            inputDiv.style.transition = "0.2s";
            inputDiv.onclick = () => {
              onClickActiveLayer(layerName);
            };

            const input = document.createElement("input");
            input.type = "checkbox";
            input.id = layerName;
            input.name = layerName;
            input.value = layerName;
            input.style.margin = "0px 3px 0px 0px";
            input.onclick = () => {
              onClickActiveLayer(layerName);
            };

            const label = document.createElement("label");
            if (gestorMenu.getLayerData(layerName).title) {
              label.innerHTML = gestorMenu.getLayerData(layerName).title;
            } else if (activeLayer.layer.title) {
              label.innerHTML = activeLayer.layer.title;
            } else {
              label.innerHTML = activeLayer.name;
            }
            label.className = "active-layer-label";
            label.setAttribute("for", layerName);
            label.style.marginBottom = "0px";
            label.style.overflow = "hidden";
            label.style.textOverflow = "ellipsis";
            label.onclick = () => {
              onClickActiveLayer(layerName);
            };

            inputDiv.appendChild(input);
            inputDiv.appendChild(label);
            container.appendChild(inputDiv);
          };

          mapa.activeLayerHasChanged = (layer, addToList) => {
            const activeLayersDiv = document.getElementById("activeLayers");
            if (!activeLayersDiv) return;

            const activeLayersDivChilds = Array.from(
              activeLayersDiv.childNodes
            );
            const containerIdx = activeLayersDivChilds.findIndex(
              (layerDiv) => layerDiv.id.split("container_")[1] === layer
            );
            if (containerIdx >= 0 && !addToList) {
              activeLayersDiv.removeChild(activeLayersDivChilds[containerIdx]);
            } else if (containerIdx === -1 && addToList) {
              mapa.addLayerToPopUp(activeLayersDiv, layer);
            }

            const showInfoBtn = document.getElementById("btn-show-info");
            if (gestorMenu.getActiveLayersWithoutBasemap().length > 0) {
              showInfoBtn.classList.remove("btn-disabled");
              showInfoBtn.classList.add("btn-active");
            } else {
              showInfoBtn.classList.remove("btn-active");
              showInfoBtn.classList.add("btn-disabled");
            }
          };

          mapa.createPopUp = (layer) => {
            const popUpDiv = document.createElement("div");
            popUpDiv.style.alignItems = "center";
            popUpDiv.style.alignContent = "center";

            const title = document.createElement("p");
            title.className = "active-layer-label";
            title.innerHTML = "Capas Activas";
            title.style.fontSize = 14;
            title.style.fontWeight = "bold";
            title.style.margin = "0px 0px 5px 3px";
            popUpDiv.appendChild(title);

            const selectedLayersDiv = document.createElement("div");
            selectedLayersDiv.id = "activeLayers";
            selectedLayersDiv.style.padding = "3px";
            selectedLayersDiv.style.overflowY = "auto";
            selectedLayersDiv.style.maxHeight = "250px";

            const inputDiv = document.createElement("div");
            inputDiv.className = "active-layer";
            inputDiv.style.display = "flex";
            inputDiv.style.flexDirection = "row";
            inputDiv.style.justifyContent = "flex-start";
            inputDiv.style.alignItems = "center";
            inputDiv.style.marginBottom = "2px";
            inputDiv.style.padding = "4px";
            inputDiv.style.borderRadius = "3px";
            inputDiv.style.transition = "0.2s";
            inputDiv.onclick = () => {
              onClickAllActiveLayers();
            };

            const input = document.createElement("input");
            input.type = "checkbox";
            input.id = "seleccionar_capas";
            input.name = "Seleccionar Capas";
            input.value = "Seleccionar Capas";
            input.style.margin = "0px 3px 0px 0px";
            input.onclick = () => {
              onClickAllActiveLayers();
            };

            const label = document.createElement("label");
            label.className = "active-layer-label";
            label.innerHTML = "Seleccionar Todas";
            label.setAttribute("for", "seleccionar_capas");
            label.style.marginBottom = "0px";
            label.style.overflow = "hidden";
            label.style.textOverflow = "ellipsis";
            label.onclick = () => {
              onClickAllActiveLayers();
            };

            inputDiv.appendChild(input);
            inputDiv.appendChild(label);
            selectedLayersDiv.appendChild(inputDiv);

            let consultLayers = [];
            getAllActiveLayers().forEach((lyr) => {
              if (lyr.type != "dibujos") {
                consultLayers.push(lyr);
              }
            });

            consultLayers.forEach((activeLayer) => {
              mapa.addLayerToPopUp(selectedLayersDiv, activeLayer);
            });

            const popUpBtn = document.createElement("div");
            popUpBtn.className = "popup-btn";
            popUpBtn.setAttribute("id", "btn-show-info");
            popUpBtn.onclick = () => {
              if (consultLayers.length > 0)
                mapa.showInfoLayer(layer.name, false);
            };
            popUpBtn.innerHTML =
              '<p class="popup-btn-text">Consultar capas seleccionadas en área</p>';
            popUpBtn.classList.add(
              consultLayers.length === 0 ? "btn-disabled" : "btn-active"
            );

            popUpDiv.appendChild(selectedLayersDiv);
            popUpDiv.appendChild(popUpBtn);

            const popUpBtn2 = document.createElement("div");
            popUpBtn2.className = "popup-btn";
            popUpBtn2.setAttribute("id", "btn-show-prev-info");
            popUpBtn2.onclick = () => {
              if (Object.keys(layer.data).length > 0)
                mapa.showInfoLayer(layer.name, true);
            };
            popUpBtn2.innerHTML =
              '<p class="popup-btn-text">Ver última consulta</p>';
            popUpBtn2.classList.add(
              Object.keys(layer.data).length === 0
                ? "btn-disabled"
                : "btn-active"
            );

            popUpDiv.appendChild(popUpBtn2);

            return popUpDiv;
          };

          mapa.showInfoLayer = (layerName, showLastSearch) => {
            const type = layerName.split("_")[0];
            const layer = mapa.editableLayers[type].find(
              (lyr) => lyr.name === layerName
            );

            if (showLastSearch) {
              for (const dataName in layer.data) {
                let table = new Datatable(layer.data[dataName], layer.coords);
                createTabulator(table, dataName);
              }
              layer.closePopup();
              return;
            }

            const selectedLayersInputs = Array.from(
              document
                .getElementById("activeLayers")
                .getElementsByTagName("input")
            );
            const selectedLayers = [];
            selectedLayersInputs.forEach((selectedLayer) => {
              if (selectedLayer.checked) selectedLayers.push(selectedLayer.id);
            });

            layer.closePopup();

            mapa.checkLayersInDrawedGeometry(layer, selectedLayers);
          };

          mapa.getEditableLayers = (type) => {
            return mapa.editableLayers.hasOwnProperty(type)
              ? mapa.editableLayers[type]
              : mapa.editableLayers;
          };

          mapa.getEditableLayer = (name) => {
            const type = name.split("_")[0];

            return mapa.editableLayers.hasOwnProperty(type)
              ? mapa.editableLayers[type].find((lyr) => lyr.name === name)
              : null;
          };

          mapa.checkLayersInDrawedGeometry = (layer, selectedLayers) => {
            const filteredActiveLayers = getAllActiveLayers().filter(
              (activeLayer) => {
                return selectedLayers.find(
                  (selectedLayer) => selectedLayer === activeLayer.name
                )
                  ? true
                  : false;
              }
            );

            let coords = getGeometryCoords(layer);

            //Clear all old data
            layer.data = {};
            if (filteredActiveLayers.length > 0) {
              filteredActiveLayers.forEach((activeLayer) => {
                if (!activeLayer.layer.host) {
                  let arrayData = [],
                    selecCoords = layer.getGeoJSON(),
                    within;

                  turf.featureEach(activeLayer.layer, function (feature) {
                    within = turf.booleanIntersects(feature, selecCoords);
                    if (within) {
                      arrayData.push(feature);
                    }
                  });

                  let arrayFeature = turf.featureCollection(arrayData);

                  let data = arrayFeature;
                  layer.data[activeLayer.name] = data;
                  layer.coords = coords;

                  //Load data in table
                  const table = new Datatable(data, coords);
                  createTabulator(table, activeLayer.name);
                } else {
                  getLayerDataByWFS(coords, layer.type, activeLayer)
                    .then((data) => {
                      if (!data) {
                        throw new Error("Error fetching to server");
                      }
                      layer.data[activeLayer.name] = data;
                      layer.coords = coords;

                      //Load data in table
                      const table = new Datatable(data, coords);
                      createTabulator(table, activeLayer.name);
                    })
                    .catch((err) => {
                      console.error(err);
                    });
                }
              });
            }
          };

          mapa.getLayerGeoJSON = (layer) => {
            const type = layer.split("_")[0];
            return mapa.editableLayers.hasOwnProperty(type)
              ? mapa.editableLayers[type]
                .find((lyr) => lyr.name === layer)
                .toGeoJSON()
              : null;
          };

          mapa.showLayer = (layer) => {
            const type = layer.split("_")[0];
            if (mapa.editableLayers.hasOwnProperty(type)) {
              const lyr = mapa.editableLayers[type].find(
                (lyr) => lyr.name === layer
              );
              if (lyr) {
                drawnItems.addLayer(lyr);
              }
            }
          };

          mapa.hideLayer = (layer) => {
            Object.values(drawnItems._layers).forEach((lyr) => {
              if (layer === lyr.name) {
                drawnItems.removeLayer(lyr);
                return;
              }
            });
          };

          mapa.showGroupLayer = (group) => {
            if (mapa.groupLayers.hasOwnProperty(group)) {
              mapa.groupLayers[group].forEach((layer) => {
                mapa.showLayer(layer);
              });
            }
          };

          mapa.hideGroupLayer = (group) => {
            if (mapa.groupLayers.hasOwnProperty(group))
              mapa.groupLayers[group].forEach((layer) => {
                mapa.hideLayer(layer);
              });
          };

          /**
           * This function deletes a given layer from the map and related data structures.
           * @param {string} layerName - The name of the layer to delete.
           */
          mapa.deleteLayer = (layerName, id) => {
            const type = layerName.split("_")[0]; // Extract layer type from layerName

            const idx = mapa.editableLayers[type].findIndex(
              (lyr) => lyr.name === layerName
            ); // Find the index of the layer to delete in the editableLayers array

            // If the layer exists in the editableLayers array, remove it from the map and editableLayers array
            if (idx >= 0) {
              drawnItems.removeLayer(mapa.editableLayers[type][idx]);
              mapa.editableLayers[type].splice(idx, 1);
            }

            // Remove the layer from all groupLayers arrays
            Object.values(mapa.groupLayers).forEach((group) => {
              const idx = group.findIndex((lyr) => lyr === layerName);
              if (idx >= 0) {
                group.splice(idx, 1);
              }
            });

            // Remove the layer from the addedLayers array, if it exists
            addedLayers.forEach((lyr) => {
              const idx = lyr.layer.features?.findIndex(
                (e) => e.properties.name === layerName
              );
              if (geoProcessingManager)
                geoProcessingManager.updateLayerSelect(layerName, false);
              if (idx >= 0) {
                lyr.layer.features.splice(idx, 1);
                // If the addedLayers array is now empty, remove it from the addedLayers array and update the UI
              } else {
                delFileItembyID(id);
              }
              if (lyr.layer.features && lyr.layer.features.length === 0) {
                addedLayers.splice(addedLayers.indexOf(lyr), 1);
              }
              updateNumberofLayers(lyr.section);
            });

            mapa.methodsEvents["delete-layer"].forEach((method) =>
              method(mapa.editableLayers)
            );
            controlSeccionGeom();
            showTotalNumberofLayers();
          };

          mapa.removeGroup = (group, deleteLayers) => {
            if (mapa.groupLayers.hasOwnProperty(group)) {
              if (deleteLayers) {
                const layersArr = [...mapa.groupLayers[group]];

                layersArr.forEach((layer) => {
                  mapa.deleteLayer(layer, group);
                });
              }
              delete mapa.groupLayers[group];
            }
          };

          mapa.addLayerToGroup = (layer, group) => {
            let feature = null;
            feature =
              typeof layer === "object"
                ? (feature = layer.name)
                : (feature = layer);
            if (mapa.groupLayers.hasOwnProperty(group)) {
              if (
                mapa.groupLayers[group].find(
                  (layerName) => layerName === feature
                )
              ) {
                return; // feature already exist in group
              }
              mapa.groupLayers[group].push(feature);
              return;
            }
            mapa.groupLayers[group] = [];
            mapa.groupLayers[group].push(feature);
          };

          mapa.removeLayerFromGroup = (layer, group) => {
            if (mapa.groupLayers.hasOwnProperty(group)) {
              const layerIdx = mapa.groupLayers[group].findIndex(
                (layerName) => layerName === layer
              );
              if (layerIdx >= 0) mapa.groupLayers[group].splice(layerIdx, 1);
            }
          };

          /**
           * Downloads a GeoJSON file for the given layer.
           * @param {Object} layer - The layer to download GeoJSON for.
           */
          mapa.downloadLayerGeoJSON = (layer) => {
            const geoJSON = layer.toGeoJSON(); // Convert layer to GeoJSON.

            // Extract style options from layer options.
            const styleOptions = { ...layer.options };

            if (layer.type === "label") {
              geoJSON.properties.text = layer.data.properties.text;
            }

            const fileName = layer.name + ".geojson"; // Create file name.

            // Create GeoJSON string with features and style options.
            const dataStr =
              "data:text/json;charset=utf-8," +
              encodeURIComponent(
                JSON.stringify({
                  type: "FeatureCollection",
                  features: [
                    {
                      ...geoJSON,
                      properties: {
                        ...geoJSON.properties,
                        styles: styleOptions,
                        type: layer.type,
                      },
                    },
                  ],
                })
              );

            // Create download link and click it to download the file.
            const downloadANode = document.createElement("a");
            downloadANode.setAttribute("href", dataStr);
            downloadANode.setAttribute("download", fileName);
            document.body.appendChild(downloadANode);
            downloadANode.click();
            downloadANode.remove();
          };

          /**
           * Downloads the GeoJSON file for the specified group of layers.
           * @param {string} id - The ID of the group of layers.
           * @param {string} fileName - The name of the file to download.
           */
          mapa.downloadMultiLayerGeoJSON = (id, fileName) => {
            const jsonToDownload = { type: "FeatureCollection", features: [] }; // Create an object to store the GeoJSON data of all the layers in the group.
            let cont = 0; // Counter used to iterate through the added layers.

            for (const layerName of mapa.groupLayers[id]) {
              // Iterate through each layer in the group and add its GeoJSON data to the jsonToDownload object.
              // Get the GeoJSON data of the layer.
              const layer = mapa.getEditableLayer(layerName, true);
              const geoJSON = layer.toGeoJSON();

              // Add the layer options to the GeoJSON properties.
              const addedLayer = addedLayers.find((layer) => layer.id === id);
              if (addedLayer) {
                geoJSON.properties.styles = { ...layer.options };
                geoJSON.properties.type = layer.type;
                if (layer.value) geoJSON.properties.value = layer.value;
                geoJSON.properties = {
                  ...geoJSON.properties,
                  ...addedLayer.layer.features[cont].properties,
                };
                if (layer.type === "label") {
                  geoJSON.properties.styles.icon.options.html =
                    layer.options.icon.options.html.outerHTML;
                  geoJSON.properties.text = layer.data.properties.text;
                }
                cont++;
              }
              jsonToDownload.features.push(geoJSON); // Add the GeoJSON data to the jsonToDownload object.
            }
            // An array of objects that define the geoprocessing types and their IDs.
            const geoProcessingTypes = [
              {
                id: geoProcessingManager.GEOPROCESS.contour,
                process: "contour",
              },
              {
                id: geoProcessingManager.GEOPROCESS.waterRise,
                process: "waterRise",
              },
              { id: geoProcessingManager.GEOPROCESS.buffer, process: "buffer" },
              {
                id: geoProcessingManager.GEOPROCESS.elevationProfile,
                process: "elevationProfile",
              },
            ];

            // Determine the geoprocessing type of the layer group, if it has one.
            const addedLayer = addedLayers.find((layer) => layer.id === id);
            const geoProcessingType = geoProcessingTypes.find(
              (type) => addedLayer && addedLayer.id.includes(type.id)
            );
            if (geoProcessingType)
              jsonToDownload.process = geoProcessingType.process;

            // Create a data URI for the GeoJSON data and download the file.
            const dataStr =
              "data:text/json;charset=utf-8," +
              encodeURIComponent(JSON.stringify(jsonToDownload));
            const downloadANode = document.createElement("a");
            downloadANode.setAttribute("href", dataStr);
            downloadANode.setAttribute("download", fileName + ".geojson");
            document.body.appendChild(downloadANode);
            downloadANode.click();
            downloadANode.remove();
          };

          mapa.downloadAllActiveLayer = () => {
            let layername = "group_" + counterLayer;
            counterLayer++;
            const jsonToDownload = {
              type: "FeatureCollection",
              features: [],
            };

            Object.values(drawnItems._layers).forEach((lyr) => {
              const layer = mapa.getEditableLayer(lyr.name, true);
              const geoJSON = layer.toGeoJSON();
              const styleOptions = { ...layer.options };
              const labelText = { ...geoJSON.properties.Text };
              geoJSON.properties.styles = styleOptions;
              //geoJSON.properties.Text = labelText;
              geoJSON.properties.type = layer.type;
              layer.value ? (geoJSON.properties.value = layer.value) : 0;
              jsonToDownload.features.push(geoJSON);
            });

            const dataStr =
              "data:text/json;charset=utf-8," +
              encodeURIComponent(JSON.stringify(jsonToDownload));
            const downloadANode = document.createElement("a");
            downloadANode.setAttribute("href", dataStr);
            downloadANode.setAttribute("download", layername + ".geojson");
            document.body.appendChild(downloadANode);
            downloadANode.click();
            downloadANode.remove();
          };

          mapa.createMarker = (color1, color2, borderWidth) => {
            const svgNS = "http://www.w3.org/2000/svg";

            const marker = document.createElementNS(svgNS, "svg");
            marker.setAttribute("width", 54);
            marker.setAttribute("height", 82);
            marker.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            marker.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

            const defs = document.createElementNS(svgNS, "defs");
            marker.appendChild(defs);

            const borderGradient = document.createElementNS(
              svgNS,
              "linearGradient"
            );
            borderGradient.setAttribute("id", "strokeGradient");
            borderGradient.setAttribute("x1", "0");
            borderGradient.setAttribute("x2", "0");
            borderGradient.setAttribute("y1", "0");
            borderGradient.setAttribute("y2", "1");

            const stop1 = document.createElementNS(svgNS, "stop");
            stop1.setAttribute("offset", "0");
            stop1.setAttribute("stop-color", color1);
            borderGradient.appendChild(stop1);

            const stop2 = document.createElementNS(svgNS, "stop");
            stop2.setAttribute("offset", "1");
            stop2.setAttribute("stop-color", getDarkerColorTone(color1, -0.3));
            borderGradient.appendChild(stop2);

            const fillGradient = document.createElementNS(
              svgNS,
              "linearGradient"
            );
            fillGradient.setAttribute("id", "fillGradient");
            fillGradient.setAttribute("x1", "0");
            fillGradient.setAttribute("x2", "0");
            fillGradient.setAttribute("y1", "0");
            fillGradient.setAttribute("y2", "1");

            const stop3 = document.createElementNS(svgNS, "stop");
            stop3.setAttribute("offset", "0");
            stop3.setAttribute("stop-color", color2);
            fillGradient.appendChild(stop3);

            const stop4 = document.createElementNS(svgNS, "stop");
            stop4.setAttribute("offset", "1");
            stop4.setAttribute("stop-color", getDarkerColorTone(color2, -0.3));
            fillGradient.appendChild(stop4);

            defs.appendChild(borderGradient);
            defs.appendChild(fillGradient);

            const g = document.createElementNS(svgNS, "g");
            marker.appendChild(g);

            const path = document.createElementNS(svgNS, "path");
            path.setAttribute(
              "d",
              "m27.3 3.1c-13.694 0-25.092 11.382-25.092 23.732 0 5.556 3.258 12.616 5.613 17.492l19.388 35.744 19.296-35.744c2.354-4.876 5.704-11.582 5.704-17.492 0-12.35-11.215-23.732-24.908-23.732zm0 14.31c5.383.034 9.748 4.244 9.748 9.42s-4.365 9.326-9.748 9.358c-5.383-.034-9.748-4.18-9.748-9.358 0-5.176 4.365-9.386 9.748-9.42z"
            );
            path.setAttribute("stroke", `url(#strokeGradient)`);
            path.setAttribute("fill", `url(#fillGradient)`);
            path.setAttribute("stroke-linecap", "round");
            path.setAttribute("stroke-width", borderWidth);
            g.appendChild(path);

            return marker;
          };

          mapa.convertMarkerToPng = async (markerSvg) => {
            let svgString = new XMLSerializer().serializeToString(markerSvg);
            let canvas = document.createElement("canvas");
            canvas.width = 54;
            canvas.height = 82;
            let ctx = canvas.getContext("2d");
            let DOMURL = self.URL || self.webkitURL || self;
            let img = new Image();
            let svg = new Blob([svgString], {
              type: "image/svg+xml;charset=utf-8",
            });
            let url = DOMURL.createObjectURL(svg);
            return new Promise((resolve, reject) => {
              img.onload = function () {
                ctx.drawImage(img, 0, 0);
                let png = canvas.toDataURL("image/png", 1);
                markerSvg.innerHTML = '<img src="' + png + '"/>';
                DOMURL.revokeObjectURL(png);
                resolve(png);
              };
              img.src = url;
            });
          };

          mapa.downloadMarker = async (format, color1, color2, borderWidth) => {
            const markerSVG = mapa.createMarker(color1, color2, borderWidth);
            let downloadLink = document.createElement("a");
            switch (format) {
              case "svg":
                {
                  let svgData = markerSVG.outerHTML;
                  let svgBlob = new Blob([svgData], {
                    type: "image/svg+xml;charset=utf-8",
                  });
                  let svgUrl = URL.createObjectURL(svgBlob);
                  downloadLink.href = svgUrl;
                  downloadLink.download = "marker.svg";
                }
                break;
              case "png":
                {
                  const markerPNG = await mapa.convertMarkerToPng(markerSVG);
                  downloadLink.href = markerPNG;
                  downloadLink.download = "marker.png";
                }
                break;
            }
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
          };

          mapa.setIconToMarker = async (layer, color1, color2, borderWidth) => {
            const markerSVG = mapa.createMarker(color1, color2, borderWidth);
            const markerPNG = await mapa.convertMarkerToPng(markerSVG);
            const icon = L.icon({
              iconUrl: markerPNG,
              shadowUrl: "src/styles/images/marker-shadow.png",
              popupAnchor: [0, -41], //[1, -33]
              iconSize: [25, 41],
              iconAnchor: [12.5, 41],
            });
            layer.setIcon(icon);
          };

          mapa.createLayerFromGeoJSON = (geoJSON, groupName) => {
            if (mapa.groupLayers[groupName] === undefined) {
              mapa.groupLayers[groupName] = [];
            }

            if (geoJSON.type === "FeatureCollection") {
              let collection = [];
              geoJSON.features.forEach((geoJSON) => {
                //create layer
                let layer = createLayerByType(geoJSON, groupName);
                //add information & methods to layer
                addInfoAndMethodsToLayer(layer);
                collection.push(layer);
              });
              return collection;
            }

            if (geoJSON.type === "Feature") {
              //create layer
              let layer = createLayerByType(geoJSON, groupName);
              //add information & methods to layer
              addInfoAndMethodsToLayer(layer);
              return layer;
            }
          };

          function addInfoAndMethodsToLayer(layer) {
            let type = layer.type;
            layer.name = nameForLayer(type);
            consultDataBtnClose
              ? (layer.activeData = false)
              : (layer.activeData = true);

            mapa.editableLayers[type].push(layer);

            layer.on({
              click: getVectorData,
            });
            layer.getGeoJSON = () => {
              return mapa.getLayerGeoJSON(layer.name);
            };
            layer.downloadGeoJSON = () => {
              mapa.downloadLayerGeoJSON(
                mapa.editableLayers[type].find((lyr) => lyr.name === layer.name)
              );
            };
            mapa.addContextMenuToLayer(layer);
          }

          gestorMenu.plugins["Draw"].setStatus("visible");
          break;
        default:
          break;
      }
    });
  }
  switch (unordered) {
    case "leaflet":
      if (selectedBasemap.hasOwnProperty("key")) {
        const interval = setInterval(() => {
          if (L.tileLayer.bing) {
            window.clearInterval(interval);
            currentBaseMap = L.tileLayer
              .bing({
                bingMapsKey: selectedBasemap.key,
                culture: "es_AR",
                minZoom: selectedBasemap.hasOwnProperty("zoom")
                  ? selectedBasemap.zoom.min
                  : DEFAULT_MIN_ZOOM_LEVEL,
                maxZoom: selectedBasemap.hasOwnProperty("zoom")
                  ? selectedBasemap.zoom.max
                  : DEFAULT_MAX_ZOOM_LEVEL,
                minNativeZoom: selectedBasemap.hasOwnProperty("zoom")
                  ? selectedBasemap.zoom.nativeMin
                  : DEFAULT_MIN_NATIVE_ZOOM_LEVEL,
                maxNativeZoom: selectedBasemap.hasOwnProperty("zoom")
                  ? selectedBasemap.zoom.nativeMax
                  : DEFAULT_MAX_NATIVE_ZOOM_LEVEL,
                attribution: selectedBasemap.attribution,
              })
              .addTo(mapa);
          }
        }, 100);
      } else {
        currentBaseMap = L.tileLayer(selectedBasemap.host, {
          minZoom: selectedBasemap.hasOwnProperty("zoom")
            ? selectedBasemap.zoom.min
            : DEFAULT_MIN_ZOOM_LEVEL,
          maxZoom: selectedBasemap.hasOwnProperty("zoom")
            ? selectedBasemap.zoom.max
            : DEFAULT_MAX_ZOOM_LEVEL,
          minNativeZoom: selectedBasemap.hasOwnProperty("zoom")
            ? selectedBasemap.zoom.nativeMin
            : DEFAULT_MIN_NATIVE_ZOOM_LEVEL,
          maxNativeZoom: selectedBasemap.hasOwnProperty("zoom")
            ? selectedBasemap.zoom.nativeMax
            : DEFAULT_MAX_NATIVE_ZOOM_LEVEL,
          attribution: selectedBasemap.attribution,
        });
      }

      mapa = new L.map("mapa", {
        center: app.hasOwnProperty("mapConfig")
          ? [app.mapConfig.center.latitude, app.mapConfig.center.longitude]
          : [DEFAULT_LATITUDE, DEFAULT_LONGITUDE],
        zoom: app.hasOwnProperty("mapConfig")
          ? app.mapConfig.zoom.initial
          : DEFAULT_ZOOM_LEVEL,
        layers: currentBaseMap ? [currentBaseMap] : undefined,
        zoomControl: false,
        minZoom: app.hasOwnProperty("mapConfig")
          ? app.mapConfig.zoom.min
          : DEFAULT_MIN_ZOOM_LEVEL,
        maxZoom: app.hasOwnProperty("mapConfig")
          ? app.mapConfig.zoom.max
          : DEFAULT_MAX_ZOOM_LEVEL,
        closePopupOnClick: false,
        /* renderer: L.svg() */
      });

      //Available events
      mapa.methodsEvents = {
        "add-layer": [],
        "delete-layer": [],
        "edit-layer": [],
      };

      mapa.resetView = () => {
        mapa.setView(
          [app.mapConfig.center.latitude, app.mapConfig.center.longitude],
          app.mapConfig.zoom.initial
        );
      };

      setValidZoomLevel(selectedBasemap.nombre);

      gestorMenu.plugins['leaflet'].setStatus('visible');

      mapa.on("click", function (e) {
        setTimeout(function () {
          popupInfo = new Array();
        }, 2000);
      });

      showMainMenuTpl();

      break;
    case 'MousePosition':
      // Leaflet-MousePosition plugin https://github.com/ardhi/Leaflet.MousePosition
      L.control.mousePosition({
        position: 'bottomright',
        separator: ' , ',
        emptyString: '&nbsp;',
        numDigits: 10,
        lngFormatter: function (num) {
          var direction = (num < 0) ? 'O' : 'E';
          return deg_to_dms(Math.abs(num)) + direction;
        },
        latFormatter: function (num) {
          var direction = (num < 0) ? 'S' : 'N';
          return deg_to_dms(Math.abs(num)) + direction;
        }
      }).addTo(mapa);
      gestorMenu.plugins['MousePosition'].setStatus('visible');
      // loadDeveloperLogo(); // move to bottomleft before scale
      break;
    case 'BingLayer':
      if (gestorMenu.pluginExists('BingLayer') && gestorMenu.plugins['leaflet'].getStatus() == 'visible' && gestorMenu.plugins['BingLayer'].getStatus() == 'ready') {
        gestorMenu.plugins['BingLayer'].setStatus('visible');
      }
    default:
      break;
  }
});

/**
 * Add a layer to a drawings group.
 * @param {string} name - Name of the layer.
 * @param {object} layer - Layer to be added to the group.
 * @param {string} section - Section of the layer.
 * @param {string} groupId - ID of the group.
 * @param {string} group - Group where the layer will be added.
 */
function addLayerToDrawingsGroup(name, layer, section, groupId, group) {
  // If the group doesn't exist, create it and add the layer to it.
  if (!mapa.groupLayers[group]) {
    // Create a new GeoJSON feature with the layer and its name.
    const geoJSONCollection = {
      type: "FeatureCollection",
      features: [mapa.getLayerGeoJSON(layer.name)],
    };
    let geoJSON = geoJSONCollection.features[0];
    layer.data = { geoJSON };
    geoJSONCollection.features[0].properties.name = name;
    geoJSONCollection.features[0].properties.type = layer.type;
    // Add the layer to the addedLayers array and the UI menu.
    addedLayers.push({
      id: groupId,
      layer: geoJSONCollection,
      name: groupId,
      type: groupId,
      isActive: true,
      section: section,
    });
    menu_ui.addFileLayer(section, groupId, groupId, groupId, groupId, true);
  } else {
    // If the group already exists, find the corresponding layer and add the new layer to it.
    addedLayers.forEach((lyr) => {
      if (lyr.id === groupId) {
        const geoJSONCollection = {
          type: "FeatureCollection",
          features: [mapa.getLayerGeoJSON(layer.name)],
        };
        let geoJSON = geoJSONCollection.features[0];
        layer.data = { geoJSON };
        geoJSONCollection.features[0].properties.name = name;
        geoJSONCollection.features[0].properties.type = layer.type;

        lyr.layer.features.push(mapa.getLayerGeoJSON(layer.name));
        lyr.layer.features[lyr.layer.features.length - 1] =
          geoJSONCollection.features[0];
      }
    });
  }
  // Add the layer name to the groupLayers array and add the layer to the group.
  mapa.groupLayers[group] = mapa.groupLayers[group] || [];
  mapa.groupLayers[group].push(layer.name);
  mapa.addLayerToGroup(name, group);

  updateNumberofLayers(section); // Update the number of layers in the section.
}

function addSelectionLayersMenuToLayer(layer) {
  const popUpDiv = mapa.createPopUp(
    mapa.editableLayers[layer.type].find((lyr) => lyr.name === layer.name)
  );
  layer.bindPopup(popUpDiv).openPopup();
  if (layer._popup) {
    layer.unbindPopup(popUpDiv);
  }
}

function getGeometryCoords(layer) {
  let coords = null;

  if (layer.type === "polygon" || layer.type === "rectangle") {
    coords = layer._latlngs[0].map((coords) => [coords.lng, coords.lat]);
    layer.coords = coords;
  } else if (layer.type === "circle") {
    coords = {
      lat: layer._latlng.lat,
      lng: layer._latlng.lng,
      r: layer._mRadius,
    };
  } else if (layer.type === "marker") {
    coords = {
      lat: layer._latlng.lat,
      lng: layer._latlng.lng,
    };
  } else if (layer.type === "polyline") {
    coords = layer._latlngs.map((coords) => [coords.lng, coords.lat]);
    layer.coords = coords;
  }
  return coords;
}

// -- Plugins
function onEachFeature(feature, layer) {
  if (feature.properties) {
    var datos = new Array();
    $.each(feature.properties, function (index, value) {
      if (value) {
        datos.push(index + ": " + value + "<br>");
      }
    });
    layer.bindPopup(datos.toString().replace(",", ""));
  }
}

function miniMap_Minimize() {
  miniMap._minimize();
}

function style(geoJsonFeature) {
  return [{ color: "red" }];
}

function pointToLayer(feature, latlng) {
  // Creates a red marker with the coffee icon
  var markerIcon = L.AwesomeMarkers.icon({
    icon: feature.properties.icon || "star",
    prefix: "fa",
    markerColor: feature.properties.iconColor || "red",
  });

  return L.marker(latlng, {
    icon: markerIcon,
  });
}

function printFinished() {
  //Agregar tooltip resumen
  $("[data-toggle2='tooltip']").tooltip({
    placement: "right",
    trigger: "hover",
    container: ".menu-container"
  });
}

function showMainMenuTpl() {
  //Imprimir menú
  gestorMenu.setMenuDOM(".nav.nav-sidebar");
  gestorMenu.setLoadingDOM(".loading");
  gestorMenu.setPrintCallback(printFinished);
  gestorMenu.setLazyInitialization(true);
  gestorMenu.setShowSearcher(
    app.hasOwnProperty("showSearchBar") ? app.showSearchBar : false
  );
  gestorMenu.print();
}

/****** Misc functions ******/
function exportToCSV(filename, rows) {
  var processRow = function (row) {
    var finalVal = "";
    for (var j = 0; j < row.length; j++) {
      var innerValue = row[j] === null ? "" : row[j].toString();
      if (row[j] instanceof Date) {
        innerValue = row[j].toLocaleString();
      }
      var result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (j > 0) finalVal += ",";
      finalVal += result;
    }
    return finalVal + "\n";
  };

  var csvFile = "";
  for (var i = 0; i < rows.length; i++) {
    csvFile += processRow(rows[i]);
  }

  var blob = new Blob([csvFile], { type: "text/csv;charset=utf-8;" });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    var link = document.createElement("a");
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

function exportToHTML(filename, rows) {
  var processRow = function (row) {
    var finalVal = "";
    for (var j = 0; j < row.length; j++) {
      var innerValue = row[j] === null ? "" : row[j].toString();
      if (row[j] instanceof Date) {
        innerValue = row[j].toLocaleString();
      }
      finalVal += innerValue;
    }
    return finalVal;
  };

  var htmlFile = '<table border="1">';
  for (var i = 0; i < rows.length; i++) {
    htmlFile += processRow(rows[i]);
  }
  htmlFile += "</table>";

  var blob = new Blob([htmlFile], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    var link = document.createElement("a");
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

function getFeatureInfoAsCSV(info) {
  var lines = [];

  var lineAux = [];
  lineAux[0] = [];
  lineAux[1] = [];
  $("#" + info + " li").each(function (index) {
    let sAux = $(this).text();
    if (sAux != "") {
      aAux = sAux.split(":");
      lineAux[0].push(aAux[0].trim());
      aAux.shift();
      lineAux[1].push(aAux.join(":").trim());
    }
  });
  lines.push(lineAux[0].join(","));
  lines.push(lineAux[1].join(","));

  exportToCSV("export.csv", lineAux);
}

function getFeatureInfoAsXLS(info) {
  var lines = [];

  var lineAux = [];
  lineAux[0] = [];
  lineAux[1] = [];
  lineAux[0].push("<tr>");
  lineAux[1].push("<tr>");
  $("#" + info + " li").each(function (index) {
    let sAux = $(this).text();
    if (sAux != "") {
      aAux = sAux.split(":");
      lineAux[0].push("<td><b>" + aAux[0].trim() + "</b></td>");
      aAux.shift();
      lineAux[1].push("<td>" + aAux.join(":").trim() + "</td>");
    }
  });
  lineAux[0].push("</tr>");
  lineAux[1].push("</tr>");
  lines.push(lineAux[0].join(","));
  lines.push(lineAux[1].join(","));

  exportToHTML("export.xls", lineAux);
}

/****** Misc functions ******/
//Capture map click to clear popinfo array before fill it
$("#mapa").on("click", function () {
  popupInfo = [];
});

/****** Enveloped functions ******/
var popupInfo = new Array(); //Declare popupInfo (this initialize in mapa.js)
var popupInfoToPaginate = new Array();
var popupInfoPage = 0;
var latlngTmp = "";

function loadGeojsonTpl(url, layer) {
  if (overlayMaps.hasOwnProperty(layer)) {
    overlayMaps[layer].removeFrom(mapa);
    delete overlayMaps[layer];
  } else {
    overlayMaps[layer] = new L.GeoJSON.AJAX(url, {
      onEachFeature: onEachFeature,
      pointToLayer: pointToLayer,
    });
    overlayMaps[layer].addTo(mapa);
  }
}

//function loadWmsTpl (wmsUrl, layer) {
function loadWmsTpl(objLayer) {
  wmsUrl = objLayer.capa.host;
  layer = objLayer.nombre;
  if (overlayMaps.hasOwnProperty(layer)) {
    overlayMaps[layer].removeFrom(mapa);
    delete overlayMaps[layer];

    Object.values(mapa._layers).forEach((lyr) => {
      if (lyr.options) {
        if (lyr.options.layer === objLayer.nombre) {
          lyr.removeFrom(mapa);
        }
      }
    });
  } else {
    //createWmsLayer(wmsUrl, layer);
    let service = objLayer.capa.servicio;
    if (service == "wms") {
      createWmsLayer(objLayer);
    } else if (service == "wmts") {
      createWmtsLayer(objLayer);
    }
    overlayMaps[layer].addTo(mapa);
  }

  function ucwords(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  //Parse FeatureInfo to display into popup (if info is text/html)
  function parseFeatureInfoHTML(info, idTxt) {
    console.log(info);
    infoAux = info.search("<ul>"); // search if info has a list
    if (infoAux > 0) {
      // check if info has any content, if so shows popup
      $(info)
        .find("li")
        .each(function (index) {
          var aux = $(this).text().split(":");
          info = info.replace(
            "<b>" + aux[0] + "</b>:",
            "<b>" + ucwords(aux[0].replace(/_/g, " ")) + ":</b>"
          );
        });

      info = info.replace(
        'class="featureInfo"',
        'class="featureInfo" id="featureInfoPopup' + idTxt + '"'
      );

      return info;
    } else {
      infoAux = info.search("<table"); // search if info has a table
      if (infoAux > 0) {
        // check if info has any content, if so shows popup
        //info = info.replace('<table', '<table class="featureInfo" id="featureInfoPopup' + idTxt + '"');
        return (
          '<div class="featureInfo" id="featureInfoPopup' +
          idTxt +
          '"><div class="featureGroup"><div style="padding:1em;overflow:scroll-x;overflow-y:hidden" class="individualFeature">' +
          info +
          "</div></div></div>"
        );
      }
    }

    return "";
  }

  //Parse FeatureInfo to display into popup (if info is application/json)
  function parseFeatureInfoJSON(info, idTxt, title) {
    info = JSON.parse(info);
    if (info.features.length > 0) {
      // check if info has any content, if so shows popup

      var infoAux =
        '<div class="featureInfo" id="featureInfoPopup' + idTxt + '">';
      infoAux += '<div class="featureGroup">';
      infoAux += '<div style="/*padding:1em;*/" class="individualFeature">';
      //infoAux += '<div style="padding:1em;overflow-y:scroll;max-height:200px" class="individualFeature">';
      infoAux +=
        '<h4 style="border-top:1px solid gray;text-decoration:underline;margin:1em 0">' +
        title +
        "</h4>";
      infoAux += '<ul id="featureInfoPopupUL' + idTxt + '">';

      for (i in info.features) {
        Object.keys(info.features[i].properties).forEach(function (k) {
          if (k != "bbox") {
            //Do not show bbox property
            infoAux += "<li>";
            infoAux += "<b>" + ucwords(k.replace(/_/g, " ")) + ":</b>";
            if (info.features[i].properties[k] != null) {
              infoAux += " " + info.features[i].properties[k];
            }
            infoAux += "<li>";
          }
        });
      }

      infoAux += "</ul>";
      infoAux += "</div></div></div>";
      //infoAux += '</div></div>Descargar como: <a href="javascript:;" onclick="getFeatureInfoAsCSV(\'featureInfoPopupUL' + idTxt + '\')">csv</a> | <a href="javascript:;" onclick="getFeatureInfoAsXLS(\'featureInfoPopupUL' + idTxt + '\')">xls</a></div>';

      return infoAux;
    }

    return "";
  }

  //function createWmsLayer(wmsUrl, layer) {
  function createWmsLayer(objLayer) {
    //Extends WMS.Source to customize popup behavior
    var MySource = L.WMS.Source.extend({
      showFeatureInfo: function (latlng, info) {
        if (!this._map) {
          return;
        }
        if (this.options.INFO_FORMAT == "text/html") {
          var infoParsed = parseFeatureInfoHTML(info, popupInfo.length);
        } else {
          var infoParsed = parseFeatureInfoJSON(
            info,
            popupInfo.length,
            this.options.title
          );
        }
        if (infoParsed != "") {
          // check if info has any content, if so shows popup
          var popupContent = $(".leaflet-popup").html();
          popupInfo.push(infoParsed); //First info for popup
        }
        if (popupInfo.length > 0) {
          popupInfoToPaginate = popupInfo.slice();
          latlngTmp = latlng;
          this._map.openPopup(
            paginateFeatureInfo(popupInfo, 0, false, true),
            latlng
          ); //Show all info
          popupInfoPage = 0;
        }
        return;
      },
    });
    //var wmsSource = new L.WMS.source(wmsUrl + "/wms?", {
    var wmsSource = new MySource(objLayer.capa.getHostWMS(), {
      transparent: true,
      tiled: true,
      maxZoom: 21,
      title: objLayer.titulo,
      format: "image/png",
      INFO_FORMAT: objLayer.capa.featureInfoFormat,
    });
    overlayMaps[objLayer.nombre] = wmsSource.getLayer(objLayer.capa.nombre);
  }

  function createWmtsLayer(objLayer) {
    // tilematrix, style and format should be set by a method
    let wmts_maxZoom = app.hasOwnProperty("service")
      ? app.service.wmts.maxZoom
      : DEFAULT_WMTS_MAX_ZOOM_LEVEL;
    let _style = "",
      _tilematrixSet = "EPSG:3857",
      _format = "image/png";
    var wmtsSource = new L.TileLayer.WMTS(objLayer.capa.getHostWMS(), {
      layer: objLayer.capa.nombre,
      style: _style,
      tilematrixSet: _tilematrixSet,
      format: _format,
      attribution: objLayer.nombre,
      maxZoom: wmts_maxZoom,
    });
    overlayMaps[objLayer.nombre] = wmtsSource;
  }
}

function createTmsLayer(tmsUrl, layer, attribution) {
  if (
    baseLayers.hasOwnProperty(layer) &&
    baseLayers[layer].hasOwnProperty("zoom")
  ) {
    const { min, max, nativeMin, nativeMax } = baseLayers[layer].zoom;
    currentBaseMap = new L.tileLayer(tmsUrl, {
      attribution: attribution,
      minZoom: min,
      maxZoom: max,
      minNativeZoom: nativeMin,
      maxNativeZoom: nativeMax,
    });
    return;
  }
  currentBaseMap = new L.tileLayer(tmsUrl, {
    attribution: attribution,
    minZoom: DEFAULT_MIN_ZOOM_LEVEL,
    maxZoom: DEFAULT_MAX_ZOOM_LEVEL,
    minNativeZoom: DEFAULT_MIN_NATIVE_ZOOM_LEVEL,
    maxNativeZoom: DEFAULT_MAX_NATIVE_ZOOM_LEVEL,
  });
}

function createBingLayer(bingKey, layer, attribution) {
  currentBaseMap = L.tileLayer
    .bing({
      bingMapsKey: bingKey,
      culture: "es_AR",
      attribution: attribution,
    })
    .addTo(mapa);
}

function loadMapaBaseTpl(tmsUrl, layer, attribution) {
  mapa.removeLayer(currentBaseMap);
  createTmsLayer(tmsUrl, layer, attribution);
  currentBaseMap.addTo(mapa);
}

function loadMapaBaseBingTpl(bingKey, layer, attribution) {
  mapa.removeLayer(currentBaseMap);
  createBingLayer(bingKey, layer, attribution);
  currentBaseMap.addTo(mapa);
}

//Paginate FeatureInfo into popup
function paginateFeatureInfo(infoArray, actualPage, hasPrev, hasNext) {
  var infoStr = infoArray.join("");
  if (infoArray.length > 1) {
    for (var i = 0; i < infoArray.length; i++) {
      if (i == actualPage) {
        var sAux = "";
        if (hasPrev == true) {
          sAux +=
            '<a href="javascript:;" onClick="changePopupPage(\'prev\')" id="popupPageSeekerPrev"><i class="fas fa-arrow-left"></i> capa ant.</a>';
        }
        if (hasNext == true) {
          sAux +=
            '<a href="javascript:;" onClick="changePopupPage(\'next\')" id="popupPageSeekerNext">capa sig.<i class="fas fa-arrow-right"></i></a>';
        }
        infoStr = infoStr.replace(
          '<div class="featureInfo" id="featureInfoPopup' + i + '">',
          '<div id="popupPageSeeker">' +
          sAux +
          '</div><div class="featureInfo" id="featureInfoPopup' +
          i +
          '">'
        );
      } else {
        infoStr = infoStr.replace(
          '<div class="featureInfo" id="featureInfoPopup' + i + '">',
          '<div class="featureInfo" style="display:none" id="featureInfoPopup' +
          i +
          '">'
        );
      }
    }
  }
  return infoStr;
}

function changePopupPage(changeType) {
  var hasNext = false;
  var hasPrev = false;
  if (changeType == "next") {
    if (popupInfoToPaginate.length > popupInfoPage + 1) {
      popupInfoPage = popupInfoPage + 1;
    }
  } else {
    if (popupInfoPage - 1 >= 0) {
      popupInfoPage = popupInfoPage - 1;
    }
  }

  if (popupInfoPage - 1 >= 0) {
    hasPrev = true;
  }
  if (popupInfoToPaginate.length > popupInfoPage + 1) {
    hasNext = true;
  }

  mapa.openPopup(
    paginateFeatureInfo(popupInfoToPaginate, popupInfoPage, hasPrev, hasNext),
    latlngTmp
  ); //Show all info
}

function copytoClipboard(coords) {
  var aux = document.createElement("input");
  aux.setAttribute("value", coords);
  document.body.appendChild(aux);
  aux.select();
  document.execCommand("copy");
  document.body.removeChild(aux);
  new UserMessage(
    "Las coordenadas se copiaron al portapapeles",
    true,
    "information"
  );
}
