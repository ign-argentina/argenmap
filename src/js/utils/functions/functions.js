// -- Plugins Control
var plugins = new Array("loadGeojson", "loadWms");
var loadTableAsPopUp = false;
var tableFeatureCount = 20;
var loadSearchbar = false;
var mainPopup = false;
var currentlyDrawing = false;
var loadCharts = false;
var loadLogin = false;
var loadElevationProfile = false;
var loadLayerOptions = false;
var loadGeoprocessing = false;
var loadAddLayer = false;
var loadQueryLayer = true;
var loadConfigTool = false;

function setAddLayer(cond) {
  loadAddLayer = cond;
}

function setQueryLayer(cond) {
  loadQueryLayer = cond;
}

function setTableAsPopUp(cond) {
  loadTableAsPopUp = cond;
}

function setTableFeatureCount(value) {
  tableFeatureCount = value;
}

function setCharts(cond) {
  loadCharts = cond;
}

function setSearchbar(cond) {
  loadSearchbar = cond;
}

function setLogin(cond) {
  loadLogin = cond;
}

function setMainPopup(cond) {
  mainPopup = cond;
}

function setElevationProfile(cond) {
  loadElevationProfile = cond;
}

function setLayerOptions(cond) {
  loadLayerOptions = cond;
}

function setGeoprocessing(cond) {
  loadGeoprocessing = cond;
}

function setConfigToolMain(cond) {
  loadConfigTool = cond;
}

const reverseCoords = (coords) => {
  return [coords[1], coords[0]];
};

const reverseMultipleCoords = (coords) => {
  let reversedCoords = [];
  coords.forEach((coord) => {
    if (typeof coord[0] === "object") {
      reversedCoords.push(reverseMultipleCoords(coord));
    } else {
      reversedCoords.push(reverseCoords(coord));
    }
  });
  return reversedCoords;
};

XMLHttpRequest.prototype.open = (function (open) {
  return function (method, url, async) {
    if (url.includes("&request=GetFeatureInfo")) {
      if (currentlyDrawing) url += `&feature_count=0`;
      else if (loadTableAsPopUp) {
        url += `&feature_count=${tableFeatureCount}`;
      }
    }
    open.apply(this, arguments);
  };
})(XMLHttpRequest.prototype.open);

function deg_to_dms(deg) {
  var d = Math.floor(deg);
  var minfloat = (deg - d) * 60;
  var m = Math.floor(minfloat);
  var secfloat = (minfloat - m) * 60;
  var s = secfloat.toFixed(2); //Math.round(secfloat);
  // After rounding, the seconds might become 60. These two
  // if-tests are not necessary if no rounding is done.
  if (s == 60) {
    m++;
    s = 0;
  }
  if (m == 60) {
    d++;
    m = 0;
  }

  d += "";
  d = d.padStart(2, "0");
  m += "";
  m = m.padStart(2, "0");
  s += "";
  s = s.padStart(2, "0");
  return "" + d + "° " + m + "' " + s + "''";
}

function getDarkerColorTone(hex, lum) {
  // validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, "");
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  lum = lum || 0;
  // convert to decimal and change luminosity
  var rgb = "#",
    c,
    i;
  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
    rgb += ("00" + c).substr(c.length);
  }
  return rgb;
}

function showImageOnError(image) {
  image.onerror = "";
  image.src = LEGEND_ERROR ?? ERROR_IMG;
  image.title = "Image legend not found";
  return true;
}

function mainMenuSearch(e) {
  e.preventDefault();
  if ($("#q").val().length != 0) {
    gestorMenu.setQuerySearch($("#q").val());
    gestorMenu.printMenu();
    let tabs = document.getElementById("menuTabs");
    tabs ? (tabs.style.display = "none") : 0;
  }
}

function reloadMenu() {
  gestorMenu.setQuerySearch("");
  gestorMenu.printMenu();
  recoverSections();
}

function hideAllElevationProfile() {
  //used to hide all elevPorifle with cleanAllLayers
  if (document.getElementById("pt-wrapper")) {
    let geoprocessRecover = new Geoprocessing();
    geoprocessRecover.setAvailableGeoprocessingConfig(app.geoprocessing);
    geoprocessRecover.getNewProcessPrefix();

    addedLayers.forEach((layer) => {
      if (layer.id.includes(geoprocessRecover.GEOPROCESS.elevationProfile)) {
        let aux = document.getElementById("flc-" + layer.id),
          ptInner = document.getElementById(layer.id);

        if (aux.classList.contains("active")) {
          aux.classList.remove("active");
          Object.values(drawnItems._layers).forEach((lyr) => {
            if (layer.id === lyr.idElevProfile) {
              drawnItems.removeLayer(lyr);
              return;
            }
          });
          ptInner.classList.toggle("hidden");
          changeIsActive(layer.id, true);
        }
      }
    });
    $("#pt-wrapper").addClass("hidden");
  }
}

function hideAddedLayers() {
  hideAllElevationProfile();

  addedLayers.forEach((layer) => {
    if (!layer.groupname) {
      if (layer.type === "WMS") {
        let aux = document.getElementById(
          "srvcLyr-" + layer.id + layer.file_name,
        );
        if (aux.className === "file-layer active") {
          aux.className = "file-layer";
          mapa.hideGroupLayer(layer.id);
          gestorMenu.cleanAllLayers();
          layer.layer.active = false;
          mapa.removeLayer(overlayMaps[layer.name]);
          updateNumberofLayers(layer.section);
        }
        if (layer.isActive) {
          layer.isActive = false;
        }
      } else {
        let aux = document.getElementById("flc-" + layer.id);
        if (aux.className === "file-layer active") {
          aux.className = "file-layer";
          mapa.hideGroupLayer(layer.id);
          gestorMenu.cleanAllLayers();
        }
        if (layer.isActive) {
          layer.isActive = false;
        }
      }
    }
  });

  showTotalNumberofLayers();
}

function showTotalNumberofLayers() {
  let activeLayers = gestorMenu.getActiveLayersWithoutBasemap().length;

  addedLayers.forEach((lyr) => {
    if (lyr.isActive && lyr.isActive == true) {
      activeLayers++;
    }
  });

  if (activeLayers > 0) {
    $("#cleanTrash").html(
      "<div class='glyphicon glyphicon-refresh'></div>" +
      "<span class='total-active-layers-counter'>" +
      activeLayers +
      "</span>",
    );
  } else {
    $("#cleanTrash").html("<span class='glyphicon glyphicon-refresh'></span>");
  }
}

function recoverSections() {
  const elevProfileRecover = new IElevationProfile();
  const geoprocessRecover = new Geoprocessing();
  geoprocessRecover.setAvailableGeoprocessingConfig(app.geoprocessing);
  geoprocessRecover.getNewProcessPrefix();

  addedLayers.forEach((layer) => {
    const {
      id,
      isActive,
      type,
      section,
      name,
      file_name,
      layer: layerObj,
    } = layer;
    switch (type) {
      case "file":
        menu_ui.addFileLayer("Archivos", "file", id, id, id, isActive);
        break;
      case "WMS":
        if (isActive) {
          mapa.removeLayer(overlayMaps[layer.name]);
          layer.isActive = false;
        }
        menu_ui.addLayerToGroup(section, type, name, id, file_name, layerObj);
        showTotalNumberofLayers();
        break;
      case "dibujos":
        menu_ui.addFileLayer("Dibujos", id, id, id, id, isActive);
        break;
      case "geoprocess":
        if (
          id.includes(geoprocessRecover.GEOPROCESS.contour) ||
          id.includes(geoprocessRecover.GEOPROCESS.waterRise) ||
          id.includes(geoprocessRecover.GEOPROCESS.buffer)
        ) {
          menu_ui.addFileLayer(
            "Geoprocesos",
            "geoprocess",
            id,
            id,
            id,
            isActive,
          );
        } else if (id.includes(geoprocessRecover.GEOPROCESS.elevationProfile)) {
          elevProfileRecover.addGeoprocessLayer(
            "Geoprocesos",
            "geoprocess",
            id,
            id,
            id,
            isActive,
          );
        }
        break;
      default:
        if (layer.groupname) {
          menu_ui.addLayerToGroup(
            layer.groupname,
            name,
            id,
            layerObj.title,
            layerObj,
          );
        }
        break;
    }
  });
}

function clearString(s) {
  return s.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");
}

function clearSpecialChars(s) {
  return clearString(s).replace(/ /g, "_");
}

/****** Enveloped functions ******/
function loadGeojson(url, layer) {
  if (typeof loadGeojsonTpl === "function") {
    return loadGeojsonTpl(wmsUrl, layer);
  } else {
    console.warn("Function loadGeojsonTpl() do not exists. Please, define it.");
  }
}

function loadWmsTplAux(objLayer) {
  wmsUrl = objLayer.capa.host;
  layer = objLayer.capa.nombre;
  if (overlayMaps.hasOwnProperty(layer)) {
    overlayMaps[layer].removeFrom(mapa);
    delete overlayMaps[layer];
  } else {
    createWmsLayer(objLayer);
    if (consultDataBtnClose == false) {
      overlayMaps[layer]._source.options.identify = true;
    } else if (consultDataBtnClose == true) {
      overlayMaps[layer]._source.options.identify = false;
    } else {
      overlayMaps[layer]._source.options.identify = false;
    }
    overlayMaps[layer].addTo(mapa);
  }
}

function ucwords(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function loadWms(callbackFunction, objLayer) {
  if (typeof callbackFunction === "function") {
    return loadWmsTplAux(objLayer, null);
  } else {
    console.warn(
      "Function " + callbackFunction + "() do not exists. Please, define it.",
    );
  }
}

function loadWmts(callbackFunction, objLayer) {
  if (typeof callbackFunction === "function") {
    return callbackFunction(objLayer);
  } else {
    console.warn(
      "Function " + callbackFunction + "() do not exists. Please, define it.",
    );
  }
}

function setCoordinatesFormat(coords) {
  let coordsFormatted = "";
  coords.forEach((coord) => {
    coordsFormatted += `${coord[0]}%20${coord[1]},`;
  });
  //Add first point again
  coordsFormatted += `${coords[0][0]}%20${coords[0][1]}`;
  return coordsFormatted;
}

async function getWfsLayerFields(url, params) {
  let _params = {
    typeName: params.typeName,
    service: params.service,
    version: params.version,
    request: "DescribeFeatureType",
    outputFormat: params.outputFormat,
  },
    paramsStr = [],
    res,
    geom;

  Object.entries(_params).forEach((p) => {
    paramsStr.push(p.join("="));
  });
  url += "/ows?" + paramsStr.join("&");

  await fetch(url).then((response) => {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json().then((data) => {
        // The response was a JSON object
        // Process your data as a JavaScript object
        if (response.ok) {
          res = data;
          res.featureTypes[0].properties.forEach((field) => {
            // (geometry.isValidType(field.localType)) ? geom = field.name : console.error('Incorrect geometry field name. Check out the WFS capabilities document.');
            let lc = field.localType;
            if (
              lc === "Geometry" ||
              lc === "Point" ||
              lc === "MultiPoint" ||
              lc === "Polygon" ||
              lc === "MultilineString" ||
              lc === "MultiPolygon"
            ) {
              geom = field.name;
            }
          });
        } else {
          alert("HTTP-Error: " + response.status);
        }
      });
    } else {
      response.text().then((text) => {
        // The response wasn't a JSON object
        // Process your text as a String
        if (text.includes("Service WFS is disabled")) {
          return new UserMessage(
            "El servicio WFS está deshabilitado.",
            true,
            "warning",
          );
        }
      });
    }
  });

  return geom;
}

/**
 * Returns the projection type through a GetCapabilities request from the WFS service.
 * @param {String} api where to look for the CRS type
 * @returns only the number of the projection ex: 22183
 */
function getCRSByWFSCapabilities(capabilitiesUrl, layerName) {
  // TODO falta implementar reject para manejar el error
  return new Promise((resolve, reject) => {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const xmlDoc = this.responseXML;
        const features = xmlDoc.getElementsByTagName("FeatureType");
        let defaultCRS = "",
          crs = null;
        const featureName = layerName.includes(":")
          ? layerName.split(":")[1]
          : layerName;

        Array.from(features).some((feature) => {
          let nodeName = feature.getElementsByTagName("Name")[0];
          if (nodeName.innerHTML === featureName) {
            return (defaultCRS =
              feature.getElementsByTagName("DefaultCRS")[0].innerHTML);
          }
        });

        if (defaultCRS.length > 0) {
          crs = defaultCRS.split("::")[1];
        }
        // The format of DefaultCRS is "urn:ogc:def:crs:EPSG::22183"
        // TODO mejora a través de definiciones -> proj4.defs('urn:x-ogc:def:crs:EPSG::4326', proj4.defs('EPSG:4326'));
        resolve(crs);
      } else if (this.readyState == 4 && this.status != 200) {
        reject(null);
      }
    };
    xhttp.open("GET", capabilitiesUrl, true);
    xhttp.send();
  });
}

function getLayerDataByWFS(filterCoords, type, layerData) {
  return new Promise((resolve) => {
    //console.log(layerData.host)
    let layerHost;
    layerData.host
      ? (layerHost = layerData.host)
      : (layerHost = layerData.layer.host);
    const host = layerHost.replace(/\/wms\?*$/, ""); // removes /wms? endpoint from URI
    const layerName = window.encodeURI(layerData.name.replace(":", "/")); // if layer name includes the workspace name, replaces colon with a slash
    const capabilitiesUrl = `${host}/${layerName}/ows?service=wfs&request=GetCapabilities`;

    let reprojectedCoords = [];
    // get the CRS, then defines a WFS request including coordinates in the layer's CRS
    getCRSByWFSCapabilities(capabilitiesUrl, layerData.name)
      .then((crs) => {
        let isWgs84 = crs === "4326" || crs === "84" || crs === null; // true if crs = wgs84 or null
        let url = host,
          paramsStr = [],
          coords = null,
          params = {
            service: "wfs",
            request: "GetFeature",
            version: "",
            outputFormat: "application%2Fjson",
            typeName: layerData.name,
            cql_filter: "",
          };
        if (isWgs84) {
          // TODO: get CRS from initial WMS getCapabilities (gestorMenu.items[k].itemComposite.capa)
          coords = filterCoords;
          getWfsLayerFields(url, params).then((geom) => {
            if (type === "polygon" || type === "rectangle") {
              const coordsFormatted = setCoordinatesFormat(coords);
              (params.version += "1.0.0"),
                (params.cql_filter += `INTERSECTS(${geom},POLYGON((${coordsFormatted})))`);
            }
            if (type === "circle") {
              (params.version += "1.1.0"),
                (params.cql_filter += `DWITHIN(${geom},POINT(${coords.lat}%20${coords.lng}),${coords.r},meters)`);
            }
            if (type === "marker") {
              (params.version += "1.1.0"),
                (params.cql_filter += `INTERSECTS(${geom},POINT(${coords.lat}%20${coords.lng}))`);
            }
            if (type === "polyline") {
              const coordsFormatted = setCoordinatesFormat(coords);
              (params.version += "1.0.0"),
                (params.cql_filter += `INTERSECTS(${geom},LINESTRING(${coordsFormatted}))`);
            }

            Object.entries(params).forEach((p) => {
              paramsStr.push(p.join("="));
            });
            url += "/ows?" + paramsStr.join("&");

            fetch(url).then((response) => {
              if (response.status !== 200) resolve(null);
              resolve(response.json());
            });
          });
        }
        if (!isWgs84) {
          // const wgs84 = "+proj=longlat +datum=WGS84 +no_defs";
          // // const epsg3857 = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs";
          // const posgar94 = "+proj=tmerc +lat_0=-90 +lon_0=-66 +k=1 +x_0=3500000 +y_0=0 +ellps=WGS84 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";

          // If the CRS is not 84, reproject the coords
          filterCoords.forEach((coordsPair, i) => {
            let result = proj4(
              proj4("WGS84"),
              proj4(PROJECTIONS[crs]),
              coordsPair,
            );
            coords[i] = result;
            //reprojectedCoords[i] = result;
          });

          getWfsLayerFields(url, params).then((geom) => {
            if (type === "polygon" || type === "rectangle") {
              const coordsFormatted = setCoordinatesFormat(coords);
              (params.version += "1.0.0"),
                (params.cql_filter += `INTERSECTS(${geom},POLYGON((${coordsFormatted})))`);
            }
            if (type === "circle") {
              (params.version += "1.1.0"),
                (params.cql_filter += `DWITHIN(${geom},POINT(${coords.lat}%20${coords.lng}),${coords.r},meters)`);
            }
            if (type === "marker") {
              (params.version += "1.1.0"),
                (params.cql_filter += `INTERSECTS(${geom},POINT(${coords.lat}%20${coords.lng}))`);
            }
            if (type === "polyline") {
              const coordsFormatted = setCoordinatesFormat(coords);
              (params.version += "1.0.0"),
                (params.cql_filter += `INTERSECTS(${geom},LINESTRING(${coordsFormatted}))`);
            }

            Object.entries(params).forEach((p) => {
              paramsStr.push(p.join("="));
            });
            url += "/ows?" + paramsStr.join("&");

            fetch(url).then((response) => {
              if (response.status !== 200) resolve(null);
              resolve(response.json());
            });
          });
        }
      })
      .catch((e) => {
        console.error(
          "The host does not provide capabilities for the WFS service",
        );
      });
  });
}

function loadMapaBase(tmsUrl, layer, attribution) {
  if (typeof loadMapaBaseTpl === "function") {
    return loadMapaBaseTpl(tmsUrl, layer, attribution);
  } else {
    console.warn(
      "Function loadMapaBaseTpl() do not exists. Please, define it.",
    );
  }
}

function loadMapaBaseBing(bingKey, layer, attribution) {
  if (typeof loadMapaBaseBingTpl === "function") {
    return loadMapaBaseBingTpl(bingKey, layer, attribution);
  } else {
    console.warn(
      "Function loadMapaBaseBingTpl() do not exists. Please, define it.",
    );
  }
}

function loadTemplateStyleConfig(template, isDefaultTemplate) {
  try {
    const STYLE_PATH = isDefaultTemplate
      ? "src/config/default/styles/css/main.css"
      : "src/config/styles/css/main.css";
    $("head").append(`<link rel="stylesheet" href=${STYLE_PATH}>`);
  } catch (error) {
    console.error(error);
  }
}

function setBaseLayersInfo(layers) {
  layers.forEach((layer) => {
    baseLayersInfo[layer.nombre] = layer;
  });
}

function setBaseLayersZoomLevels(layers) {
  layers.forEach((layer) => {
    baseLayers[layer.nombre] = layer.hasOwnProperty("zoom")
      ? { zoom: layer.zoom }
      : {};
  });
}

function setValidZoomLevel(baseLayer) {
  const zoom = mapa.getZoom();
  if (
    baseLayers.hasOwnProperty(baseLayer) &&
    baseLayers[baseLayer].hasOwnProperty("zoom")
  ) {
    const { min, max } = baseLayers[baseLayer].zoom;
    if (zoom < min || zoom > max) {
      mapa.setZoom(zoom < min ? min : max);
    }
    mapa.setMinZoom(min);
    mapa.setMaxZoom(max);
  } else {
    mapa.setMinZoom(DEFAULT_MIN_ZOOM_LEVEL);
    mapa.setMaxZoom(DEFAULT_MAX_ZOOM_LEVEL);
  }
}

function setSelectedBasemapAsActive(layerName, availableBasemaps) {
  const baseLayerId =
    "child-mapasbase" +
    availableBasemaps.findIndex((basemap) => basemap === layerName);
  gestorMenu.addActiveLayer(layerName);
  gestorMenu.setLastBaseMapSelected(layerName);
  gestorMenu.setBasemapSelected(baseLayerId);
}

function adaptToImage(imgDiv) {
  /**
  * Detects the size of the incoming layer legend and adds a
  * collapsible div for holding a larger legend image.
  */
  let img = imgDiv.childNodes[0],
    item = imgDiv.parentNode.parentNode;
  if (img.naturalHeight > 24 || img.naturalWidth > 24) {
    let resize_img_icon = document.createElement("div");
    resize_img_icon.className = "resize-legend-combobox";
    resize_img_icon.style = "align-self: center;font-size: 14px";
    resize_img_icon.innerHTML =
      '<i class="fas fa-angle-down" aria-hidden="true"></i>';

    let container_expand_legend_grafic = document.createElement("div");
    container_expand_legend_grafic.className = "expand-legend-graphic";
    container_expand_legend_grafic.style = "overflow:hidden;";
    container_expand_legend_grafic.setAttribute("load", false);

    let max_url_img = img.src.replace(/off/g, "on");
    img.src.includes("svg") ||
      img.src.includes("png") ||
      img.src.includes("jpg")
      ? max_url_img
      : (max_url_img +=
        ";fontAntiAliasing:true;wrap:true;wrap_limit:200;fontName:Verdana;");
    container_expand_legend_grafic.innerHTML = `<img class='legend-img-max' loading='lazy'  src='${max_url_img}' onerror='showImageOnError(this);this.parentNode.append(" Image not found")'></img>`;

    resize_img_icon.onclick = (event) => {
      if (container_expand_legend_grafic.getAttribute("load") === "true") {
        //container_expand_legend_grafic.className = "hidden";
        container_expand_legend_grafic.classList.toggle("hidden");
        container_expand_legend_grafic.setAttribute("load", false);
        resize_img_icon.innerHTML =
          '<i class="fas fa-angle-down" aria-hidden="true"></i>';
      } else {
        container_expand_legend_grafic.classList.remove("hidden");
        //container_expand_legend_grafic.classList.toggle("hidden");
        container_expand_legend_grafic.setAttribute("load", true);
        container_expand_legend_grafic.style =
          "background-color: white !important;";
        resize_img_icon.innerHTML =
          '<i class="fas fa-angle-up" aria-hidden="true"></i>';
        item.append(container_expand_legend_grafic);
      }
      event.stopPropagation();
    };

    imgDiv.removeChild(img);
    imgDiv.append(resize_img_icon);
    imgDiv.title = "abrir leyenda";
  }
}

//Orden de prioridad:
//1. Declarado en url.
//2. Marcado en json como selected: true.
//3. Si los casos anteriores no se dan, se elige el primer mapa base declarado en el json.
function setBasemapToLoad(urlLayers, availableBasemaps) {
  const basemap = availableBasemaps[0];
  for (let i = 0; i < urlLayers.length; i++) {
    if (
      availableBasemaps.find(
        (availableBasemap) => availableBasemap === urlLayers[i],
      )
    ) {
      const selected = urlLayers[i];
      setSelectedBasemapAsActive(selected, availableBasemaps);
      urlLayers.splice(i, 1);
      urlInteraction.layers = urlLayers;
      return baseLayersInfo[selected];
    }
  }
  for (const baseLayer of availableBasemaps) {
    if (
      baseLayersInfo[baseLayer].hasOwnProperty("selected") &&
      baseLayersInfo[baseLayer].selected
    ) {
      setSelectedBasemapAsActive(baseLayer, availableBasemaps);
      return baseLayersInfo[baseLayer];
    }
  }
  setSelectedBasemapAsActive(basemap, availableBasemaps);
  return baseLayersInfo[basemap];
}

function setProperStyleToCtrlBtns() {
  let isChrome = L.Browser.webkit;
  let shadow_style = "0 1px 5px rgb(0 0 0 / 65%)";
  let border_style = "none";
  let size = "26px";
  if (!isChrome) {
    shadow_style = "none";
    border_style = "2px solid rgba(0, 0, 0, 0.2)";
    size = "34px";
  }
  const zoomhomeCtrlBtn = document.getElementsByClassName(
    "leaflet-control-zoomhome-home",
  );
  const interval = setInterval(() => {
    if (zoomhomeCtrlBtn.length > 0) {
      window.clearInterval(interval);
      //const width = zoomhomeCtrlBtn[0].offsetWidth;
      const btns = [];
      btns.push(zoomhomeCtrlBtn[0]);

      const layersToggleCtrlBtn = document.getElementsByClassName(
        "leaflet-control-layers-toggle",
      )[0];
      btns.push(layersToggleCtrlBtn);

      const zoomhomeCtrlBtnIn = document.getElementsByClassName(
        "leaflet-control-zoomhome-in",
      )[0];
      btns.push(zoomhomeCtrlBtnIn);

      const zoomhomeCtrlBtnOut = document.getElementsByClassName(
        "leaflet-control-zoomhome-out",
      )[0];
      btns.push(zoomhomeCtrlBtnOut);

      const customGraticuleCtrlBtn = document.getElementsByClassName(
        "leaflet-control-customgraticule",
      )[0];
      btns.push(customGraticuleCtrlBtn);

      const locateCtrlBtn = document.getElementsByClassName(
        "leaflet-control-locate",
      )[0];
      btns.push(locateCtrlBtn);

      const modalLoadLayersCtrlBtn =
        document.getElementById("loadLayersButton");
      btns.push(modalLoadLayersCtrlBtn);
      btns.forEach((btn) => {
        btn.style.width = size;
        btn.style.height = size;
        btn.style.border = border_style;
        btn.style.boxShadow = shadow_style;
      });
    }
  }, 100);
}

let normalize = (function () {
  var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç",
    to = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
    mapping = {};

  for (var i = 0, j = from.length; i < j; i++)
    mapping[from.charAt(i)] = to.charAt(i);

  return function (str) {
    var ret = [];
    for (var i = 0, j = str.length; i < j; i++) {
      var c = str.charAt(i);
      if (mapping.hasOwnProperty(str.charAt(i))) ret.push(mapping[c]);
      else ret.push(c);
    }
    return ret
      .join("")
      .replace(/[^-A-Za-z0-9]+/g, "-")
      .toLowerCase();
  };
})();

function clickGeometryLayer(layer) {
  let aux = document.getElementById("flc-" + layer);

  addedLayers.forEach((lyr) => {
    if (lyr.id === layer) {
      if (aux.className === "file-layer active") {
        aux.className = "file-layer";
        mapa.hideGroupLayer(layer);
        lyr.isActive = false;
      } else {
        aux.className = "file-layer active";
        mapa.showGroupLayer(layer);
        lyr.isActive = true;
      }
      updateNumberofLayers(lyr.section);
    }
  });
  showTotalNumberofLayers();
}

function clickWMSLayer(layer, layer_item, fileName) {
  let sectionName;
  if (layer_item.classList.value === "file-layer active" && layer.active) {
    layer_item.classList.value = "file-layer";

    mapa.removeLayer(overlayMaps[layer.name]);
    delete overlayMaps[layer.name];
    layer.active = false;

    addedLayers.forEach((lyr) => {
      if (lyr.file_name == fileName) {
        sectionName = lyr.section;
        lyr.isActive = false;
      }
    });
  } else if (layer_item.classList.value === "file-layer" && !layer.active) {
    layer_item.classList.value = "file-layer active";
    layer.active = true;

    createImportWmsLayer(layer);

    if (consultDataBtnClose == false) {
      overlayMaps[layer.name]._source.options.identify = true;
    } else if (consultDataBtnClose == true) {
      overlayMaps[layer.name]._source.options.identify = false;
    } else {
      overlayMaps[layer.name]._source.options.identify = false;
    }
    overlayMaps[layer.name].addTo(mapa);

    //Original
    // layer.L_layer = L.tileLayer
    //   .wms(layer.host, {
    //     layers: layer.name,
    //     format: "image/png",
    //     transparent: true,
    //   })
    //   .addTo(mapa);
    gestorMenu.layersDataForWfs[layer.name] = {
      name: layer.name,
      section: layer.title,
      host: layer.host,
    };

    addedLayers.forEach((lyr) => {
      if (lyr.file_name == fileName) {
        sectionName = lyr.section;
        lyr.isActive = true;
      }
    });
  }

  updateNumberofLayers(sectionName);
  showTotalNumberofLayers();
}

function geoprocessModalIsOpen() {
  return !!document.getElementById("select-process");
}

function closeGeoprocessModal() {
  if (document.getElementById("select-process")) {
    document.getElementById("select-process").selectedIndex = 0;
    document.getElementsByClassName("form")[1].innerHTML = "";
  }
}

function deleteLayerGeometry(layer) {
  mapa.removeGroup(layer, true, layer);
  let id = "#fl-" + layer;
  let parent = $(id).parent()[0];

  if (parent && parent.childElementCount <= 1) {
    let index = parent.id.indexOf("-panel-body");
    let lista = "#lista-" + parent.id.substr(0, index);
    $(lista).remove();
  } else {
    $(id).remove();
  }
}

function controlSeccionGeom() {
  let aux = mapa.groupLayers;
  for (n in aux) {
    if (aux[n].length === 0) {
      deleteLayerGeometry(n);
    }
  }
}

function zoomEditableLayers(layername) {
  let layer = mapa.groupLayers.hasOwnProperty(layername);
  if (layer.type === "marker" || layer.type === "circlemarker") {
    mapa.fitBounds(L.latLngBounds([layer.getLatLng()]));
  } else {
    mapa.fitBounds(layer.getBounds());
  }
}

function bindZoomLayer() {
  let elements = document.getElementsByClassName("zoom-layer");
  let zoomLayer = async function () {
    let layer_name = this.getAttribute("layername");
    let layer = app.layers[layer_name].capa;

    if (layer.servicio === "wms") {
      await getWmsLyrParams(layer); // gets layer atribtutes from WMS
    }

    //console.log("layer: ", layer)
    let bbox = [layer.minx, layer.miny, layer.maxx, layer.maxy],
      noBbox = bbox.some((el) => {
        return el === null || el === undefined;
      });

    //console.log("bbox: ", bbox)
    if (noBbox) {
      for (i = 0; i < this.childNodes.length; i++) {
        if (this.childNodes[i].className == "fas fa-search-plus") {
          this.childNodes[i].classList.remove("fa-search-plus");
          this.childNodes[i].classList.add("fa-exclamation-triangle");
          this.childNodes[i].setAttribute("title", STRINGS.no_bbox);
          break;
        }
      }
    } else {
      for (i = 0; i < this.childNodes.length; i++) {
        if (this.childNodes[i].className == "fas fa-exclamation-triangle") {
          this.childNodes[i].classList.remove("fa-exclamation-triangle");
          this.childNodes[i].classList.add("fa-search-plus");
          this.childNodes[i].setAttribute("title", "Zoom a capa");
          break;
        }
      }
    }

    //si la capa no esta activa activar
    let activas = gestorMenu.activeLayers;
    let active = false;
    activas.forEach(function (key) {
      if (key === layer_name) active = true;
    });
    if (!active) gestorMenu.muestraCapa(app.layers[layer_name].childid);
    let bounds = [
      [layer.maxy, layer.maxx],
      [layer.miny, layer.minx],
    ];
    try {
      mapa.fitBounds(bounds);
    } catch (error) {
      console.error(error);
    }
  };

  for (let i = 0; i < elements.length; i++) {
    elements[i].addEventListener("click", zoomLayer, false);
  }
}

function bindLayerOptions() {
  let elements = document.getElementsByClassName("layer-options-icon");
  let layerOptions = function () {
    let layername = this.getAttribute("layername");
    if (!app.layers[layername].display_options) {
      menu_ui.addLayerOptions(layername);
    } else {
      menu_ui.closeLayerOptions(layername);
    }
  };

  for (let i = 0; i < elements.length; i++) {
    elements[i].addEventListener("click", layerOptions, false);
  }
}

/**
 * Recorta un string si su longitud es mayor a la longitud dada
 * agrega ".." al final en caso de realizar el recorte
 * @param str es el string a recortar
 * @param chars la longitud del string limite
 * @return un string recortado o no
 */
function stringShortener(str, chars, addDots) {
  if (str.length > chars) {
    return addDots ? str.substr(0, chars) + ".." : str.substr(0, chars);
  } else {
    return str;
  }
}

function getStyleContour() {
  let styles = {
    line_color: "#7b7774",
    line_weight: 1,
    d_line_m: 50,
    d_line_color: "#7b7774",
    d_weigth: 3,
    smoothFactor: 1.5,
  };

  if (loadGeoprocessing) {
    let g = app.geoprocessing.availableProcesses;
    g.forEach((e) => {
      if (e.geoprocess == "contour") {
        if (e.styles) {
          styles.line_color = e.styles.line_color ?? styles.line_color;
          styles.line_weight = e.styles.line_weight ?? styles.line_weight;
          styles.d_line_m = e.styles.d_line_m ?? styles.d_line_m;
          styles.d_line_color = e.styles.d_line_color ?? styles.d_line_color;
          styles.d_weigth = e.styles.d_weigth ?? styles.d_weigth;
          styles.smoothFactor = e.styles.smoothFactor ?? styles.smoothFactor;
        }
      }
    });
  }

  return styles;
}

function getMulticolorContour(n) {
  //TODO reemplazar por rampa
  let color = "";
  if (n >= 6000) {
    color = "#8E492D";
  } else if (n < 6000 && n >= 5000) {
    color = "#B5574E";
  } else if (n < 5000 && n >= 4000) {
    color = "#CA813D";
  } else if (n < 4000 && n >= 3000) {
    color = "#CB9550";
  } else if (n < 3000 && n >= 2000) {
    color = "#E2AE4E";
  } else if (n < 2000 && n >= 1000) {
    color = "#E4C47A";
  } else if (n < 1000 && n >= 500) {
    color = "#FAB24A";
  } else if (n < 500 && n >= 400) {
    color = "#FCCA78";
  } else if (n < 400 && n >= 300) {
    color = "#FEE3AC";
  } else if (n < 300 && n >= 200) {
    color = "#FFFDCC";
  } else if (n < 200 && n >= 150) {
    color = "#E6F6E5";
  } else if (n < 150 && n >= 100) {
    color = "#CCEBB5";
  } else if (n < 100 && n >= 50) {
    color = "#99D98C";
  } else if (n < 50 && n > 0) {
    color = "#80CF66";
  } else if (n <= 0) {
    color = "#4DC070";
  }
  return color;
}

//add funcion with setTimeout
//fix bug--->  line 553 entities.js
//no funciona para todos los templates
/* window.onload = function () {
    setTimeout(function () {
        bindZoomLayer()
        bindLayerOptions()
    }, 200);
};


function bindLayerOptionsIdera() {
    setTimeout(function () {
        bindZoomLayer()
        bindLayerOptions()
    }, 100);
} */

function zoomLayer(id_dom) {
  let nlayer = app.layerNameByDomId[id_dom];
  let bbox = app.layers[nlayer].capa;
  //solo sii la capa no esta activa activar
  let activas = gestorMenu.activeLayers;
  let active = false;
  activas.forEach(function (key) {
    if (key === nlayer) active = true;
  });
  if (!active) gestorMenu.muestraCapa(app.layers[nlayer].childid);

  let bounds = [
    [bbox.maxy, bbox.maxx],
    [bbox.miny, bbox.minx],
  ];
  try {
    mapa.fitBounds(bounds);
  } catch (err) {
    console.error(err);
  }
}

async function getWmsLyrParams(lyr) {
  //let url = `${lyr.host}/${lyr.nombre}/ows?service=${lyr.servicio}&version=${lyr.version}&request=GetCapabilities`,
  if (lyr.host.charAt(lyr.host.length - 1) !== "?") {
    lyr.host += "?";
  }
  let url = `${lyr.host}service=${lyr.servicio}&version=${lyr.version}&request=GetCapabilities`,
    sys = lyr.version === "1.3.0" ? "CRS" : "SRS";
  //console.log(url)
  await fetch(url)
    .then((res) => res.text())
    .then((str) => {
      parseXml(str, lyr, sys);
    })
    .catch((err) => {
      console.error(err);
    });
}

function parseXml(str, lyr, sys) {
  let xmlLyr,
    parser = new DOMParser(),
    xmlDoc,
    xmlNodes;
  try {
    xmlDoc = parser.parseFromString(str, "text/xml");
  } catch (error) { }
  xmlDoc.documentElement.nodeName == "parsererror"
    ? console.error("error while parsing")
    : (xmlNodes = xmlDoc.getElementsByTagName("Name"));

  if (xmlNodes) {
    for (i = 0; i < xmlNodes.length; i++) {
      if (xmlNodes[i].childNodes.length > 0) {
        if (xmlNodes[i].childNodes[0].nodeValue === lyr.nombre) {
          xmlLyr = xmlNodes[i].parentNode;
        }
      }
    }

    let bboxNodes = xmlLyr.getElementsByTagName("BoundingBox");
    lyr.legendURL =
      xmlLyr.getElementsByTagName("OnlineResource")[0].attributes[
        "xlink:href"
      ].value;

    for (i = 0; i < bboxNodes.length; i++) {
      if (lyr.minx === null || typeof lyr.minx === "undefined") {
        let srs = bboxNodes[i].attributes[sys];
        if (srs.value === sys + ":4326" || srs.value === sys + ":84") {
          lyr.minx = bboxNodes[i].attributes["minx"].value;
          lyr.miny = bboxNodes[i].attributes["miny"].value;
          lyr.maxx = bboxNodes[i].attributes["maxx"].value;
          lyr.maxy = bboxNodes[i].attributes["maxy"].value;
          lyr.srs = srs.value;
        } else {
          console.info(
            `Layer SRS is ${srs.value}, not supported for zoom to layer yet.`,
          );
        }
      }
    }
  }
}

function hillShade() {
  if (app.hillshade) {
    let _name = app.hillshade.name,
      _url = app.hillshade.url,
      _attribution = app.hillshade.attribution;
    _map = mapa ? mapa : map;
    if (overlayMaps.hasOwnProperty(_name)) {
      overlayMaps[_name].removeFrom(mapa);
      delete overlayMaps[_name];
    } else {
      overlayMaps[_name] = L.tileLayer(_url, {
        attribution: _attribution,
      });
      overlayMaps[_name].addTo(mapa);
      let pane = document.getElementsByClassName(
        "leaflet-pane leaflet-tile-pane",
      )[0].lastElementChild;
      pane.style.setProperty("mix-blend-mode", "multiply");
    }
  }
}

function toggleVisibility(elementId) {
  try {
    let el = document.getElementById(elementId);
    el.classList.contains("visible")
      ? (el.classList.remove("visible"), el.classList.add("hidden"))
      : (el.classList.remove("hidden"), el.classList.add("visible"));
  } catch (e) {
    console.error(e);
  }
}

function getDeveveloperLogo() {
  let logo = {};
  // Checks if the 'overrideDevLogo' key exists within logo, if not applies the default image.
  app.logo.overrideDevLogo
    ? (logo = app.logo.overrideDevLogo)
    : (logo = { src: APP_IMG, style: null });
  return logo;
}

function loadDeveloperLogo() {
  // This creates Argenmap developer's logo at the bottom right corner, we encourage you to leaving this as it comes in the code to give the proper attribution and spread the word about the project. Thanks! :D

  // But, as sometimes is needed to replace the image, it can be done with a custom one adding the key 'overrideDevLogo' in the logo object, within preferences.json as its shown in the following example:
  /* Note that in the 'src' attribute could be added an image encoded in base64.
      "logo": {
        "overrideDevLogo": {
          "src": "data:image/png;base64,qwertyu",
          "style": "width: 64px; background-size: cover"
        }
      }
    */

  L.Control.DeveloperLogo = L.Control.extend({
    onAdd: function (map) {
      let devLogo = getDeveveloperLogo();
      let devLogoUrl = devLogo.src;
      let devLogoStyle = devLogo.style;
      let link = L.DomUtil.create("a");
      link.target = "_blank";
      link.id = "developerLogo";
      link.title = STRINGS.about;
      link.style.cursor = "pointer";
      let img = L.DomUtil.create("img");
      img.src = "src/styles/images/noimage.webp";
      img.alt = "Argenmap logo";
      img.classList = "brand";
      img.style = devLogoStyle;
      img.style.backgroundImage = `url('${devLogoUrl}')`;
      link.appendChild(img);

      link.addEventListener("click", function () {
        modalAboutUs.toggleOpen();
      });

      return link;
    },
  });

  L.control.developerLogo = function (opts) {
    return new L.Control.DeveloperLogo(opts);
  };
  L.control.developerLogo({ position: "bottomleft" }).addTo(mapa);
}

function downloadBlob(blob, name = "file.txt") {
  // Convert your blob into a Blob URL
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = name;
  document.body.appendChild(link);
  // Dispatch click event on the link
  link.dispatchEvent(
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    }),
  );

  // Remove link from body
  document.body.removeChild(link);
}

function changeIsActive(id, isActive) {
  addedLayers.forEach((lyr) => {
    if (lyr.id == id && lyr.isActive) {
      if (isActive == true) lyr.isActive = false;
      if (isActive == false) lyr.isActive = true;
    }
  });
}

function addCounterForSection(groupnamev, layerType) {
  let counter = 0;
  addedLayers.forEach((lyr) => {
    if (lyr.isActive == true && lyr.type == layerType) {
      counter++;
    }
  });
  if (counter > 0) {
    $("#" + groupnamev + "-a").html(
      groupnamev +
      " <span class='active-layers-counter'>" +
      counter +
      "</span>",
    );
  } else {
    $("#" + groupnamev + "-a").html(groupnamev);
  }
}

function updateNumberofLayers(layerSection) {
  let activeLayers = 0;
  let element;
  if (layerSection && layerSection.includes(" ")) {
    element = document.getElementById(layerSection.replace(/ /g, "_") + "-a");
  } else {
    element = document.getElementById(layerSection + "-a");
  }

  addedLayers.forEach((lyr) => {
    if (lyr.isActive && lyr.section == layerSection) {
      activeLayers++;
    }
  });

  if (element) {
    if (activeLayers > 0) {
      element.innerHTML =
        layerSection +
        "<span class='active-layers-counter'>" +
        activeLayers +
        "</span>";
    } else {
      element.innerHTML = layerSection;
    }
  }
}

function hideAddedLayersCounter() {
  fileLayerGroup.forEach((lyr) => {
    let element = document.getElementById(lyr + "-a");

    if (element) {
      element.innerHTML = lyr;
    }
  });
}

function deleteAddedLayer(layer) {
  //Requires layer from editableLayers
  let layerSection;
  addedLayers.forEach((lyr) => {
    if (lyr.id === layer.id) {
      let index = addedLayers.indexOf(lyr);
      if (index > -1) {
        layerSection = lyr.section;
        addedLayers.splice(index, 1);
        updateNumberofLayers(layerSection);
        showTotalNumberofLayers();
      }
    }
  });
}

function loadingBtn(status, idBtn, btnName) {
  let btn_ejecutar = document.getElementById(idBtn);
  if (status === "on") {
    btn_ejecutar.innerHTML =
      '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i>';
    $("#ejec_gp").addClass("ag-btn-disabled");
    $("#" + idBtn).addClass("ag-btn-disabled");
  } else if (status === "off") {
    if (btnName) {
      btn_ejecutar.innerHTML = btnName;
    } else {
      btn_ejecutar.innerHTML = "Ejecutar";
    }
    $("#" + idBtn).removeClass("ag-btn-disabled");
  }
}

function getLayerValues() {
  let layerArray = [];
  Object.values(app.getActiveLayers()).forEach((lyr) => {
    gestorMenu.getActiveLayersWithoutBasemap().forEach((lyrWB) => {
      if (lyr._name === lyrWB.name) {
        let newLayer = lyr;
        newLayer.section = lyrWB.section;
        newLayer.name = lyrWB.name;
        newLayer.layer = {
          title: lyr._source.options.title,
          host: lyr._source._url,
          name: newLayer.name,
        };
        layerArray.push(newLayer);
      }
    });
  });
  return layerArray;
}

function getAllActiveLayers() {
  let allActiveLayers = [];
  allActiveLayers = getLayerValues();
  addedLayers.forEach((lyr) => {
    if (lyr.isActive === true) {
      allActiveLayers.push(lyr);
    }
  });
  return allActiveLayers;
}

function getVectorData(e) {
  if (e.target.activeData === true) {
    let layer = e.target;
    createPopupForVector(layer, e.latlng);
  }
}

function createPopupForVector(layer, clickLatlng) {
  let id = layer.name[0].toUpperCase() + layer.name.slice(1).toLowerCase(),
    popupName;
  if (layer.data.geoJSON) {
    popupName = layer.data.geoJSON.properties.objeto;
    popupName ? (title = popupName) : (title = id);
  } else {
    return;
  }

  var infoAux = '<div class="featureInfo" id="featureInfoPopup' + id + '">';
  infoAux += '<div class="featureGroup">';
  infoAux += '<div style="/*padding:1em*/" class="individualFeature">';
  infoAux +=
    '<h4 style="border-top:1px solid gray;text-decoration:underline;margin:1em 0">' +
    title +
    "</h4>";
  infoAux += "<ul>";

  Object.keys(layer.data.geoJSON.properties).forEach(function (k) {
    let ignoredField = templateFeatureInfoFieldException.includes(k); // checks if field is defined in data.json to be ignored in the popup
    if (k != "bbox" && !ignoredField && k != "objeto" && k != "styles") {
      //ignore this rows
      infoAux += "<li>";
      infoAux += "<b>" + ucwords(k.replace(/_/g, " ")) + ":</b>";
      if (layer.data.geoJSON.properties[k] != null) {
        infoAux += " " + layer.data.geoJSON.properties[k];
      }
      infoAux += "<li>";
    }
  });

  infoAux += "</ul>";
  infoAux += "</div></div></div>";
  popupInfo.push(infoAux); //Add info for popup

  let center;
  if (layer._latlng) {
    center = layer._latlng;
  } else {
    center = clickLatlng;
  }
  layer._map.openPopup(paginateFeatureInfo(popupInfo, 0, false, true), center); //Show info
}

/**
 * Removes a geometry from the drawings group.
 *
 * @param {Object} selectedGeometry - The geometry to remove.
 */
function removeGeometryFromDrawingsGroup(selectedGeometry) {
  let layerIdxToDeleteFrom;

  // Iterate through each addedLayer and remove the feature with the given name
  addedLayers.forEach((addedLayer, idx) => {
    const featureIdx = addedLayer.layer.features?.findIndex(
      (feature) => feature.properties.name === selectedGeometry.name,
    );
    if (featureIdx >= 0) {
      // Remove the feature with specific name from the current addedLayer
      addedLayer.layer.features.splice(featureIdx, 1);

      // Update the index of the addedLayer we modified
      layerIdxToDeleteFrom = idx;

      // Update layer count and total count display
      updateNumberofLayers(addedLayer.section);
      showTotalNumberofLayers();
    }
  });

  // Remove the feature from the group layer if it exists
  const selectedGeometryGroupId = addedLayers[layerIdxToDeleteFrom]?.id;
  const groupLayer = mapa.groupLayers?.[selectedGeometryGroupId];
  const layerIdx = groupLayer?.indexOf(selectedGeometry.name);
  if (layerIdx >= 0) {
    groupLayer.splice(layerIdx, 1);
  }

  // Remove the layer and group from the map and file manager if the group layer is empty
  if (groupLayer?.length === 0) {
    delete mapa.groupLayers?.[selectedGeometryGroupId];
    deleteLayerGeometry(selectedGeometryGroupId, true);
    delFileItembyID(selectedGeometryGroupId);
    updateNumberofLayers(selectedGeometryGroupId);
    showTotalNumberofLayers();
  }
}

// Sets a CSS class for SVG paths (Leaflet geometries)
function setPathClass(cssClass) {
  addedLayers.forEach((obj) => {
    // it only sets a class for drwaings, not for layers imported from files
    if (obj.type === "dibujos") {
      // change this if for using CSS classes with more type of layers
      for (feature in obj.layer._layers) {
        if (obj.layer._layers[feature].hasOwnProperty("_path")) {
          obj.layer._layers[feature]._path.classList = cssClass;
        }
      }
    }
  });
}

// Set font-family attribute for all texts in app (font-face should be defined first in CSS)
function setFontFamily(fontFamily) {
  let r = document.querySelector(":root");
  /* let rs = getComputedStyle(r); */
  r.style.setProperty("--main-font-family", fontFamily);
}

function nameForLayer(type) {
  let name = type + "_";

  if (mapa.editableLayers[type].length === 0) {
    name += "1";
  } else {
    const lastLayerName =
      mapa.editableLayers[type][mapa.editableLayers[type].length - 1].name;
    name += parseInt(lastLayerName.split("_")[1]) + 1;
  }
  return name;
}

function createLayerByType(geoJSON, groupName) {
  let layer = null,
    type = geoJSON.geometry.type.toLowerCase(),
    options = {};

  if (geoJSON.properties.hasOwnProperty("styles")) {
    options = { ...geoJSON.properties.styles };
  }

  //check type
  if (type === "point") {
    layer = createLayerForPoint(geoJSON, groupName, layer, options);
  }
  if (type === "polygon") {
    layer = createLayerPolygon(geoJSON, layer, options);
  }
  if (type === "linestring") {
    layer = createLayerLinestring(geoJSON, groupName, layer, options);
  }
  if (type === "multipoint") {
    layer = createLayerMultipoint(geoJSON, groupName, layer);
  }
  if (type === "multilinestring") {
    layer = createLayerMultilinestring(geoJSON, groupName, layer);
  }
  if (type === "multipolygon") {
    layer = createLayerMultilinestring(geoJSON, layer);
  }
  /* Guardar propiedades de editable label */
  /* console.log(geoJSON.properties.type) */
  if (geoJSON.properties.type !== "label") {
    layer.id = groupName;
    layer.data = { geoJSON };
  }
  return layer;
}

function createLayerMultilinestring(geoJSON, layer) {
  const reversedCoords = reverseMultipleCoords(geoJSON.geometry.coordinates[0]);
  layer = L.polygon(reversedCoords);
  layer.type = "polygon";
  return layer;
}

function createLayerMultilinestring(geoJSON, groupName, layer) {
  geoJSON.geometry.coordinates.forEach((coords) => {
    const lineString = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: coords,
      },
      properties: geoJSON.properties,
    };

    layer = createLayerByType(lineString, groupName);
  });
  return layer;
}

function createLayerMultipoint(geoJSON, groupName, layer) {
  geoJSON.geometry.coordinates.forEach((coords) => {
    const point = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: coords,
      },
      properties: geoJSON.properties,
    };

    layer = createLayerByType(point, groupName);
  });
  return layer;
}

function createLayerPolygon(geoJSON, layer, options) {
  const invertedCoords = geoJSON.geometry.coordinates[0].map((coords) => [
    coords[1],
    coords[0],
  ]);

  if (
    geoJSON.properties.hasOwnProperty("type") &&
    geoJSON.properties.type.toLowerCase() === "rectangle"
  ) {
    layer = L.rectangle(invertedCoords, options);
    layer.type = "rectangle";
  } else {
    layer = L.polygon(invertedCoords, options);
    layer.type = "polygon";
  }
  return layer;
}

function createLayerLinestring(geoJSON, groupName, layer, options) {
  const invertedCoords = geoJSON.geometry.coordinates.map((coords) => [
    coords[1],
    coords[0],
  ]);

  if (
    geoJSON.hasOwnProperty("properties") &&
    geoJSON.properties.hasOwnProperty("value")
  ) {
    let n = geoJSON.properties.value;
    let value = geoJSON.properties.value + " m";

    let newOptions = setContourStyleOptions(geoJSON, options);

    layer = L.polyline(invertedCoords, newOptions);
    layer.type = "polyline";
    layer.layer = groupName;
    layer.value = geoJSON.properties.value;
    if (n % 100 === 0 || n % 50 === 0) {
      // textPath
      layer.setText(value, {
        repeat: false,
        offset: -3,
        center: true,
        attributes: {
          textLength: 55,
          fill: "Maroon",
          "font-weight": newOptions["font-weight"],
          "font-family": "sans-serif",
          stroke: "white",
          "stroke-opacity": "1",
          "stroke-width": "0.5",
          /* 'font-size': '24px' */
        },
      });
    }
    layer.on("mouseover", function (e) {
      let elevation = geoJSON.properties.value.toString() + " m";
      let tooltipStyle = {
        direction: "right",
        permanent: false,
        sticky: true,
        offset: [10, 0],
        opacity: 0.75,
        className: "map-tooltip",
      };
      layer.bindTooltip(`<div><b>${elevation}</b></div>`, tooltipStyle);
    });
  } else {
    layer = L.polyline(invertedCoords, options);
    layer.type = "polyline";
  }

  return layer;
}

function createLayerForPoint(geoJSON, groupName, layer, options) {
  const invertedCoords = [
    geoJSON.geometry.coordinates[1],
    geoJSON.geometry.coordinates[0],
  ];

  //Check if it is circle, circlemarker or marker
  let geoJsonHasType = geoJSON.properties.hasOwnProperty("type");
  if (geoJsonHasType) {
    let geoJsonType = geoJSON.properties.type.toLowerCase();
    if (geoJsonType === "circle") {
      layer = L.circle(invertedCoords, options);
      layer.type = "circle";
      return layer;
    }
    if (geoJsonType === "circlemarker") {
      layer = L.circleMarker(invertedCoords, options);
      layer.type = "circlemarker";
      return layer;
    }
    if (geoJsonType === "marker") {
      layer = L.marker(invertedCoords);
      layer.type = "marker";
      setDefaultMarkerStyles(layer, geoJSON);
      return layer;
    }
    if (geoJsonType === "label") {
      const editableLabel = new EditableLabel();
      editableLabel.uploadLabel(
        invertedCoords,
        geoJSON.properties.text,
        geoJSON.properties.styles.weight,
        geoJSON.properties.styles.borderColor,
        geoJSON.properties.styles.fillColor,
        geoJSON.properties.styles.color,
        groupName,
      );
      layer = mapa.editableLayers.label[mapa.editableLayers.label.length - 1];
      return layer;
    } else {
      layer = L.marker(invertedCoords);
      layer.type = "marker";
      return layer;
    }
  } else {
    layer = L.marker(invertedCoords);
    layer.type = "marker";
    return layer;
  }
}

function setDefaultMarkerStyles(layer, geoJSON) {
  //Default marker styles
  layer.options.borderWidth = DEFAULT_MARKER_STYLES.borderWidth;
  layer.options.borderColor = DEFAULT_MARKER_STYLES.borderColor;
  layer.options.fillColor = DEFAULT_MARKER_STYLES.fillColor;

  if (
    geoJSON.properties.hasOwnProperty("styles") &&
    geoJSON.properties.styles.hasOwnProperty("borderWidth")
  ) {
    const borderWidth = geoJSON.properties.styles.borderWidth;
    const borderColor = geoJSON.properties.styles.borderColor;
    const fillColor = geoJSON.properties.styles.fillColor;

    layer.options.borderWidth = borderWidth;
    layer.options.borderColor = borderColor;
    layer.options.fillColor = fillColor;
    layer.options.customMarker = true;

    mapa.setIconToMarker(layer, borderColor, fillColor, borderWidth);
  }
}

function setContourStyleOptions(geoJSON, options) {
  let geoJsonValue = geoJSON.properties.value;

  if (!countour_styles) countour_styles = getStyleContour();

  if (geoJsonValue % countour_styles.d_line_m === 0) {
    let colord = "";
    if (countour_styles.d_line_color === "multi") {
      colord = getMulticolorContour(geoJsonValue);
    } else {
      colord = countour_styles.d_line_color;
    }

    options = {
      color: colord,
      weight: countour_styles.d_weigth,
      smoothFactor: countour_styles.smoothFactor,
      "font-weight": "bold",
    };
  } else {
    let colorc = "";
    if (countour_styles.line_color === "multi") {
      colorc = getMulticolorContour(geoJsonValue);
    } else {
      colorc = countour_styles.line_color;
    }

    options = {
      color: colorc,
      weight: countour_styles.line_weight,
      smoothFactor: countour_styles.smoothFactor,
      "font-weight": "regular",
    };
  }
  return options;
}

function addLayerToAllGroups(layer, groupName) {
  if (layer.length) {
    if (layer.length <= 1) {
      _addLayerToAllGroups(layer[0], groupName);
    } else {
      layer.forEach((feature) => {
        _addLayerToAllGroups(feature, groupName);
      });
    }
  } else {
    _addLayerToAllGroups(layer, groupName);
  }
}

function _addLayerToAllGroups(layer, groupName) {
  let type = layer.type;
  drawnItems.addLayer(layer);

  mapa.editableLayers[type].forEach((lyr) => {
    if (lyr.id !== layer.id) {
      mapa.editableLayers[type].push(layer);
    }
  });

  if (groupName) {
    if (mapa.groupLayers[groupName] === undefined) {
      mapa.groupLayers[groupName] = [];
    }
    mapa.groupLayers[groupName].push(layer.name);
  }
}

function removeLayerFromAllGroups(layer, groupName) {
  for (let property in mapa.editableLayers) {
    mapa.editableLayers[property].forEach((layer) => {
      if (layer.id === layer.id) {
        mapa.editableLayers[property].pop(layer);
      }
    });
  }
  for (let property in drawnItems._layers) {
    if (drawnItems._layers[property].id === layer.id) {
      drawnItems._layers[property].remove();
      delete drawnItems._layers[property];
    }
  }
  if (groupName) {
    mapa.groupLayers[groupName].pop(layer.name);
    if (mapa.groupLayers[groupName].length === 0) {
      delete mapa.groupLayers[groupName];
    }
  }
}

$(document).ready(function () {
  $("#menu-toggle").click(function (e) {
    e.preventDefault();
    $("#wrapper").toggleClass("menuDisplayed");
  });
});

document.addEventListener("DOMContentLoaded", function () {
  var menuContainer = document.querySelector(".menu-container");
  var buttons = document.querySelectorAll(".menu-section-btn");

  buttons.forEach(function (button) {
    button.addEventListener("click", function (event) {
      var targetId = button.getAttribute("data-target");
      var targetSection = document.getElementById(targetId);

      if (targetSection.style.display === "block") {
        targetSection.style.display = "none";
      } else {
        // Oculta todas las secciones antes de mostrar la deseada
        buttons.forEach(function (otherButton) {
          var otherTargetId = otherButton.getAttribute("data-target");
          var otherTargetSection = document.getElementById(otherTargetId);

          if (otherTargetSection !== targetSection) {
            otherTargetSection.style.display = "none";
          }
        });

        targetSection.style.display = "block";
      }
      event.stopPropagation();
    });
  });

  // Agrega un evento de clic al documento para ocultar los contenedores al hacer clic fuera de ellos
  document.addEventListener("click", function (event) {
    if (!menuContainer.contains(event.target) && event.target.id === "mapa") {
      buttons.forEach(function (button) {
        var targetId = button.getAttribute("data-target");
        var targetSection = document.getElementById(targetId);
        targetSection.style.display = "none";
      });
    }
  });
});

function toggleVisibilityGeoprocessModal() {
  const modal = document.getElementById("mr");
  const container = document.getElementById("geoprocesos");
  if (modal) {
    if (container.style.display === "block") {
      geoProcessingManager.closeModal();
    } else {
      geoProcessingManager.createModal();
    }
  } else {
    // El modal no ha sido creado, así que lo creamos solo si el contenedor está visible
    if (container.style.display === "block") {
      geoProcessingManager.createModal();
    }
  }
}
