"use strict";

const EmptyTab = "main-menu-tab-";
const ItemGroupPrefix = "lista-";

function normalizeStr(s) {
  if (s == null) return "";
  try {
    return s
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  } catch (e) {
    return s.toString().toLowerCase().trim();
  }
}

function appendRenderedContent(container, content) {
  if (!container || content == null) return;
  if (content instanceof Node) {
    container.appendChild(content);
    return;
  }
  container.insertAdjacentHTML("beforeend", String(content));
}

/******************************************
Class Capa
******************************************/
class Capa {
  constructor(
    nombre,
    titulo,
    srs,
    host,
    servicio,
    version,
    featureInfoFormat,
    key,
    minx,
    maxx,
    miny,
    maxy,
    attribution,
    legendURL,
    metadata,
  ) {
    this.nombre = nombre;
    this.titulo = titulo;
    this.srs = srs;
    this.host = host;
    this.servicio = servicio;
    this.version = version;
    this.featureInfoFormat = featureInfoFormat;
    this.key = key;
    this.minx = minx;
    this.maxx = maxx;
    this.miny = miny;
    this.maxy = maxy;
    this.attribution = attribution;
    this.legendURL = legendURL;
    this.metadata = metadata || {};
    this.abstract = this.metadata.abstract || null;
    this.keywords = this.metadata.keywords || key || [];
    this.boundingBoxes = this.metadata.boundingBoxes || [];
    this.styles = this.metadata.styles || [];
    this.dimensions = this.metadata.dimensions || [];
    this.queryable = this.metadata.queryable ?? null;
    this.opaque = this.metadata.opaque ?? null;
    this.formats = this.metadata.formats || [];
    this.infoFormats = this.metadata.infoFormats || [];
    this.tileMatrixSetLinks = this.metadata.tileMatrixSetLinks || [];
    this.resourceUrls = this.metadata.resourceUrls || [];
    this.serviceMetadata = this.metadata.service || null;
  }

  getLegendURL() {
    if (this.legendURL) {
      return this.legendURL;
    }
    if (this.host == null) {
      return "";
    }
    return (
      this.host +
      "/ows?service=" +
      this.servicio +
      "&version=" +
      this.version +
      "&request=GetLegendGraphic&" +
      "format=image/png&layer=" +
      this.nombre
    );
  }

  getBounds() {
    const values = [this.minx, this.miny, this.maxx, this.maxy].map(Number);
    const coordinateTolerance = 0.000001;
    if (
      values.some((value) => !Number.isFinite(value)) ||
      values[0] < -180 - coordinateTolerance ||
      values[2] > 180 + coordinateTolerance ||
      values[1] < -90 - coordinateTolerance ||
      values[3] > 90 + coordinateTolerance
    ) {
      return null;
    }
    const webMercatorLatitudeLimit = 85.0511287798;
    const normalized = [
      Math.max(-180, Math.min(180, values[0])),
      Math.max(
        -webMercatorLatitudeLimit,
        Math.min(webMercatorLatitudeLimit, values[1]),
      ),
      Math.max(-180, Math.min(180, values[2])),
      Math.max(
        -webMercatorLatitudeLimit,
        Math.min(webMercatorLatitudeLimit, values[3]),
      ),
    ];
    return [
      [
        Math.min(normalized[1], normalized[3]),
        Math.min(normalized[0], normalized[2]),
      ],
      [
        Math.max(normalized[1], normalized[3]),
        Math.max(normalized[0], normalized[2]),
      ],
    ];
  }

  getHostWMS() {
    if (this.host == null) {
      return "";
    }
    let owsHost = this.host;
    /* isMapserver = this.host.includes('cgi-bin');
        
        if (!isMapserver) {   
            if (this.servicio === "wms") { owsHost += "/wms?"};
            //if (this.servicio === "mapserver") { owsHost };
        } */
    if (
      this.servicio === "wms" &&
      owsHost.includes("/geoserver") &&
      !owsHost.endsWith("/wms")
    ) {
      owsHost += "/wms";
    }
    if (this.servicio === "wmts") {
      owsHost += "/gwc/service/wmts";
    }

    return owsHost;
  }
}

class CapaMapserver extends Capa {
  getHostWMS() {
    if (this.host == null) {
      return "";
    }
    return this.host + "?";
  }
}

/******************************************
Strategy para imprimir
******************************************/
class Impresor {
  imprimir(itemComposite) {
    return "";
  }
}

class ImpresorItemHTML extends Impresor {
  imprimir(item) {
    var childId = item.getId();
    let lyr = item.capa,
      legend,
      legendParams =
        _LEGEND_PARAMS + _LEGEND_OPTIONS + "forceTitles:off;forceLabels:off;",
      aux = {
        ...item,
        childid: childId,
        display_options: false,
        type: lyr.servicio,
      };
    app.setLayer(aux);
    app.layerNameByDomId[childId] = item.nombre;

    if (
      lyr.legendURL === null ||
      typeof lyr.legendURL === "undefined" ||
      lyr.legendURL === ""
    ) {
      if (lyr.servicio === "wms") {
        lyr.legendURL =
          lyr.host +
          "?service=WMS&request=GetLegendGraphic&format=image%2Fpng&version=1.1.1&layer=" +
          lyr.nombre;
      } else {
        lyr.legendURL = item.legendImg || ERROR_IMG;
      }
    }
    legend = lyr.legendURL.includes("GetLegendGraphic")
      ? lyr.legendURL + legendParams
      : lyr.legendURL;

    // following line adds layer when click is made
    let legendImg = `<div class='legend-layer'><img class='legend-img' style='width:20px;height:20px' loading='lazy' src='${legend}' onerror='showImageOnError(this);' onload='adaptToImage(this.parentNode)'></div>`;
    let activated = item.visible == true ? " active " : "",
      btnhtml = "";

    const btn = document.createElement("li");
    btn.id = childId;
    btn.classList = "capa list-group-item" + activated;
    btn.style.padding = "10px 1px 10px 1px";
    btn.setAttribute("onClick", `gestorMenu.muestraCapa('${childId}')`);

    const btn_title = document.createElement("div");
    btn_title.className = "capa-title";
    btn_title.innerHTML = legendImg;

    const btn_name = document.createElement("div");
    btn_name.className = "name-layer";
    btn_name.style.alignSelf = "center";

    const btn_link = document.createElement("a");
    btn_link.setAttribute("nombre", item.nombre);
    btn_link.href = "#";

    const btn_tooltip = document.createElement("span");
    btn_tooltip.setAttribute("data-toggle2", "tooltip");
    btn_tooltip.title = item.descripcion;
    btn_tooltip.innerHTML = item.titulo
      ? item.titulo.replace(/_/g, " ")
      : "por favor ingrese un nombre";

    const btn_options_icon = document.createElement("i");
    btn_options_icon.classList = "fas fa-angle-down";
    btn_options_icon.title = "Zoom a capa";

    const btn_options = document.createElement("div");
    btn_options.className = "layer-menu-options";
    btn_options.id = "layer-options-" + item.nombre;
    btn_options.setAttribute("onClick", "event.stopPropagation()");

    const btn_zoom = document.createElement("div");
    btn_zoom.className = "zoom-layer";
    btn_zoom.setAttribute("layername", item.nombre);
    btn_zoom.style.alignSelf = "center";

    const btn_zoom_icon = document.createElement("i");
    btn_zoom_icon.classList = "fas fa-search-plus";
    btn_zoom_icon.title = "Zoom a capa";

    const btn_opacity = document.createElement("div");
    btn_opacity.className = "opacity-layer";
    btn_opacity.setAttribute("layername", item.nombre);
    btn_opacity.style = "align-self: center; display: flex;";

    const btn_opacity_icon = document.createElement("i");
    btn_opacity_icon.classList = "fa-solid fa-circle-half-stroke";
    btn_opacity_icon.title = "Modificar la opacidad de la capa";

    /**
     * Adds a range input to change the layer's opacity
     */
    const input_opacity = document.createElement("input");
    input_opacity.id = "range-" + item.nombre;
    input_opacity.type = "range";
    input_opacity.min = "0";
    input_opacity.max = "1";
    input_opacity.step = "0.05";
    input_opacity.defaultValue = "1";
    input_opacity.style = "width: auto; margin-left: 10px;";
    input_opacity.setAttribute(
      "onInput",
      `overlayMaps['${item.nombre}'].setOpacity(this.value)`,
    );

    if (activated) {
      btn_options.style.display = "flex";
    } else {
      btn_options.style.display = "none";
    }

    btn_link.appendChild(btn_tooltip);
    btn_name.appendChild(btn_link);
    btn_title.appendChild(btn_name);

    btn_zoom.appendChild(btn_zoom_icon);
    btn_options.appendChild(btn_zoom);

    btn_opacity.appendChild(btn_opacity_icon);
    btn_opacity.appendChild(input_opacity);
    btn_options.appendChild(btn_opacity);
    btn_options.appendChild(input_opacity);

    btn.appendChild(btn_title);
    btn.appendChild(btn_options);

    return btn.outerHTML;
  }
}

class ImpresorItemWMSSelector extends Impresor {
  imprimir(itemComposite) {
    var childId = itemComposite.getId();

    return (
      "<option value='" +
      childId +
      "'>" +
      (itemComposite.titulo
        ? itemComposite.titulo.replace(/_/g, " ")
        : "por favor ingrese un nombre") +
      "</option>"
    );
  }
}

class ImpresorItemCapaBaseHTML extends Impresor {
  imprimir(itemComposite) {
    var childId = itemComposite.getId();
    let aux = {
      ...itemComposite,
      childid: childId,
      display_options: false,
      type: itemComposite.capa.servicio,
    };
    app.setLayer(aux);
    app.layerNameByDomId[childId] = itemComposite.nombre;

    var titulo = itemComposite.titulo
      ? itemComposite.titulo.replace(/_/g, " ")
      : "por favor ingrese un nombre";

    const OVERLAY_SWITCH = document.createElement("div");
    if (app.hillshade) {
      const enableHillshade = app.hillshade.addTo.find(
        (el) => el === itemComposite.capa.nombre,
      );
      if (enableHillshade) {
        const OVERLAY_CHECKBOX = document.createElement("input");
        OVERLAY_CHECKBOX.type = "checkbox";
        OVERLAY_CHECKBOX.id = "switch-" + itemComposite.capa.nombre;
        OVERLAY_CHECKBOX.title = itemComposite.capa.nombre;
        OVERLAY_CHECKBOX.classList.add("switch");
        OVERLAY_CHECKBOX.classList.add("hillshade");
        OVERLAY_CHECKBOX.disabled = true;

        if (OVERLAY_CHECKBOX.title == gestorMenu.getActiveBasemap()) {
          OVERLAY_CHECKBOX.disabled = false;
        }

        OVERLAY_CHECKBOX.setAttribute("onclick", "hillShade()");

        const OVERLAY_TOOLTIP = document.createElement("span");
        OVERLAY_TOOLTIP.classList.add("tooltiptext");
        OVERLAY_TOOLTIP.innerHTML =
          app.hillshade.switchLabel ?? "add Esri hillshade";

        const OVERLAY_LABEL = document.createElement("label");
        OVERLAY_LABEL.setAttribute("for", OVERLAY_CHECKBOX.id);
        OVERLAY_LABEL.appendChild(OVERLAY_TOOLTIP);

        OVERLAY_SWITCH.setAttribute("onclick", "event.stopPropagation()");
        OVERLAY_SWITCH.appendChild(OVERLAY_CHECKBOX);
        OVERLAY_SWITCH.appendChild(OVERLAY_LABEL);
      }
    }

    const iconSvg = `
    <svg class="basemap-info-icon-svg" xmlns="http://www.w3.org/2000/svg" height="16" width="6" viewBox="0 0 192 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32H96c17.7 0 32 14.3 32 32V448h32c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H64V256H32c-17.7 0-32-14.3-32-32z"/></svg>
        `;

    let minZoom = DEFAULT_MIN_ZOOM_LEVEL;
    let maxZoom = DEFAULT_MAX_ZOOM_LEVEL;
    const layer = baseLayers[gestorMenu.getLayerNameById(childId)];
    if (layer && layer.hasOwnProperty("zoom")) {
      minZoom = layer.zoom.min;
      maxZoom = layer.zoom.max;
    }

    const BASEMAP_THUMBNAIL = document.createElement("img");
    BASEMAP_THUMBNAIL.classList.add("img-rounded");
    BASEMAP_THUMBNAIL.loading = "lazy";
    BASEMAP_THUMBNAIL.src = itemComposite.getLegendImg();
    BASEMAP_THUMBNAIL.onerror = showImageOnError(this);
    BASEMAP_THUMBNAIL.alt = titulo;

    const TITLE_PARAGRAPH = document.createElement("p");
    TITLE_PARAGRAPH.style.margin = 0;
    TITLE_PARAGRAPH.innerText = titulo;
    TITLE_PARAGRAPH.classList.add("basemap-title");

    const BASEMAP_TITLE = document.createElement("div");
    BASEMAP_TITLE.classList.add("non-selectable-text");
    BASEMAP_TITLE.appendChild(TITLE_PARAGRAPH);

    const BASEMAP_INFO = document.createElement("div");
    BASEMAP_INFO.classList.add("base-layer-item-info");
    BASEMAP_INFO.appendChild(BASEMAP_THUMBNAIL);
    BASEMAP_INFO.appendChild(BASEMAP_TITLE);

    const BASEMAP_LEGEND_IMG = itemComposite.legend ?? null;
    const LEGEND_BTN_TEXT = STRINGS.basemap_legend_button_text;

    const BASEMAP_LEGEND = document.createElement("button");
    BASEMAP_LEGEND.classList = "ag-btn ag-btn-secondary";
    BASEMAP_LEGEND.style = "margin: 0; width: auto;";
    BASEMAP_LEGEND.innerHTML = LEGEND_BTN_TEXT;
    BASEMAP_LEGEND.setAttribute(
      "onclick",
      `clickReferencias("${BASEMAP_LEGEND_IMG}");`,
    );

    const BASEMAP_TOOLTIP = document.createElement("span");
    BASEMAP_TOOLTIP.id = itemComposite.nombre + "-tooltip";
    BASEMAP_TOOLTIP.classList.add("tooltiptext");
    BASEMAP_TOOLTIP.innerHTML = `<span>${STRINGS.basemap_min_zoom}<b>${minZoom}</b>${STRINGS.basemap_max_zoom}<b>${maxZoom}</b></span>`;
    BASEMAP_TOOLTIP.style =
      "-webkit-flex-direction: column; flex-direction: column; width: fit-content; height: fit-content; flex: 1 1 auto; padding: 5px;";
    BASEMAP_LEGEND_IMG ? BASEMAP_TOOLTIP.append(BASEMAP_LEGEND) : "";

    const INFO_ICON = document.createElement("div");
    INFO_ICON.classList.add("zoom-info-icon", "ag-btn", "ag-btn-secondary");
    INFO_ICON.innerHTML = iconSvg;
    INFO_ICON.appendChild(BASEMAP_TOOLTIP);
    INFO_ICON.setAttribute(
      "onclick",
      `let tooltips = document.querySelectorAll('.tooltiptext');
      tooltips.forEach(function(tooltip){
        if (tooltip.classList.contains("visible") && tooltip.id !== "${BASEMAP_TOOLTIP.id}") {
          toggleVisibility(tooltip.id);
        }
      });
      toggleVisibility("${BASEMAP_TOOLTIP.id}");
      event.stopPropagation();
      `,
    );

    const SECOND_DIV = document.createElement("div");
    SECOND_DIV.classList.add("base-layer-item");
    SECOND_DIV.setAttribute("nombre", itemComposite.nombre);
    SECOND_DIV.href = "#";
    SECOND_DIV.appendChild(BASEMAP_INFO);
    SECOND_DIV.appendChild(OVERLAY_SWITCH);
    SECOND_DIV.appendChild(INFO_ICON);

    const FIRST_DIV = document.createElement("div");
    FIRST_DIV.style.verticalAlign = "top";
    FIRST_DIV.appendChild(SECOND_DIV);

    const BASEMAP_ITEM = document.createElement("li");
    BASEMAP_ITEM.classList.add("list-group-item");
    BASEMAP_ITEM.id = childId;
    BASEMAP_ITEM.title = itemComposite.capa.nombre;
    BASEMAP_ITEM.setAttribute(
      "onclick",
      `function handleClick(){
        document.getElementById('collapseBaseMapLayers').classList.toggle('in')
        gestorMenu.muestraCapa("${childId}")
        let checkboxes = document.querySelectorAll('.hillshade')
        checkboxes.forEach(function(checkbox) {
          if(checkbox.title == gestorMenu.getActiveBasemap()){
            checkbox.disabled = false;
          }else{
            if(checkbox.checked == true){  
              hillShade()
              checkbox.checked = false;
            }
            checkbox.disabled = true;
          }
        });
      }
      if(gestorMenu.getActiveBasemap() != "${BASEMAP_ITEM.title}"){
        handleClick();  
        }else{
          document.getElementById('collapseBaseMapLayers').classList.toggle('in')
        }
      `,
    ); // 2nd sentence hides basemaps menu after click
    BASEMAP_ITEM.appendChild(FIRST_DIV);

    return BASEMAP_ITEM.outerHTML; // TODO: change reference fn for expect an object instead string
  }
}

class ImpresorGrupoHTML extends Impresor {
  imprimir(itemComposite) {
    var listaId = itemComposite.getId();
    var itemClass = "menu5";
    let seccion = itemComposite.seccion;
    const sectionStyle =
      itemComposite.sectionStyle || app.sectionStyles?.[seccion] || null;
    const styleAttributes = this.getSectionStyleAttributes(sectionStyle);
    const headerIcon = this.getHeaderIcon(sectionStyle?.header?.icon);

    const isExpanded = itemComposite.getActive() === true;
    const active = isExpanded ? " in" : "";

    return `
    <div id="${listaId}" class="${itemClass} panel-default${sectionStyle ? " section-custom-style" : ""}"${styleAttributes}>
      <div class="panel-heading" data-toggle="collapse" data-target="#${itemComposite.seccion}" aria-expanded="${isExpanded}">
        <h4 class="panel-title">
          ${headerIcon}<span id="${listaId}-a" class="item-group-title">${itemComposite.nombre}</span>
          <div class='item-group-short-desc'>
            <span data-toggle='tooltip' title='${itemComposite.descripcion}'>${itemComposite.shortDesc}</span>
          </div>
        </h4>
      </div>
      <div id='${itemComposite.seccion}' class='panel-collapse collapse${active}' aria-expanded='${isExpanded}'>
        <div class="panel-body">
          ${itemComposite.itemsStr}
        </div>
      </div>
    </div>
  `;
  }

  getSectionStyleAttributes(sectionStyle) {
    if (!sectionStyle) return "";

    const header = sectionStyle.header || {};
    const layers = sectionStyle.layers || {};
    const container = sectionStyle.container || {};
    const variables = {
      "--section-header-bg-color": header.backgroundColor,
      "--section-header-bg-image": this.getHeaderBackgroundImage(header),
      "--section-header-bg-size": header.backgroundSize,
      "--section-header-bg-position": header.backgroundPosition,
      "--section-header-bg-repeat": header.backgroundRepeat,
      "--section-header-color": header.color,
      "--section-header-font-family": header.fontFamily,
      "--section-header-font-size": header.fontSize,
      "--section-header-font-weight": header.fontWeight,
      "--section-header-font-style": header.fontStyle,
      "--section-header-text-transform": header.textTransform,
      "--section-header-letter-spacing": header.letterSpacing,
      "--section-header-line-height": header.lineHeight,
      "--section-header-text-decoration": header.textDecoration,
      "--section-header-text-align": header.textAlign,
      "--section-header-border-radius": header.borderRadius,
      "--section-header-icon-color": header.icon?.color,
      "--section-header-icon-size": header.icon?.size,
      "--section-layer-color": layers.color,
      "--section-layer-bg-color": layers.backgroundColor,
      "--section-layer-font-family": layers.fontFamily,
      "--section-layer-font-size": layers.fontSize,
      "--section-layer-font-weight": layers.fontWeight,
      "--section-layer-font-style": layers.fontStyle,
      "--section-layer-text-transform": layers.textTransform,
      "--section-layer-letter-spacing": layers.letterSpacing,
      "--section-layer-line-height": layers.lineHeight,
      "--section-layer-text-decoration": layers.textDecoration,
      "--section-container-bg-color": container.backgroundColor,
      "--section-container-bg-image": this.normalizeBackgroundImage(container.backgroundImage),
      "--section-container-padding": container.padding,
      "--section-container-border": container.border,
      "--section-container-border-radius": container.borderRadius,
    };
    const css = Object.entries(variables)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([name, value]) => `${name}:${String(value).replace(/[\"<>]/g, "")}`)
      .join(";");
    return css ? ` style="${css}"` : "";
  }

  normalizeBackgroundImage(value) {
    if (!value) return value;
    return /^(url\(|linear-gradient\(|radial-gradient\()/i.test(value)
      ? value
      : `url('${String(value).replace(/['\"<>]/g, "")}')`;
  }

  getHeaderBackgroundImage(header) {
    const image = this.normalizeBackgroundImage(header.backgroundImage);
    const gradient =
      header.backgroundGradient === true
        ? "linear-gradient(90deg, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.38))"
        : header.backgroundGradient;

    if (gradient && image) return `${gradient}, ${image}`;
    return gradient || image;
  }

  getHeaderIcon(icon) {
    if (!icon) return "";

    if (typeof icon === "string") {
      icon = /^fa(?:s|r|b|l|d)?(?:-|\s)|^fa-solid\s|^fa-regular\s|^fa-brands\s/i.test(icon)
        ? { type: "font-awesome", class: icon }
        : { type: "file", src: icon };
    }

    const label = String(icon.alt || "").replace(/[\"<>]/g, "");
    const iconClass = icon.class || icon.fontAwesome;
    const imageSource = icon.src || icon.url;
    const iconType = String(icon.type || "").toLowerCase();
    const isFontAwesome =
      iconType === "font-awesome" ||
      iconType === "fontawesome" ||
      (!iconType && iconClass);
    const isImage =
      iconType === "image" ||
      iconType === "file" ||
      (!iconType && imageSource);

    if (isFontAwesome && iconClass) {
      const className = String(iconClass).replace(/[^a-zA-Z0-9 _-]/g, "");
      return `<i class="section-header-icon ${className}" aria-hidden="true"></i>`;
    }
    if (isImage && imageSource) {
      const src = String(imageSource).replace(/[\"<>]/g, "");
      return `<img class="section-header-icon" src="${src}" alt="${label}">`;
    }
    return "";
  }
}

class ImpresorGroupWMSSelector extends Impresor {
  imprimir(itemComposite) {
    var listaId = itemComposite.getId();

    return (
      "<option value='" + listaId + "'>" + itemComposite.nombre + "</option>"
    );
  }
}

class ImpresorCapasBaseHTML extends Impresor {
  imprimir(itemComposite) {
    var listaId = itemComposite.getId();
    // Only one basemap-selector
    if (!document.querySelector("div#basemap-selector > ul")) {
      const baseMapsMenu = document.createElement("a");
      baseMapsMenu.classList = "leaflet-control-layers-toggle";
      baseMapsMenu.title = itemComposite.nombre;
      baseMapsMenu.setAttribute("role", "button");
      baseMapsMenu.setAttribute("data-toggle", "collapse");
      baseMapsMenu.setAttribute("aria-expanded", "false");
      //baseMapsMenu.setAttribute('aria-controls', 'collapseExample');
      //baseMapsMenu.href = '#collapseBaseMapLayers';

      const baseMapsList = document.createElement("ul");
      baseMapsList.id = "collapseBaseMapLayers";
      baseMapsList.classList = "list-inline";
      baseMapsList.innerHTML = itemComposite.itemsStr;

      baseMapsMenu.appendChild(baseMapsList);

      baseMapsMenu.addEventListener("click", function (event) {
        event.preventDefault();
        baseMapsContainer.classList.toggle("in");
      });
      baseMapsMenu.addEventListener("dblclick", function (event) {
        event.stopPropagation();
      });

      return baseMapsList;
    }
  }
}

/******************************************
Strategy for get layers info
******************************************/
class LayersInfo {
  constructor() {
    this.allowed_layers = null;
    this.customized_layers = null;
  }

  setAllowebLayers(allowed) {
    this.allowed_layers = allowed;
  }

  setCustomizedLayers(customized_layers) {
    this.customized_layers = customized_layers;
  }

  isAllowedLayer(layer_name) {
    if (this.allowed_layers != null) {
      return this.allowed_layers.includes(layer_name);
    }
    if (this.customized_layers != null) {
      return Object.prototype.hasOwnProperty.call(
        this.customized_layers,
        layer_name,
      );
    }
    return true;
  }

  getDirectChildren(element, localName) {
    if (!element) {
      return [];
    }
    const expectedName = localName.toLowerCase();
    return Array.from(element.children || []).filter(
      (child) => child.localName?.toLowerCase() === expectedName,
    );
  }

  getDirectChild(element, localName) {
    return this.getDirectChildren(element, localName)[0] || null;
  }

  getDescendants(element, localName) {
    if (!element) {
      return [];
    }
    const expectedName = localName.toLowerCase();
    return Array.from(element.getElementsByTagName("*")).filter(
      (child) => child.localName?.toLowerCase() === expectedName,
    );
  }

  getFirstDescendant(element, localName) {
    return this.getDescendants(element, localName)[0] || null;
  }

  getElementText(element) {
    return element?.textContent?.trim() || "";
  }

  getElementAttributes(element) {
    return Object.fromEntries(
      Array.from(element?.attributes || []).map((attribute) => [
        attribute.name,
        attribute.value,
      ]),
    );
  }

  getOnlineResource(element) {
    const elementHref =
      element?.getAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href",
      ) ||
      element?.getAttribute("xlink:href") ||
      element?.getAttribute("href");
    if (elementHref) {
      return elementHref;
    }
    const resource = this.getFirstDescendant(element, "OnlineResource");
    return (
      resource?.getAttributeNS("http://www.w3.org/1999/xlink", "href") ||
      resource?.getAttribute("xlink:href") ||
      resource?.getAttribute("href") ||
      null
    );
  }

  parseXmlDocument(responseText) {
    const xmlDoc = new DOMParser().parseFromString(responseText, "text/xml");
    if (this.getFirstDescendant(xmlDoc, "parsererror")) {
      throw new Error("Invalid GetCapabilities XML response");
    }
    return xmlDoc;
  }

  parseOwsServiceMetadata(xmlDoc) {
    const identification =
      this.getFirstDescendant(xmlDoc, "ServiceIdentification") ||
      this.getFirstDescendant(xmlDoc, "Service");
    const provider = this.getFirstDescendant(xmlDoc, "ServiceProvider");
    const operationElements = this.getDescendants(xmlDoc, "Operation");
    return {
      attributes: this.getElementAttributes(identification),
      title: this.getElementText(
        this.getDirectChild(identification, "Title"),
      ),
      abstract: this.getElementText(
        this.getDirectChild(identification, "Abstract"),
      ),
      keywords: this.getDescendants(
        this.getDirectChild(identification, "Keywords") ||
          this.getDirectChild(identification, "KeywordList"),
        "Keyword",
      ).map((keyword) => this.getElementText(keyword)),
      serviceType: this.getElementText(
        this.getDirectChild(identification, "ServiceType"),
      ),
      serviceTypeVersions: this.getDirectChildren(
        identification,
        "ServiceTypeVersion",
      ).map((version) => this.getElementText(version)),
      fees: this.getElementText(this.getDirectChild(identification, "Fees")),
      accessConstraints: this.getDirectChildren(
        identification,
        "AccessConstraints",
      ).map((constraint) => this.getElementText(constraint)),
      provider: provider
        ? {
            name: this.getElementText(
              this.getDirectChild(provider, "ProviderName"),
            ),
            site: this.getOnlineResource(
              this.getDirectChild(provider, "ProviderSite"),
            ),
          }
        : null,
      operations: operationElements.map((operation) => ({
        name: operation.getAttribute("name"),
        endpoints: this.getDescendants(operation, "Get")
          .concat(this.getDescendants(operation, "Post"))
          .map(
            (endpoint) =>
              endpoint.getAttributeNS(
                "http://www.w3.org/1999/xlink",
                "href",
              ) ||
              endpoint.getAttribute("xlink:href") ||
              endpoint.getAttribute("href"),
          )
          .filter(Boolean),
      })),
    };
  }

  get(_gestorMenu) {
    //You must redefine this method to get layers from other sources
    return null;
  }

  formatLayerTitle(layer_name, layer_title) {
    if (this.customized_layers == null) {
      return layer_title;
    }
    if (
      this.customized_layers[layer_name] &&
      this.customized_layers[layer_name]["new_title"]
    ) {
      return this.customized_layers[layer_name]["new_title"];
    }
    return layer_title;
  }

  formatLayerAbstract(layer_name, layer_abstract) {
    if (this.customized_layers == null) {
      return layer_abstract;
    }
    if (
      this.customized_layers[layer_name] &&
      this.customized_layers[layer_name]["new_abstract"]
    ) {
      return this.customized_layers[layer_name]["new_abstract"];
    }
    return layer_abstract;
  }
}

class LayersInfoWMS extends LayersInfo {
  constructor(
    host,
    service,
    version,
    tab,
    section,
    weight,
    name,
    short_abstract,
    feature_info_format,
    type,
    icons,
    customizedLayers,
    itemGroupPrinter,
  ) {
    super();
    this.host = host;
    this.service = service;
    this.version = version;
    this.tab = tab;
    this.section = section;
    this.weight = weight;
    this.name = name;
    this.short_abstract = short_abstract;
    this.feature_info_format = feature_info_format;
    this.type = type;
    this.icons = icons || null;
    this.customizedLayers = customizedLayers == "" ? null : customizedLayers;
    this.itemGroupPrinter =
      itemGroupPrinter == "" ? new ImpresorGrupoHTML() : itemGroupPrinter;

    this._executed = false;
    this._loadPromise = null;
  }

  get(_gestorMenu) {
    if (this._executed == false) {
      this._executed = true; //Indicates that getCapabilities executed
      this._loadPromise = this._parseRequest(_gestorMenu);
    }
    return this._loadPromise || Promise.resolve();
  }

  get_without_print(_gestorMenu) {
    this._parseRequest_without_print(_gestorMenu);
  }

  generateGroups(_gestorMenu) {
    const impresorGroup = this.itemGroupPrinter;
    const impresorItem = new ImpresorItemHTML();

    var thisObj = this;

    //Instance an empty ItemGroup (without items)
    var groupAux = new ItemGroup(
      thisObj.tab,
      thisObj.name,
      thisObj.section,
      thisObj.weight,
      "",
      "",
      thisObj.short_abstract,
    );
    groupAux.setImpresor(impresorGroup);
    groupAux.setObjDom(gestorMenu.getItemsGroupDOM());
    _gestorMenu.addItemGroup(groupAux);
  }

  /**
   * Parses the request to fetch and process WMS capabilities,
   * creating menu items based on the available layers.
   *
   * @param {Object} gestorMenu - The menu manager object responsible for handling layers.
   */
  _parseRequest(gestorMenu) {
    const {
      itemGroupPrinter: impresorGroup,
      tab,
      host,
      service,
      version,
      type,
      icons,
      section,
      weight,
      short_abstract,
    } = this;
    const impresorItem = new ImpresorItemHTML();

    // Default listType to null if not provided
    const listType = tab.listType || null;

    // Construct the URL for fetching WMS capabilities
    const serviceParams = `?service=${service}&version=${version}&request=GetCapabilities`;
    const hostUrl = `${this.getHostOWS()}${serviceParams}`;

    return fetch(hostUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `GetCapabilities request failed: ${response.status} ${response.statusText}`,
          );
        }
        return response.text();
      })
      .then((responseText) => {
        const xmlDoc = this.parseXmlDocument(responseText);
        const capability = this.getFirstDescendant(xmlDoc, "Capability");
        const rootLayer = this.getDirectChild(capability, "Layer");
        this.serviceMetadata = this._parseWmsServiceMetadata(
          xmlDoc,
          capability,
          rootLayer,
        );

        const capaInfoList = this.getDescendants(rootLayer, "Layer")
          .filter((layer) => {
            const hasNestedLayers =
              this.getDirectChildren(layer, "Layer").length > 0;
            if (hasNestedLayers) {
              return false;
            }
            const iName = this.getElementText(
              this.getDirectChild(layer, "Name"),
            );
            return this.isAllowedLayer(iName);
          })
          .map((layer, index) =>
            this._createMenuItem(
              layer,
              index,
              impresorItem,
              listType,
              rootLayer,
            ),
          )
          .filter((item) => item !== null);

        this._createAndAddItemGroup(
          gestorMenu,
          impresorGroup,
          this.serviceMetadata.keywords[0] || "",
          this.serviceMetadata.abstract || "",
          capaInfoList,
        );
      })
      .catch((error) => {
        console.error("Error loading capabilities:", error);
        if (gestorMenu.getLazyInitialization()) {
          gestorMenu.removeLazyInitLayerInfoCounter(
            `${ItemGroupPrefix}${this.section}`,
          );
          if (
            gestorMenu.finishLazyInitLayerInfo(
              `${ItemGroupPrefix}${this.section}`,
            )
          ) {
            gestorMenu.printOnlySection(this.section);
          }
        }
      });
  }

  _parseWmsServiceMetadata(xmlDoc, capability, rootLayer) {
    const metadata = this.parseOwsServiceMetadata(xmlDoc);
    const request = this.getDirectChild(capability, "Request");
    const requestFormats = {};
    for (const operation of Array.from(request?.children || [])) {
      requestFormats[operation.localName] = this.getDirectChildren(
        operation,
        "Format",
      ).map((format) => this.getElementText(format));
    }
    return {
      ...metadata,
      version: xmlDoc.documentElement.getAttribute("version") || this.version,
      onlineResource: this.getOnlineResource(
        this.getFirstDescendant(xmlDoc, "Service"),
      ),
      requestFormats,
      geographicBoundingBox: this._getWmsGeographicBoundingBox(
        rootLayer,
        rootLayer,
      ),
    };
  }

  _getWmsLayerHierarchy(layer, rootLayer) {
    const hierarchy = [];
    let current = layer;
    while (current) {
      if (current.localName?.toLowerCase() === "layer") {
        hierarchy.push(current);
      }
      if (current === rootLayer) {
        break;
      }
      current = current.parentElement;
    }
    return hierarchy;
  }

  _parseWmsBoundingBoxes(layer, rootLayer) {
    const boundingBoxes = [];
    for (const current of this._getWmsLayerHierarchy(layer, rootLayer)) {
      for (const boundingBox of this.getDirectChildren(
        current,
        "BoundingBox",
      )) {
        const parsed = {
          crs:
            boundingBox.getAttribute("CRS") ||
            boundingBox.getAttribute("SRS") ||
            null,
          minx: Number(boundingBox.getAttribute("minx")),
          miny: Number(boundingBox.getAttribute("miny")),
          maxx: Number(boundingBox.getAttribute("maxx")),
          maxy: Number(boundingBox.getAttribute("maxy")),
          resx: Number(boundingBox.getAttribute("resx")) || null,
          resy: Number(boundingBox.getAttribute("resy")) || null,
        };
        if (
          [parsed.minx, parsed.miny, parsed.maxx, parsed.maxy].every(
            Number.isFinite,
          ) &&
          !boundingBoxes.some(
            (existing) =>
              existing.crs === parsed.crs &&
              existing.minx === parsed.minx &&
              existing.miny === parsed.miny &&
              existing.maxx === parsed.maxx &&
              existing.maxy === parsed.maxy,
          )
        ) {
          boundingBoxes.push(parsed);
        }
      }
    }
    return boundingBoxes;
  }

  _parseWmsGeographicElement(layer) {
    const geographic = this.getDirectChild(layer, "EX_GeographicBoundingBox");
    if (geographic) {
      return {
        west: Number(
          this.getElementText(
            this.getDirectChild(geographic, "westBoundLongitude"),
          ),
        ),
        south: Number(
          this.getElementText(
            this.getDirectChild(geographic, "southBoundLatitude"),
          ),
        ),
        east: Number(
          this.getElementText(
            this.getDirectChild(geographic, "eastBoundLongitude"),
          ),
        ),
        north: Number(
          this.getElementText(
            this.getDirectChild(geographic, "northBoundLatitude"),
          ),
        ),
        crs: "CRS:84",
      };
    }

    const latLon = this.getDirectChild(layer, "LatLonBoundingBox");
    if (latLon) {
      return {
        west: Number(latLon.getAttribute("minx")),
        south: Number(latLon.getAttribute("miny")),
        east: Number(latLon.getAttribute("maxx")),
        north: Number(latLon.getAttribute("maxy")),
        crs: "CRS:84",
      };
    }
    return null;
  }

  _isValidGeographicBoundingBox(boundingBox) {
    const coordinateTolerance = 0.000001;
    return (
      boundingBox != null &&
      [
        boundingBox.west,
        boundingBox.south,
        boundingBox.east,
        boundingBox.north,
      ].every(Number.isFinite) &&
      boundingBox.west >= -180 - coordinateTolerance &&
      boundingBox.east <= 180 + coordinateTolerance &&
      boundingBox.south >= -90 - coordinateTolerance &&
      boundingBox.north <= 90 + coordinateTolerance
    );
  }

  _getWmsGeographicBoundingBox(layer, rootLayer) {
    for (const current of this._getWmsLayerHierarchy(layer, rootLayer)) {
      const geographic = this._parseWmsGeographicElement(current);
      if (this._isValidGeographicBoundingBox(geographic)) {
        return geographic;
      }
    }

    const boundingBoxes = this._parseWmsBoundingBoxes(layer, rootLayer);
    const crs84 = boundingBoxes.find(
      (boundingBox) =>
        String(boundingBox.crs).toUpperCase() === "CRS:84",
    );
    if (crs84) {
      return {
        west: Math.min(crs84.minx, crs84.maxx),
        south: Math.min(crs84.miny, crs84.maxy),
        east: Math.max(crs84.minx, crs84.maxx),
        north: Math.max(crs84.miny, crs84.maxy),
        crs: crs84.crs,
      };
    }

    const epsg4326 = boundingBoxes.find(
      (boundingBox) =>
        String(boundingBox.crs).toUpperCase() === "EPSG:4326",
    );
    if (!epsg4326) {
      return null;
    }
    const usesLatitudeFirst =
      String(this.version || "").startsWith("1.3");
    const geographic = usesLatitudeFirst
      ? {
          west: Math.min(epsg4326.miny, epsg4326.maxy),
          south: Math.min(epsg4326.minx, epsg4326.maxx),
          east: Math.max(epsg4326.miny, epsg4326.maxy),
          north: Math.max(epsg4326.minx, epsg4326.maxx),
          crs: epsg4326.crs,
        }
      : {
          west: Math.min(epsg4326.minx, epsg4326.maxx),
          south: Math.min(epsg4326.miny, epsg4326.maxy),
          east: Math.max(epsg4326.minx, epsg4326.maxx),
          north: Math.max(epsg4326.miny, epsg4326.maxy),
          crs: epsg4326.crs,
        };
    return this._isValidGeographicBoundingBox(geographic)
      ? geographic
      : null;
  }

  _parseWmsStyles(layer, rootLayer) {
    const styles = [];
    for (const current of this._getWmsLayerHierarchy(layer, rootLayer)) {
      for (const style of this.getDirectChildren(current, "Style")) {
        const name = this.getElementText(this.getDirectChild(style, "Name"));
        if (styles.some((existing) => existing.name === name)) {
          continue;
        }
        const legend = this.getFirstDescendant(style, "LegendURL");
        styles.push({
          attributes: this.getElementAttributes(style),
          name,
          title: this.getElementText(this.getDirectChild(style, "Title")),
          abstract: this.getElementText(
            this.getDirectChild(style, "Abstract"),
          ),
          legendURL: this.getOnlineResource(legend),
          legendFormat: this.getElementText(
            this.getDirectChild(legend, "Format"),
          ),
          legendWidth: Number(legend?.getAttribute("width")) || null,
          legendHeight: Number(legend?.getAttribute("height")) || null,
        });
      }
    }
    return styles;
  }

  _parseWmsDimensions(layer, rootLayer) {
    const dimensions = [];
    for (const current of this._getWmsLayerHierarchy(layer, rootLayer)) {
      const currentDimensions = [
        ...this.getDirectChildren(current, "Dimension"),
        ...this.getDirectChildren(current, "Extent"),
      ];
      for (const dimension of currentDimensions) {
        const name = dimension.getAttribute("name");
        dimensions.push({
          attributes: this.getElementAttributes(dimension),
          name,
          units: dimension.getAttribute("units"),
          unitSymbol: dimension.getAttribute("unitSymbol"),
          default: dimension.getAttribute("default"),
          multipleValues: dimension.getAttribute("multipleValues") === "1",
          nearestValue: dimension.getAttribute("nearestValue") === "1",
          current: dimension.getAttribute("current") === "1",
          values: this.getElementText(dimension),
        });
      }
    }
    return dimensions;
  }

  /**
   * Creates a menu item from the layer information.
   *
   * @param {Element} layer - The layer XML element.
   * @param {number} index - The index of the layer in the list.
   * @param {Object} impresorItem - The printer item object.
   * @param {string|null} listType - The type of the list.
   * @returns {Item|null} The created menu item or null if an error occurs.
   */
  _createMenuItem(layer, index, impresorItem, listType, rootLayer) {
    try {
      const iName = this.getElementText(this.getDirectChild(layer, "Name"));
      const advertisedTitle = this.getElementText(
        this.getDirectChild(layer, "Title"),
      );
      const advertisedAbstract = this.getElementText(
        this.getDirectChild(layer, "Abstract"),
      );
      const iTitle = this.formatLayerTitle(iName, advertisedTitle);
      const iAbstract = this.formatLayerAbstract(iName, advertisedAbstract);
      const customizedLayer =
        this.customized_layers?.[iName] ||
        this.customizedLayers?.[iName] ||
        null;
      const advertisedKeywords = this.getDescendants(
        this.getDirectChild(layer, "KeywordList"),
        "Keyword",
      ).map((keyword) => this.getElementText(keyword));
      const keywords =
        customizedLayer?.new_keywords
          ?.split(",")
          .map((keyword) => keyword.trim())
          .filter(Boolean) || advertisedKeywords;
      const boundingBoxes = this._parseWmsBoundingBoxes(layer, rootLayer);
      const geographicBoundingBox = this._getWmsGeographicBoundingBox(
        layer,
        rootLayer,
      );
      const styles = this._parseWmsStyles(layer, rootLayer);
      const legendURL =
        this.icons?.[iName] ||
        customizedLayer?.legend ||
        styles.find((style) => style.legendURL)?.legendURL ||
        null;
      const crs = [
        ...new Set(
          this._getWmsLayerHierarchy(layer, rootLayer).flatMap((current) => [
            ...this.getDirectChildren(current, "CRS"),
            ...this.getDirectChildren(current, "SRS"),
          ]),
        ),
      ]
        .map((crsElement) => this.getElementText(crsElement))
        .filter(Boolean);
      const attributionElement = this._getWmsLayerHierarchy(
        layer,
        rootLayer,
      )
        .map((current) => this.getDirectChild(current, "Attribution"))
        .find(Boolean);
      const attribution = attributionElement
        ? {
            title: this.getElementText(
              this.getDirectChild(attributionElement, "Title"),
            ),
            url: this.getOnlineResource(attributionElement),
          }
        : null;
      const metadata = {
        attributes: this.getElementAttributes(layer),
        abstract: iAbstract,
        advertisedTitle,
        advertisedAbstract,
        keywords,
        crs,
        boundingBoxes,
        geographicBoundingBox,
        styles,
        dimensions: this._parseWmsDimensions(layer, rootLayer),
        formats: this.serviceMetadata.requestFormats?.GetMap || [],
        infoFormats:
          this.serviceMetadata.requestFormats?.GetFeatureInfo || [],
        queryable:
          this._getWmsLayerHierarchy(layer, rootLayer)
            .map((current) => current.getAttribute("queryable"))
            .find((value) => value != null) === "1",
        opaque:
          this._getWmsLayerHierarchy(layer, rootLayer)
            .map((current) => current.getAttribute("opaque"))
            .find((value) => value != null) === "1",
        cascaded: Number(layer.getAttribute("cascaded")) || 0,
        noSubsets: layer.getAttribute("noSubsets") === "1",
        fixedWidth: Number(layer.getAttribute("fixedWidth")) || null,
        fixedHeight: Number(layer.getAttribute("fixedHeight")) || null,
        minScaleDenominator:
          Number(
            this.getElementText(
              this.getDirectChild(layer, "MinScaleDenominator"),
            ),
          ) || null,
        maxScaleDenominator:
          Number(
            this.getElementText(
              this.getDirectChild(layer, "MaxScaleDenominator"),
            ),
          ) || null,
        attribution,
        metadataUrls: this.getDirectChildren(layer, "MetadataURL").map(
          (metadataUrl) => ({
            type: metadataUrl.getAttribute("type"),
            format: this.getElementText(
              this.getDirectChild(metadataUrl, "Format"),
            ),
            url: this.getOnlineResource(metadataUrl),
          }),
        ),
        service: this.serviceMetadata,
      };

      // Create appropriate capa object based on type
      const capa = this._createCapaObject(
        iName,
        iTitle,
        geographicBoundingBox?.crs || crs[0] || null,
        geographicBoundingBox?.west ?? null,
        geographicBoundingBox?.east ?? null,
        geographicBoundingBox?.south ?? null,
        geographicBoundingBox?.north ?? null,
        keywords,
        attribution,
        legendURL,
        metadata,
      );

      // Create and return menu item
      const item = new Item(
        capa.nombre,
        `${this.section}${index}`,
        keywords,
        iAbstract,
        capa.titulo,
        capa,
        this.getCallback(),
        null,
        legendURL,
        listType,
      );
      item.setLegendImgPreformatted(gestorMenu.getLegendImgPath());
      item.setImpresor(impresorItem);
      gestorMenu.setAvailableLayer(iName);
      return item;
    } catch (err) {
      console.error(
        `Error processing layer '${layer.querySelector("Name")?.textContent || ""}':`,
        err,
      );
      // Return null for failed items
      return null;
    }
  }

  /**
   * Creates a Capa or CapaMapserver object based on the provided information.
   *
   * @param {string} name - The name of the layer.
   * @param {string} title - The title of the layer.
   * @param {string|null} srs - The spatial reference system.
   * @param {string|null} minX - The minimum X coordinate.
   * @param {string|null} maxX - The maximum X coordinate.
   * @param {string|null} minY - The minimum Y coordinate.
   * @param {string|null} maxY - The maximum Y coordinate.
   * @param {Array<string>} keywords - The keywords associated with the layer.
   * @param {string|null} legendURL - The URL of the legend.
   * @returns {Capa|CapaMapserver} The created capa object.
   */
  _createCapaObject(
    name,
    title,
    srs,
    minX,
    maxX,
    minY,
    maxY,
    keywords,
    attribution,
    legendURL,
    metadata,
  ) {
    if (this.type === "wmslayer_mapserver") {
      return new CapaMapserver(
        name,
        title,
        srs,
        this.host,
        this.service,
        this.version,
        this.feature_info_format,
        keywords,
        minX,
        maxX,
        minY,
        maxY,
        attribution,
        legendURL,
        metadata,
      );
    } else {
      return new Capa(
        name,
        title,
        srs,
        this.host,
        this.service,
        this.version,
        this.feature_info_format,
        keywords,
        minX,
        maxX,
        minY,
        maxY,
        attribution,
        legendURL,
        metadata,
      );
    }
  }

  /**
   * Creates an item group and adds it to the menu manager.
   *
   * @param {Object} gestorMenu - The menu manager object.
   * @param {Object} impresorGroup - The printer group object.
   * @param {string} keyword - The keyword for the group.
   * @param {string} abstract - The abstract for the group.
   * @param {Array<Item>} items - The list of menu items.
   */
  _createAndAddItemGroup(gestorMenu, impresorGroup, keyword, abstract, items) {
    let groupAux;
    try {
      groupAux = new ItemGroup(
        this.tab,
        this.name,
        this.section,
        this.weight,
        keyword,
        abstract,
        this.short_abstract,
      );
    } catch (err) {
      console.error("Error creating item group", err);
      groupAux = new ItemGroup(
        this.tab,
        this.name,
        this.section,
        this.weight,
        "",
        "",
        this.short_abstract,
      );
    }
    groupAux.setImpresor(impresorGroup);
    groupAux.setObjDom(gestorMenu.getItemsGroupDOM());
    items.forEach((item) => groupAux.setItem(item));
    // Add item group to menu manager
    gestorMenu.addItemGroup(groupAux);

    // Handle menu printing based on initialization mode
    if (gestorMenu.getLazyInitialization()) {
      gestorMenu.removeLazyInitLayerInfoCounter(
        `${ItemGroupPrefix}${this.section}`,
      );
      if (
        gestorMenu.finishLazyInitLayerInfo(`${ItemGroupPrefix}${this.section}`)
      ) {
        // If all requested layers have been loaded
        gestorMenu.printOnlySection(this.section);
      }
    } else {
      gestorMenu.addLayerInfoCounter();
      if (gestorMenu.finishLayerInfo()) {
        // If all requested layers have been loaded
        gestorMenu.printMenu();
        gestorMenu.markAllLayersAsLoaded();
      }
    }
  }

  async _parseRequest_without_print(_gestorMenu) {
    const impresorGroup = this.itemGroupPrinter;
    const impresorItem = new ImpresorItemHTML();
    const nuevo_impresor = new Menu_UI();

    var thisObj = this;

    var ilistType = null;
    if (this.tab.listType) {
      ilistType = this.tab.listType;
    }

    let tempMenu = document.getElementById("temp-menu");
    if (!tempMenu) {
      tempMenu = document.createElement("div");
      tempMenu.id = "temp-menu";
      tempMenu.className = "temp";
      tempMenu.style.display = "none";
      document.body.appendChild(tempMenu);
    }

    // Load geoserver Capabilities, if success Create menu and append to DOM
    try {
      const response = await fetch(
        thisObj.getHostOWS() +
        "?service=" +
        thisObj.service +
        "&version=" +
        thisObj.version +
        "&request=GetCapabilities",
      );
      if (!response.ok) {
        throw new Error(`GetCapabilities returned HTTP ${response.status}`);
      }
      const capabilitiesDocument = new DOMParser().parseFromString(
        await response.text(),
        "application/xml",
      );
      if (capabilitiesDocument.querySelector("parsererror")) {
        throw new Error("Invalid GetCapabilities XML response");
      }
      const elementsByName = (root, name) =>
        Array.from(root?.getElementsByTagName("*") || []).filter(
          (element) => element.localName.toLowerCase() === name.toLowerCase(),
        );
        var capability = elementsByName(capabilitiesDocument, "capability")[0];
        var keywordHtml = elementsByName(capabilitiesDocument, "keyword");
        var keyword = "";
        if (keywordHtml.length > 0) {
          keyword = keywordHtml[0].textContent; // reads 1st keyword for filtering sections if needed
        }
        var abstractHtml = elementsByName(capabilitiesDocument, "abstract");
        var abstract = "";
        if (abstractHtml.length > 0) {
          abstract = abstractHtml[0].textContent; // reads wms 1st abstract
        }
        var capas_layer = elementsByName(capability, "layer");
        var capas_info = capas_layer.slice(1);

        var items = new Array();

        // create an object with all layer info for each layer
        capas_info.forEach(function (i, index) {
          var iName = elementsByName(i, "name")[0]?.textContent;
          if (thisObj.isAllowedLayer(iName)) {
            var iTitle = elementsByName(i, "title")[0]?.textContent;
            iTitle = thisObj.formatLayerTitle(iName, iTitle);
            var iAbstract = elementsByName(i, "abstract")[0]?.textContent;
            iAbstract = thisObj.formatLayerAbstract(iName, iAbstract);
            var keywords = elementsByName(i, "keyword").map(
              (element) => element.textContent,
            );
            var iBoundingBox = elementsByName(i, "boundingbox");
            const boundingBoxAttribute = (name) =>
              Array.from(iBoundingBox[0]?.attributes || []).find(
                (attribute) => attribute.name.toLowerCase() === name,
              )?.value;
            var iSrs = null;
            var iMaxY = null;
            var iMinY = null;
            var iMinX = null;
            var iMaxX = null;
            var ilegendURLaux = elementsByName(i, "style")[0]?.innerHTML || "";
            let divi = document.createElement("div");
            let aux = null;
            divi.innerHTML = ilegendURLaux;
            /* if (divi.getElementsByTagName("onlineresource")) { // makes an error in some services
                      aux = divi.getElementsByTagName("onlineresource")[0].getAttribute("xlink:href");
                    } */
            var ilegendURL = aux;

            if (iBoundingBox.length > 0) {
              var iSrs = boundingBoxAttribute("srs") || boundingBoxAttribute("crs");
              var iMaxY = boundingBoxAttribute("maxy");
              var iMinY = boundingBoxAttribute("miny");
              var iMinX = boundingBoxAttribute("minx");
              var iMaxX = boundingBoxAttribute("maxx");
            }

            if (thisObj.type == "wmslayer_mapserver") {
              var capa = new CapaMapserver(
                iName,
                iTitle,
                iSrs,
                thisObj.host,
                thisObj.service,
                thisObj.version,
                thisObj.feature_info_format,
                iMinX,
                iMaxX,
                iMinY,
                iMaxY,
              );
            } else {
              var capa = new Capa(
                iName,
                iTitle,
                iSrs,
                thisObj.host,
                thisObj.service,
                thisObj.version,
                thisObj.feature_info_format,
                keywords,
                iMinX,
                iMaxX,
                iMinY,
                iMaxY,
                null,
                ilegendURL,
              );
              gestorMenu.layersDataForWfs[capa.nombre] = {
                name: capa.nombre,
                section: capa.titulo,
                host: capa.host,
              };
            }
            var item = new Item(
              capa.nombre,
              thisObj.section + index,
              keywords,
              iAbstract,
              capa.titulo,
              capa,
              thisObj.getCallback(),
              ilistType,
            );
            item.setLegendImgPreformatted(_gestorMenu.getLegendImgPath());
            item.setImpresor(impresorItem);
            items.push(item);
            gestorMenu.setAvailableLayer(iName);
          }
        });

        var groupAux;
        try {
          var groupAux = new ItemGroup(
            thisObj.tab,
            thisObj.name,
            thisObj.section,
            thisObj.weight,
            keyword,
            abstract,
            thisObj.short_abstract,
          );
          groupAux.setImpresor(impresorGroup);
          groupAux.setObjDom(_gestorMenu.getItemsGroupDOM());
          for (var i = 0; i < items.length; i++) {
            groupAux.setItem(items[i]);
          }
        } catch (err) {
          if (err.name == "ReferenceError") {
            var groupAux = new ItemGroup(
              thisObj.tab,
              thisObj.name,
              thisObj.section,
              thisObj.weight,
              "",
              "",
              thisObj.short_abstract,
            );
            groupAux.setImpresor(impresorGroup);
            groupAux.setObjDom(_gestorMenu.getItemsGroupDOM());
            for (var i = 0; i < items.length; i++) {
              groupAux.setItem(items[i]);
            }
          }
        }

        _gestorMenu.addItemGroup(groupAux);

        if (_gestorMenu.getLazyInitialization() == true) {
          _gestorMenu.removeLazyInitLayerInfoCounter(
            ItemGroupPrefix + thisObj.section,
          );
          if (
            _gestorMenu.finishLazyInitLayerInfo(
              ItemGroupPrefix + thisObj.section,
            )
          ) {
            //Si ya cargó todas las capas solicitadas
            _gestorMenu.printOnlySection(thisObj.section);
          }
        } else {
          _gestorMenu.addLayerInfoCounter();
          if (_gestorMenu.finishLayerInfo()) {
            //Si ya cargó todas las capas solicitadas
            _gestorMenu.printMenu();

            gestorMenu.markAllLayersAsLoaded();
          }
        }

        nuevo_impresor.addLayers_combobox(groupAux);
        tempMenu.innerHTML = "";
        return;
    } catch (error) {
      console.error("Unable to load legacy service capabilities:", error);
    }
  }

  getHostOWS() {
    //Define GetCapabilities host endpoint
    /* var host = this.host + '/ows';
        if (this.type == 'wmslayer_mapserver') {
            host = this.host;
        } */
    let host = this.host;
    if (
      this.service === "wms" &&
      host.includes("/geoserver") &&
      !host.endsWith("/wms")
    ) {
      host += "/wms";
    }
    return host;
  }

  getCallback() {
    //Define wich function handle onClick event
    var onClickHandler = "loadWmsTpl";
    return onClickHandler;
  }
}

class LayersInfoWMTS extends LayersInfoWMS {
  constructor(
    host,
    service,
    version,
    tab,
    section,
    weight,
    name,
    short_abstract,
    feature_info_format,
    type,
    icons,
    customizedLayers,
    itemGroupPrinter,
  ) {
    super();
    this.host = host;
    this.service = service;
    this.version = version;
    this.tab = tab;
    this.section = section;
    this.weight = weight;
    this.name = name;
    this.short_abstract = short_abstract;
    this.feature_info_format = feature_info_format;
    this.type = type;
    this.icons = icons || null;
    this.customizedLayers = customizedLayers == "" ? null : customizedLayers;
    this.itemGroupPrinter =
      itemGroupPrinter == "" ? new ImpresorGrupoHTML() : itemGroupPrinter;
    this._executed = false;
    this._loadPromise = null;
  }

  get(_gestorMenu) {
    if (this._executed == false) {
      this._executed = true; //Indicates that getCapabilities executed
      this._loadPromise = this._parseRequest(_gestorMenu);
    }
    return this._loadPromise || Promise.resolve();
  }

  generateGroups(_gestorMenu) {
    const impresorGroup = this.itemGroupPrinter;
    const impresorItem = new ImpresorItemHTML();

    var thisObj = this;

    var groupAux = new ItemGroup(
      thisObj.tab,
      thisObj.name,
      thisObj.section,
      thisObj.weight,
      "",
      "",
      thisObj.short_abstract,
    );
    groupAux.setImpresor(impresorGroup);
    groupAux.setObjDom(gestorMenu.getItemsGroupDOM());
    _gestorMenu.addItemGroup(groupAux);
  }

  _parseRequest(_gestorMenu) {
    const impresorGroup = this.itemGroupPrinter;
    const impresorItem = new ImpresorItemHTML();
    const serviceParams = `?service=${this.service}&version=${this.version}&request=GetCapabilities`;
    const host = this.getHost() + serviceParams;
    return fetch(host)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `GetCapabilities request failed: ${response.status} ${response.statusText}`,
          );
        }
        return response.text();
      })
      .then((responseText) => {
        const xmlDoc = this.parseXmlDocument(responseText);
        const contents = this.getFirstDescendant(xmlDoc, "Contents");
        this.serviceMetadata = this.parseOwsServiceMetadata(xmlDoc);
        this.serviceMetadata.version =
          xmlDoc.documentElement.getAttribute("version") || this.version;
        const items = this.getDirectChildren(contents, "Layer")
          .map((layer, index) =>
            this._createWmtsMenuItem(layer, index, impresorItem),
          )
          .filter(Boolean);
        this._createAndAddItemGroup(
          _gestorMenu,
          impresorGroup,
          this.serviceMetadata.keywords[0] || "",
          this.serviceMetadata.abstract || "",
          items,
        );
      })
      .catch((error) => {
        console.error("Error loading capabilities:", error);
        if (_gestorMenu.getLazyInitialization()) {
          _gestorMenu.removeLazyInitLayerInfoCounter(
            ItemGroupPrefix + this.section,
          );
          if (
            _gestorMenu.finishLazyInitLayerInfo(
              ItemGroupPrefix + this.section,
            )
          ) {
            _gestorMenu.printOnlySection(this.section);
          }
        }
      });
  }

  _createWmtsMenuItem(layer, index, impresorItem) {
    const iName = this.getElementText(
      this.getDirectChild(layer, "Identifier"),
    );
    if (!iName || !this.isAllowedLayer(iName)) {
      return null;
    }
    const customizedLayer =
      this.customized_layers?.[iName] ||
      this.customizedLayers?.[iName] ||
      null;
    const advertisedTitle = this.getElementText(
      this.getDirectChild(layer, "Title"),
    );
    const advertisedAbstract = this.getElementText(
      this.getDirectChild(layer, "Abstract"),
    );
    const iTitle = this.formatLayerTitle(iName, advertisedTitle);
    const iAbstract = this.formatLayerAbstract(iName, advertisedAbstract);
    const advertisedKeywords = this.getDescendants(
      this.getDirectChild(layer, "Keywords"),
      "Keyword",
    ).map((keyword) => this.getElementText(keyword));
    const keywords =
      customizedLayer?.new_keywords
        ?.split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean) || advertisedKeywords;
    const geographicBoundingBox = this._parseWmtsBoundingBox(
      this.getDirectChild(layer, "WGS84BoundingBox"),
    );
    const boundingBoxes = this.getDirectChildren(layer, "BoundingBox")
      .map((boundingBox) => this._parseWmtsBoundingBox(boundingBox))
      .filter(Boolean);
    if (geographicBoundingBox) {
      boundingBoxes.unshift(geographicBoundingBox);
    }
    const styles = this.getDirectChildren(layer, "Style").map((style) => {
      const legend = this.getDirectChild(style, "LegendURL");
      return {
        attributes: this.getElementAttributes(style),
        identifier: this.getElementText(
          this.getDirectChild(style, "Identifier"),
        ),
        title: this.getElementText(this.getDirectChild(style, "Title")),
        abstract: this.getElementText(
          this.getDirectChild(style, "Abstract"),
        ),
        isDefault: style.getAttribute("isDefault") === "true",
        legendURL:
          legend?.getAttributeNS(
            "http://www.w3.org/1999/xlink",
            "href",
          ) ||
          legend?.getAttribute("xlink:href") ||
          legend?.getAttribute("href") ||
          null,
        legendFormat: legend?.getAttribute("format") || null,
        minScaleDenominator:
          Number(legend?.getAttribute("minScaleDenominator")) || null,
        maxScaleDenominator:
          Number(legend?.getAttribute("maxScaleDenominator")) || null,
      };
    });
    const legendURL =
      this.icons?.[iName] ||
      customizedLayer?.legend ||
      styles.find((style) => style.isDefault && style.legendURL)?.legendURL ||
      styles.find((style) => style.legendURL)?.legendURL ||
      null;
    const metadata = {
      attributes: this.getElementAttributes(layer),
      abstract: iAbstract,
      advertisedTitle,
      advertisedAbstract,
      keywords,
      geographicBoundingBox,
      boundingBoxes,
      styles,
      formats: this.getDirectChildren(layer, "Format").map((format) =>
        this.getElementText(format),
      ),
      infoFormats: this.getDirectChildren(layer, "InfoFormat").map((format) =>
        this.getElementText(format),
      ),
      dimensions: this.getDirectChildren(layer, "Dimension").map(
        (dimension) => ({
          identifier: this.getElementText(
            this.getDirectChild(dimension, "Identifier"),
          ),
          default: this.getElementText(
            this.getDirectChild(dimension, "Default"),
          ),
          current: this.getElementText(
            this.getDirectChild(dimension, "Current"),
          ),
          values: this.getDirectChildren(dimension, "Value").map((value) =>
            this.getElementText(value),
          ),
        }),
      ),
      tileMatrixSetLinks: this.getDirectChildren(
        layer,
        "TileMatrixSetLink",
      ).map((link) => ({
        tileMatrixSet: this.getElementText(
          this.getDirectChild(link, "TileMatrixSet"),
        ),
        limits: this.getDescendants(link, "TileMatrixLimits").map(
          (limit) => ({
            tileMatrix: this.getElementText(
              this.getDirectChild(limit, "TileMatrix"),
            ),
            minTileRow: Number(
              this.getElementText(this.getDirectChild(limit, "MinTileRow")),
            ),
            maxTileRow: Number(
              this.getElementText(this.getDirectChild(limit, "MaxTileRow")),
            ),
            minTileCol: Number(
              this.getElementText(this.getDirectChild(limit, "MinTileCol")),
            ),
            maxTileCol: Number(
              this.getElementText(this.getDirectChild(limit, "MaxTileCol")),
            ),
          }),
        ),
      })),
      resourceUrls: this.getDirectChildren(layer, "ResourceURL").map(
        (resourceUrl) => ({
          format: resourceUrl.getAttribute("format"),
          resourceType: resourceUrl.getAttribute("resourceType"),
          template: resourceUrl.getAttribute("template"),
        }),
      ),
      service: this.serviceMetadata,
    };
    const capa = new Capa(
      iName,
      iTitle,
      geographicBoundingBox?.crs || "CRS:84",
      this.host,
      this.service,
      this.version,
      this.feature_info_format,
      keywords,
      geographicBoundingBox?.west ?? null,
      geographicBoundingBox?.east ?? null,
      geographicBoundingBox?.south ?? null,
      geographicBoundingBox?.north ?? null,
      null,
      legendURL,
      metadata,
    );
    const item = new Item(
      capa.nombre,
      this.section + index,
      keywords,
      iAbstract,
      capa.titulo,
      capa,
      this.getCallback(),
      null,
      legendURL,
      this.tab.listType || null,
    );
    item.setLegendImgPreformatted(gestorMenu.getLegendImgPath());
    item.setImpresor(impresorItem);
    gestorMenu.setAvailableLayer(iName);
    gestorMenu.setAvailableWmtsLayer(iName);
    return item;
  }

  _parseWmtsBoundingBox(boundingBox) {
    if (!boundingBox) {
      return null;
    }
    const lowerCorner = this.getElementText(
      this.getDirectChild(boundingBox, "LowerCorner"),
    )
      .split(/\s+/)
      .map(Number);
    const upperCorner = this.getElementText(
      this.getDirectChild(boundingBox, "UpperCorner"),
    )
      .split(/\s+/)
      .map(Number);
    if (
      lowerCorner.length < 2 ||
      upperCorner.length < 2 ||
      [...lowerCorner, ...upperCorner].some(
        (coordinate) => !Number.isFinite(coordinate),
      )
    ) {
      return null;
    }
    return {
      west: Math.min(lowerCorner[0], upperCorner[0]),
      south: Math.min(lowerCorner[1], upperCorner[1]),
      east: Math.max(lowerCorner[0], upperCorner[0]),
      north: Math.max(lowerCorner[1], upperCorner[1]),
      crs:
        boundingBox.getAttribute("crs") ||
        boundingBox.getAttribute("CRS") ||
        "CRS:84",
    };
  }

  getHost() {
    /* //Define GetCapabilities host endpoint
        var host = this.host + '/gwc/service/wmts'; */
    let host = this.host;
    if (host.includes("/geoserver") && !host.endsWith("/wmts")) {
      host += "/gwc/service/wmts";
    }
    return host;
  }

  getCallback() {
    //Define wich function handle onClick event
    var onClickHandler = "loadWmsTpl";
    return onClickHandler;
  }
}

/******************************************
Composite para menu
******************************************/
class ItemComposite {
  constructor(nombre, seccion, palabrasClave, descripcion) {
    this.nombre = nombre;
    this.seccion = clearSpecialChars(seccion);
    this.peso = null;
    this.palabrasClave =
      palabrasClave == null || palabrasClave == "" ? [] : palabrasClave;
    this.descripcion = descripcion;
    this.impresor = null;
    this.objDOM = null;
    this.querySearch = "";
    this._querySearchNorm = "";
    this._active = false;

    this.searchOrderIntoKeywords();
  }

  getQuerySearch() {
    return this.querySearch;
  }

  setQuerySearch(q) {
    this.querySearch = q == null ? "" : q;
    this._querySearchNorm = normalizeStr(this.querySearch);
  }

  getActive() {
    return this._active;
  }

  setActive(active) {
    this._active = active;
  }

  getPeso() {
    return this.peso;
  }

  setPeso(peso) {
    this.peso = peso;
  }

  searchOrderIntoKeywords() {
    //Recorrer palabrasClave para ver si viene el orden
    if (this.palabrasClave != undefined && this.palabrasClave != "") {
      for (var key in this.palabrasClave) {
        if (this.palabrasClave[key].indexOf("orden:") == 0) {
          this.peso = this.palabrasClave[key].replace("orden:", "").trim() * 1;
          this.palabrasClave.splice(key, 1);
        }
      }
    }
  }

  setPalabrasClave(palabrasClave) {
    this.palabrasClave = palabrasClave;
  }

  setDescripcion(descripcion) {
    this.descripcion = descripcion;
  }

  setImpresor(impresor) {
    this.impresor = impresor;
  }

  imprimir() {
    return this.impresor.imprimir(this);
  }

  getLegendURL() {
    return "";
  }

  setObjDom(dom) {
    this.objDOM = dom;
  }

  getObjDom() {
    return typeof this.objDOM === "string"
      ? document.querySelector(this.objDOM)
      : this.objDOM;
  }

  isBaseLayer() {
    return false;
  }

  match() {
    if (this.querySearch == "" || this.capa == undefined) {
      return true;
    }
    const normalizedQuery = this._querySearchNorm;
    if (normalizedQuery === "") {
      return true;
    }

    if (this.capa && this.capa.titulo) {
      if (normalizeStr(this.capa.titulo).indexOf(normalizedQuery) >= 0) {
        return true;
      }
    }

    if (this.nombre && normalizeStr(this.nombre).indexOf(normalizedQuery) >= 0)
      return true;

    if (
      this.descripcion &&
      normalizeStr(this.descripcion).indexOf(normalizedQuery) >= 0
    )
      return true;

    for (var key in this.palabrasClave) {
      if (normalizeStr(this.palabrasClave[key]).indexOf(normalizedQuery) >= 0) {
        return true;
      }
    }
    return false;
  }

  getAvailableTags() {
    return [];
  }
}

class ItemGroup extends ItemComposite {
  constructor(
    tab,
    nombre,
    seccion,
    peso,
    palabrasClave,
    descripcion,
    shortDesc,
  ) {
    super(nombre, seccion, palabrasClave, descripcion);
    this.shortDesc = shortDesc;
    this.peso = peso;
    this.itemsComposite = {};
    this.tab = tab;
  }

  setItem(itemComposite) {
    this.itemsComposite[itemComposite.seccion] = itemComposite;
  }

  getId() {
    return ItemGroupPrefix + this.seccion;
  }

  getTab() {
    return this.tab;
  }

  getItemByName(name) {
    for (var key in this.itemsComposite) {
      if (this.itemsComposite[key].nombre == name) {
        return this.itemsComposite[key];
      }
    }

    return null;
  }

  ordenaItems(a, b) {
    var aOrden1 = a.peso;
    var bOrden1 = b.peso;
    var aOrden2 = a.titulo ? a.titulo.toLowerCase() : 0;
    var bOrden2 = b.titulo ? b.titulo.toLowerCase() : 0;
    if (aOrden1 < bOrden1) {
      return -1;
    } else if (aOrden1 > bOrden1) {
      return 1;
    } else if (aOrden2 < bOrden2) {
      return -1;
    } else if (aOrden2 > bOrden2) {
      return 1;
    }

    return 0;
  }

  getItemsSearched() {
    var itemsAux = new Array();
    for (var key in this.itemsComposite) {
      this.itemsComposite[key].setQuerySearch(
        this.tab.getId() == "" ? this.querySearch : this.tab.getSearchQuery(),
      );
      if (this.itemsComposite[key].match() == true) {
        //Returns true on item match with querySearch string
        itemsAux.push(this.itemsComposite[key]);
      }
    }

    return itemsAux;
  }

  imprimir() {
    this.itemsStr = "";

    var itemsAux = this.getItemsSearched();
    itemsAux.sort(this.ordenaItems);

    for (var key in itemsAux) {
      this.itemsStr += itemsAux[key].imprimir();
    }
    return this.impresor.imprimir(this);
  }

  getCantidadCapasVisibles() {
    var iCapasVisibles = 0;
    for (var key in this.itemsComposite) {
      if (this.itemsComposite[key].getVisible() == true) {
        iCapasVisibles++;
      }
    }
    return iCapasVisibles;
  }

  muestraCantidadCapasVisibles() {
    var iCapasVisibles = this.getCantidadCapasVisibles();
    const title = document.getElementById(this.getId() + "-a");
    if (!title) return;
    if (iCapasVisibles > 0) {
      title.innerHTML = `${this.nombre} <span class="active-layers-counter">${iCapasVisibles}</span>`;
    } else {
      title.textContent = this.nombre;
    }
  }

  hideAllLayers() {
    for (var key2 in this.itemsComposite) {
      var item = this.itemsComposite[key2];
      if (item.getVisible() == true) {
        item.showHide();
      }
    }
  }

  hideAllLayersExceptOne(item) {}

  getAvailableTags() {
    var availableTags = [];
    for (var key in this.itemsComposite) {
      availableTags = availableTags.concat(
        this.itemsComposite[key].getAvailableTags(),
      );
    }
    return availableTags;
  }
}

class ItemGroupBaseMap extends ItemGroup {
  isBaseLayer() {
    return true;
  }

  hideAllLayers() {
    for (var key2 in this.itemsComposite) {
      var item = this.itemsComposite[key2];
      if (item.getVisible() == true) {
        item.showHide();
      }
    }
  }

  hideAllLayersExceptOne(item) {
    for (var key in this.itemsComposite) {
      if (
        this.itemsComposite[key].getVisible() == true &&
        item !== this.itemsComposite[key]
      ) {
        this.itemsComposite[key].showHide();
      }
    }
  }

  getAvailableTags() {
    return [];
  }
}

//Auxilary class for ItemGroupWMSSelector
class wmsSelector {
  constructor(
    id,
    name,
    title,
    source,
    service,
    version,
    featureInfoFormat,
    type,
  ) {
    if (type == "wmslayer_mapserver") {
      this.capa = new CapaMapserver(
        name,
        title,
        null,
        source,
        service,
        version,
        null,
        null,
        null,
        null,
        null,
        null,
      );
    } else {
      this.capa = new Capa(
        name,
        title,
        null,
        source,
        service,
        version,
        null,
        null,
        null,
        null,
        null,
        null,
      );
    }
    this.id = id;
    this.featureInfoFormat = featureInfoFormat;
    this.type = type;
  }

  getId() {
    return this.id;
  }

  getTitle() {
    return this.capa.titulo;
  }
}

class ItemGroupWMSSelector extends ItemGroup {
  constructor(tab, name, section, keyWords, description) {
    super(tab, name, section, 0, keyWords, description, "");
    this.wmsSelectorList = {};
  }

  addWMS(id, title, source, service, version, featureInfoFormat, type) {
    this.wmsSelectorList[id] = new wmsSelector(
      id,
      title,
      source,
      service,
      version,
      featureInfoFormat,
      type,
    );
  }
}

class Item extends ItemComposite {
  constructor(
    nombre,
    seccion,
    palabrasClave,
    descripcion,
    titulo,
    capa,
    callback,
    legendImg,
    legend,
    listType,
  ) {
    super(nombre, seccion, palabrasClave, descripcion);
    this.titulo = titulo;
    this.capa = capa;
    this.capas = [capa];
    this.visible = false;
    this.legendImg = legendImg;
    this.legend = legend;
    this.callback = callback;
    this.listType = null;
  }

  getId() {
    var childId = "child-" + this.seccion;
    return childId;
  }

  getSVGFilenameForLegendImg() {
    if (this.titulo !== undefined) {
      return this.titulo.replace(":", "").replace("/", "") + ".svg";
    }
  }

  getVisible() {
    return this.visible;
  }

  setLegendImgPreformatted(dir) {
    this.legendImg = dir + this.getSVGFilenameForLegendImg();
  }

  setLegendImg(img) {
    this.legendImg = img;
  }

  setLegend(img) {
    this.legend = img;
  }

  getLegendImg() {
    return this.legendImg;
  }

  loadLayer(capa, key) {
    var tmp = Object.assign({}, capa); //Clonar el item para simular que solo tiene una unica capa
    tmp.nombre = capa.nombre;
    tmp.capa = capa.capas[key];
    switch (tmp.capa.servicio) {
      case "wms":
        loadWms(tmp.callback, tmp);
        break;
      case "wmts":
        loadWmts(tmp.callback, tmp);
        break;
      case "tms":
        loadMapaBase(tmp.capa.host, tmp.capa.nombre, tmp.capa.attribution);
        break;
      case "bing":
        loadMapaBaseBing(tmp.capa.key, tmp.capa.nombre, tmp.capa.attribution);
        break;
      case "geojson":
        loadGeojson(tmp.capa.host, tmp.nombre);
        break;
      default:
        break;
    }
  }

  showHide() {
    const optionsLayer = document.getElementById(this.getId());
    optionsLayer.classList.toggle("active");

    if (optionsLayer.children[1]) {
      optionsLayer.children[1].style.display = optionsLayer.classList.contains("active")
        ? "flex"
        : "none";
    }

    if (
      this.seccion.includes("mapasbase0") &&
      !optionsLayer.classList.contains("active")
    ) {
      optionsLayer.classList.toggle("active");
    } //fixes main mapabase active bug by asking if its not activated.

    if (typeof this.callback == "string") {
      this.callback = eval(this.callback);
    }

    this.visible = !this.visible;
    this.capas[0].visible = this.visible;
    this.loadLayer(this, 0);

    //Recorrer todas las capas del item
    if (this.capas.length > 1) {
      const secondaryLayers = this.capas.slice(1, this.capas.length);
      for (var key in secondaryLayers) {
        if (this.capas[+key + 1].hasOwnProperty("visible")) {
          if (this.capas[+key + 1].visible !== this.visible) {
            this.capas[+key + 1].visible = this.visible;
          }
          this.loadLayer(this, +key + 1);
        } else {
          this.capas[+key + 1].visible = this.visible;
          if (this.visible) this.loadLayer(this, +key + 1);
        }
      }
    }
  }

  getLegendURL() {
    return this.capa.getLegendURL();
  }

  getAvailableTags() {
    var tagsAux = [this.capa.titulo];
    return tagsAux.concat(this.palabrasClave);
  }
}

/******************************************
Clase plugin
******************************************/
class Plugin {
  constructor(name, url, callback) {
    this.name = name;
    this.url = url;
    this.status = "loading";
    this.callback = callback;
  }

  getStatus() {
    return this.status;
  }

  setStatus(status) {
    switch (status) {
      case "loading":
        this.status = status;
        break;
      case "ready":
        this.status = status;
        break;
      case "fail":
        this.status = status;
        break;
      case "visible":
        this.status = status;
        break;
      default:
        return false;
    }
  }
  triggerLoad(failed = false) {
    document.body.dispatchEvent(
      new CustomEvent("pluginLoad", {
        detail: { pluginName: this.name, failed },
      }),
    );
  }
}

/******************************************
ItemsGetter
******************************************/
class ItemsGetter {
  get(gestorMenu) {
    return gestorMenu.items;
  }
}

class ItemsGetterSearcher extends ItemsGetter {
  get(gestorMenu) {
    const impresorGroup = new ImpresorGrupoHTML();
    const impresorItem = new ImpresorItemHTML();

    //Instance an empty ItemGroup for no-tabs classes
    var groupAux = new ItemGroup(
      new Tab(""),
      "Resultado búsqueda",
      "searcher-",
      0,
      "",
      "",
      gestorMenu.getQuerySearch(),
    );
    groupAux.setImpresor(impresorGroup);
    groupAux.setObjDom(gestorMenu.getItemsGroupDOM());
    groupAux.setActive(true);

    //Iterate all items in gestorMenu
    var itemsToReturn = {};
    for (var key in gestorMenu.items) {
      var itemComposite = gestorMenu.items[key];
      if (gestorMenu.getQuerySearch() != "") {
        itemComposite.setQuerySearch(gestorMenu.getQuerySearch()); //Set query search for filtering items
        var itemsAux = itemComposite.getItemsSearched();
        for (var key2 in itemsAux) {
          groupAux.setItem(itemsAux[key2]);
        }
        itemsToReturn[groupAux.seccion] = groupAux;
      } else {
        itemsToReturn[itemComposite.seccion] = itemComposite;
      }
    }

    return itemsToReturn;
  }
}

class ItemsGetterSearcherWithTabs extends ItemsGetter {
  get(gestorMenu) {
    const impresorGroup = new ImpresorGrupoHTML();
    const impresorItem = new ImpresorItemHTML();

    //Instance an empty ItemGroup per tab (without items)
    var itemsGroups = {};
    for (var key in gestorMenu._tabs) {
      var groupAux = new ItemGroup(
        gestorMenu._tabs[key],
        "Resultado búsqueda",
        "searcher-" + gestorMenu._tabs[key].getId(),
        0,
        "",
        "",
        gestorMenu._tabs[key].getSearchQuery(),
      );
      groupAux.setImpresor(impresorGroup);
      groupAux.setObjDom(gestorMenu.getItemsGroupDOM());
      groupAux.setActive(true);
      itemsGroups[groupAux.seccion] = groupAux;
    }

    //Instance an empty ItemGroup for no-tabs classes
    var groupAux = new ItemGroup(
      new Tab(""),
      "Resultado búsqueda",
      "searcher-",
      0,
      "",
      "",
      gestorMenu.getQuerySearch(),
    );
    groupAux.setImpresor(impresorGroup);
    groupAux.setObjDom(gestorMenu.getItemsGroupDOM());
    groupAux.setActive(true);
    itemsGroups[groupAux.seccion] = groupAux;

    //Iterate all items in gestorMenu
    var itemsToReturn = {};
    for (var key in gestorMenu.items) {
      var itemComposite = gestorMenu.items[key];
      var tabAux = gestorMenu._tabs[itemComposite.getTab().getId()];
      if (tabAux != undefined && tabAux.getSearchQuery() != "") {
        itemComposite.setQuerySearch(tabAux.getSearchQuery()); //Set query search for filtering items
        var itemsAux = itemComposite.getItemsSearched();
        for (var key2 in itemsAux) {
          itemsGroups["searcher-" + tabAux.getId()].setItem(itemsAux[key2]);
        }
        itemsToReturn[itemsGroups["searcher-" + tabAux.getId()].seccion] =
          itemsGroups["searcher-" + tabAux.getId()];
      } else {
        itemsToReturn[itemComposite.seccion] = itemComposite;
      }
    }

    return itemsToReturn;
  }
}

/******************************************
Gestor de menu
******************************************/
class GestorMenu {
  constructor() {
    this.items = {};
    this.plugins = {};
    this.pluginsCount = 0;
    this.pluginsLoading = 0;
    this.menuDOM = "";
    this.loadingDOM = "";
    this.layersInfo = new Array();
    this.legendImgPath = "";
    this.itemsGroupDOM = "";
    this.printCallback = null;
    this.querySearch = "";
    this.showSearcher = false;
    this.basemapSelected = null;
    this.baseMapDependencies = {};

    this.allLayersAreLoaded = false;
    this._allLayersReadyPromise = new Promise((resolve) => {
      this._resolveAllLayersReady = resolve;
    });
    this.availableWmtsLayers = [];
    this.availableLayers = [];
    this.availableBaseLayers = [];
    this.activeLayers = [];
    this.layersDataForWfs = {};
    this.allLayersAreDeclaredInJson = false;

    this._existsIndexes = new Array(); //Identificador para evitar repetir ID de los items cuando provinen de distintas fuentes
    this._getLayersInfoCounter = 0;
    this._getLazyInitLayersInfoCounter = {};
    this._tabs = {};
    this._selectedTab = null;
    this._lazyInitialization = false;
    this._itemsGetter = new ItemsGetter();
    this._layersJoin = null;
    this._folders = {};
  }

  setBaseMapDependencies(baseLayers) {
    const baseMapDependencies = {};
    baseLayers.forEach((bLayer) => {
      baseMapDependencies[bLayer.nombre] = bLayer.hasOwnProperty("isOpenWith")
        ? bLayer.isOpenWith
        : null;
    });
    this.baseMapDependencies = baseMapDependencies;
  }

  setAvailableLayer(layer_id) {
    this.availableLayers.push(layer_id);
  }

  setAvailableWmtsLayer(layer_id) {
    this.availableWmtsLayers.push(layer_id);
  }

  setAvailableBaseLayer(layer_id) {
    this.availableBaseLayers.push(layer_id);
  }

  setAllLayersAreDeclaredInJson(value) {
    this.allLayersAreDeclaredInJson = value;
  }

  markAllLayersAsLoaded() {
    if (this.allLayersAreLoaded) {
      return;
    }

    this.allLayersAreLoaded = true;
    this._resolveAllLayersReady();
    this._resolveAllLayersReady = null;
  }

  whenAllLayersAreLoaded() {
    return this.allLayersAreLoaded
      ? Promise.resolve()
      : this._allLayersReadyPromise;
  }

  getAvailableLayers() {
    return this.availableLayers;
  }

  setLayersDataForWfs() {
    for (const itemKey in this.items) {
      if (itemKey !== "mapasbase") {
        const item = this.items[itemKey];
        Object.values(item.itemsComposite).forEach((compositeItem) => {
          compositeItem.capas.forEach((capa) => {
            this.layersDataForWfs[capa.nombre] = {
              name: capa.nombre,
              section: item.seccion,
              host: capa.host,
            };
          });
        });
      }
    }
  }

  getActiveLayersWithoutBasemap() {
    const activeLayers = this.activeLayers.filter((layer) => {
      return !this.availableBaseLayers.includes(layer);
    });

    const metadataMap = new Map();

    for (const section in this.items) {
      const sectionData = this.items[section];
      if (sectionData.hasOwnProperty("itemsComposite")) {
        for (const key in sectionData.itemsComposite) {
          const item = sectionData.itemsComposite[key];
          if (item.nombre && item.capa) {
            metadataMap.set(item.nombre, {
              capa: item.capa,
              section: sectionData.seccion,
            });
          }
        }
      }
    }

    return activeLayers.map((layer) => {
      const metadata = metadataMap.get(layer);
      const capa = metadata?.capa;
      const baseData = this.layersDataForWfs[layer] || {
        name: layer,
        section: metadata?.section || "",
        host: capa?.host,
      };

      if (!capa) {
        return baseData;
      }

      return {
        ...baseData,
        titulo: capa.titulo,
        host: capa.host,
        servicio: capa.servicio,
        version: capa.version,
        featureInfoFormat: capa.featureInfoFormat,
        srs: capa.srs,
        minx: capa.minx,
        maxx: capa.maxx,
        miny: capa.miny,
        maxy: capa.maxy,
        attribution: capa.attribution,
        legendURL: capa.legendURL,
      };
    });
  }

  /*   getActiveLayersWithoutBasemap() {
      // Filter active layers to exclude base layers
      const activeLayers = this.activeLayers.filter((layer) => {
        return !this.availableBaseLayers.includes(layer);
      });
      return Object.keys(this.layersDataForWfs).length === 0
        ? []
        : activeLayers.map((activeLayer) => {
          if (
            this.layersDataForWfs.hasOwnProperty(activeLayer) &&
            this.layersDataForWfs[activeLayer]
          ) {
            return this.layersDataForWfs[activeLayer];
          }
        });
    } */

  addActiveLayer(layer_id) {
    const idx = this.activeLayers.findIndex((layer) => layer === layer_id);
    if (idx === -1) this.activeLayers.push(layer_id);
  }

  removeActiveLayer(layer_id) {
    const idx = this.activeLayers.findIndex((layer) => layer === layer_id);
    if (idx > -1) this.activeLayers.splice(idx, 1);
  }

  layerIsActive(layer_id) {
    return this.activeLayers.findIndex((layer) => layer === layer_id) > -1;
  }

  layerIsWmts(layer_id) {
    return (
      this.availableWmtsLayers.findIndex((layer) => layer === layer_id) > -1
    );
  }

  layerIsValid(layer_id) {
    const idx1 =
      this.availableLayers.findIndex((layer) => layer === layer_id) > -1;
    const idx2 =
      this.availableBaseLayers.findIndex((layer) => layer === layer_id) > -1;
    return idx1 || idx2;
  }

  getActiveLayers() {
    return this.activeLayers;
  }

  getLayerIdByName(layerName) {
    for (const section in this.items) {
      if (this.items[section].hasOwnProperty("itemsComposite")) {
        if (this.items[section].getItemByName(layerName))
          return this.items[section].getItemByName(layerName).getId();
      }
    }
  }

  getLayerNameById(layerId) {
    for (var key in this.items) {
      var itemComposite = this.items[key];
      for (var key2 in itemComposite.itemsComposite) {
        var item = itemComposite.itemsComposite[key2];
        if (item.getId() === layerId) {
          return item.nombre;
        }
      }
    }
  }

  baseMapIsInUrl(layers) {
    for (const layer of layers) {
      if (this.availableBaseLayers.findIndex((lyr) => lyr === layer) > -1) {
        return true;
      }
    }
    return false;
  }

  _normalizeLayerHint(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  _normalizeServiceHost(value) {
    try {
      const serviceUrl = new URL(value, document.baseURI);
      const pathname = serviceUrl.pathname.replace(/\/+$/g, "");
      return `${serviceUrl.origin.toLowerCase()}${pathname.toLowerCase()}`;
    } catch (_error) {
      return String(value || "")
        .toLowerCase()
        .replace(/[?#].*$/g, "")
        .replace(/\/+$/g, "");
    }
  }

  _normalizeServiceRoot(value) {
    return this._normalizeServiceHost(value)
      .replace(/\/gwc\/service\/wmts$/i, "")
      .replace(/\/(?:ows|wms|wmts)$/i, "");
  }

  _getLayerInfoConfiguredLayers(layerInfo) {
    return [
      ...(layerInfo.allowed_layers || []),
      ...Object.keys(layerInfo.customizedLayers || {}),
      ...Object.keys(layerInfo.customized_layers || {}),
    ];
  }

  _getLayerInfosForJoinMember(member) {
    if (!member) {
      return [];
    }

    const memberHost = this._normalizeServiceHost(member.host);
    const memberSection = member.seccion || member.section;
    let candidates = this.layersInfo.filter(
      (layerInfo) =>
        memberHost !== "" &&
        this._normalizeServiceHost(layerInfo.host) === memberHost,
    );

    if (candidates.length === 0) {
      const memberRoot = this._normalizeServiceRoot(member.host);
      candidates = this.layersInfo.filter(
        (layerInfo) =>
          memberRoot !== "" &&
          this._normalizeServiceRoot(layerInfo.host) === memberRoot,
      );
    }

    if (candidates.length === 0) {
      candidates = this.layersInfo.filter(
        (layerInfo) =>
          layerInfo.section === memberSection &&
          this._getLayerInfoConfiguredLayers(layerInfo).includes(member.layer),
      );
    }

    const sectionCandidates = candidates.filter(
      (layerInfo) => layerInfo.section === memberSection,
    );
    if (sectionCandidates.length > 0) {
      candidates = sectionCandidates;
    }

    const configuredCandidates = candidates.filter((layerInfo) =>
      this._getLayerInfoConfiguredLayers(layerInfo).includes(member.layer),
    );
    if (configuredCandidates.length > 0) {
      return configuredCandidates;
    }

    const unrestrictedCandidate = candidates.find(
      (layerInfo) =>
        layerInfo.allowed_layers == null &&
        Object.keys(layerInfo.customizedLayers || {}).length === 0 &&
        Object.keys(layerInfo.customized_layers || {}).length === 0,
    );
    return unrestrictedCandidate
      ? [unrestrictedCandidate]
      : candidates.slice(0, 1);
  }

  _getLayerJoinMembers(layerJoin) {
    return [layerJoin, ...(layerJoin.joins || [])];
  }

  _layerMatchesJoinMember(item, member) {
    return (
      item.capa.nombre === member.layer &&
      (this._normalizeServiceHost(item.capa.host) ===
        this._normalizeServiceHost(member.host) ||
        this._normalizeServiceRoot(item.capa.host) ===
          this._normalizeServiceRoot(member.host))
    );
  }

  _getLayerInfosForJoin(layerJoin) {
    return [
      ...new Set(
        this._getLayerJoinMembers(layerJoin).flatMap((member) =>
          this._getLayerInfosForJoinMember(member),
        ),
      ),
    ];
  }

  _getLayerJoinsForSection(section) {
    return (this._layersJoin || []).filter(
      (layerJoin) =>
        (layerJoin.seccion || layerJoin.section) === section ||
        (layerJoin.joins || []).some(
          (member) => (member.seccion || member.section) === section,
        ),
    );
  }

  _getLayerInfosForSection(section) {
    const directLayerInfos = this.layersInfo.filter(
      (layerInfo) => layerInfo.section === section,
    );
    const joinedLayerInfos = this._getLayerJoinsForSection(section).flatMap(
      (layerJoin) => this._getLayerInfosForJoin(layerJoin),
    );
    return [...new Set([...directLayerInfos, ...joinedLayerInfos])];
  }

  _getLayerJoinsForRequestedLayers(requestedLayers) {
    const requested = new Set(requestedLayers);
    return (this._layersJoin || []).filter((layerJoin) =>
      requested.has(layerJoin.layer),
    );
  }

  _getInitialLayerInfoScore(layerInfo, requestedLayers) {
    const requested = requestedLayers.map((layer) =>
      this._normalizeLayerHint(layer),
    );
    const configuredLayers = [
      ...Object.keys(layerInfo.customizedLayers || {}),
      ...(layerInfo.allowed_layers || []),
    ].map((layer) => this._normalizeLayerHint(layer));

    if (requested.some((layer) => configuredLayers.includes(layer))) {
      return 100;
    }

    const pathParts = new URL(layerInfo.host, document.baseURI).pathname
      .split("/")
      .map((part) => this._normalizeLayerHint(part))
      .filter((part) => part.length > 2 && part !== "geoserver");
    const serviceHints = [
      this._normalizeLayerHint(layerInfo.section),
      ...pathParts,
    ];

    if (
      requested.some((layer) =>
        serviceHints.some(
          (hint) =>
            layer === hint || layer.includes(hint) || hint.includes(layer),
        ),
      )
    ) {
      return 75;
    }

    const serviceTokens = serviceHints.flatMap((hint) => hint.split("_"));
    if (
      requested.some((layer) =>
        layer
          .split("_")
          .filter((token) => token.length > 2)
          .some((token) => serviceTokens.includes(token)),
      )
    ) {
      return 50;
    }

    return 0;
  }

  async _loadInitialLayerInfo(layerInfo) {
    if (!layerInfo._executed) {
      this.addLazyInitLayerInfoCounter(
        `${ItemGroupPrefix}${layerInfo.section}`,
      );
    }
    try {
      await layerInfo.get(this);
    } finally {
      layerInfo._loadSettled = true;
    }
  }

  async _loadLayerInfos(layerInfos) {
    await Promise.all(
      [...new Set(layerInfos)].map((layerInfo) =>
        this._loadInitialLayerInfo(layerInfo),
      ),
    );
  }

  async loadSectionServices(section) {
    const layerInfos = this._getLayerInfosForSection(section);
    if (layerInfos.length === 0 || !this.items[section]) return;
    await this._loadLayerInfos(layerInfos);
    if (this.items[section]) this.printOnlySection(section);
  }

  async loadInitialLayerServices(requestedLayers) {
    const requestedLayerJoins =
      this._getLayerJoinsForRequestedLayers(requestedLayers);
    if (requestedLayerJoins.length > 0) {
      await this._loadLayerInfos(
        requestedLayerJoins.flatMap((layerJoin) =>
          this._getLayerInfosForJoin(layerJoin),
        ),
      );
    }

    const pendingLayers = new Set(
      requestedLayers.filter(
        (layer) =>
          !this.layerIsValid(layer) &&
          !this.availableBaseLayers.includes(layer),
      ),
    );
    if (pendingLayers.size === 0) {
      return [];
    }

    const candidates = [...this.layersInfo];
    const configurationOrder = new Map(
      candidates.map((layerInfo, index) => [layerInfo, index]),
    );

    while (pendingLayers.size > 0 && candidates.length > 0) {
      candidates.sort(
        (first, second) =>
          this._getInitialLayerInfoScore(second, [...pendingLayers]) -
            this._getInitialLayerInfoScore(first, [...pendingLayers]) ||
          configurationOrder.get(first) - configurationOrder.get(second),
      );
      const layerInfo = candidates.shift();

      try {
        await this._loadInitialLayerInfo(layerInfo);
      } catch (error) {
        console.error("Error loading initial layer service:", error);
      }

      for (const layer of pendingLayers) {
        if (this.layerIsValid(layer)) {
          pendingLayers.delete(layer);
        }
      }
    }

    return [...pendingLayers];
  }

  _finishInitialLayers(urlInteraction, requestedLayers, unresolvedLayers = []) {
    this.processLayersJoin();
    requestedLayers.forEach((layer) => {
      if (this.layerIsValid(layer) && !this.layerIsActive(layer)) {
        this.muestraCapa(this.getLayerIdByName(layer));
      }
    });

    urlInteraction.layers = this.getActiveLayers();
    this.activeLayersHasBeenUpdated = () => {
      urlInteraction.layers = this.getActiveLayers();
    };
    this.setLayersDataForWfs();
    this.markAllLayersAsLoaded();

    if (unresolvedLayers.length > 0) {
      console.warn("Rejected layers: ", unresolvedLayers);
    }
  }

  async loadInitialLayers(urlInteraction) {
    document.getElementById(this.basemapSelected)?.classList.toggle("active");

    if (this.getLazyInitialization()) {
      const requestedLayers = [...urlInteraction.layers];
      const unresolvedLayers =
        await this.loadInitialLayerServices(requestedLayers);
      this._finishInitialLayers(
        urlInteraction,
        requestedLayers,
        unresolvedLayers,
      );
      return;
    }

    if (this.allLayersAreDeclaredInJson) {
      this._finishInitialLayers(urlInteraction, [...urlInteraction.layers]);
      return;
    }

    await this.whenAllLayersAreLoaded();

    const requestedLayers = [...urlInteraction.layers];
    const unresolvedLayers = requestedLayers.filter(
      (layer) => !this.layerIsValid(layer),
    );
    this._finishInitialLayers(
      urlInteraction,
      requestedLayers,
      unresolvedLayers,
    );
    this.printMenu();
  }

  cleanAllLayers() {
    //Desactiva TODOS los layers activos.
    let layers = this.activeLayers.filter((layer) => {
      return !this.availableBaseLayers.includes(layer);
    });
    this.toggleLayers(layers);
    hideAddedLayers();
    hideAddedLayersCounter();
  }

  toggleLayers(layers) {
    layers.forEach((layer) => {
      if (this.layerIsValid(layer))
        this.muestraCapa(this.getLayerIdByName(layer));
    });
  }

  setMenuDOM(menuDOM) {
    this.menuDOM = menuDOM;
  }

  getMenuDOM() {
    return typeof this.menuDOM === "string"
      ? document.querySelector(this.menuDOM)
      : this.menuDOM;
  }

  setLoadingDOM(loadingDOM) {
    this.loadingDOM = loadingDOM;
  }

  getLoadingDOM() {
    return typeof this.loadingDOM === "string"
      ? document.querySelector(this.loadingDOM)
      : this.loadingDOM;
  }

  setLegendImgPath(legendImgPath) {
    this.legendImgPath = legendImgPath;
  }

  getLegendImgPath() {
    return this.legendImgPath;
  }

  getItemsGroupDOM() {
    return this.menuDOM;
  }

  setPrintCallback(printCallback) {
    this.printCallback = printCallback;
  }

  getLazyInitialization() {
    return this._lazyInitialization;
  }

  setLazyInitialization(lazyInit) {
    this._lazyInitialization = lazyInit;
  }

  addLayerInfoCounter() {
    this._getLayersInfoCounter++;
  }

  setShowSearcher(show_searcher) {
    this.showSearcher = show_searcher;
  }

  getShowSearcher() {
    return this.showSearcher;
  }

  getQuerySearch() {
    return this.querySearch;
  }

  setQuerySearch(q) {
    this.querySearch = q;
    this.setSelectedTabSearchQuery(q);

    //Select wich ItemsGetter strategy need
    if (q == "") {
      this._itemsGetter = new ItemsGetter();
    } else if (this._hasMoreTabsThanOne() == true) {
      this._itemsGetter = new ItemsGetterSearcherWithTabs();
    } else {
      this._itemsGetter = new ItemsGetterSearcher();
    }
  }

  setLayersJoin(layersJoin) {
    this._layersJoin = layersJoin;
  }

  addLazyInitLayerInfoCounter(sectionId) {
    if (this._getLazyInitLayersInfoCounter[sectionId] == undefined) {
      this._getLazyInitLayersInfoCounter[sectionId] = 1;
    } else {
      this._getLazyInitLayersInfoCounter[sectionId]++;
    }
  }

  setFolders(folders) {
    this._folders = folders;
  }

  /* 
    getBasemapSelected() {
        return this.basemapSelected;
    } 
    */
  getActiveBasemap() {
    let activeBasemap;
    Object.keys(baseLayers).forEach((bl) => {
      if (gestorMenu.getActiveLayers().includes(bl)) {
        activeBasemap = bl;
      }
    });
    return activeBasemap;
  }

  setBasemapSelected(basemapSelected) {
    this.basemapSelected = basemapSelected;
  }

  setLastBaseMapSelected(lastBaseMapSelected) {
    this.lastBaseMapSelected = lastBaseMapSelected;
  }

  removeLazyInitLayerInfoCounter(sectionId) {
    this._getLazyInitLayersInfoCounter[sectionId]--;
  }

  finishLayerInfo() {
    return this._getLayersInfoCounter == this.layersInfo.length;
  }

  finishLazyInitLayerInfo(sectionId) {
    return this._getLazyInitLayersInfoCounter[sectionId] == 0;
  }

  addLayersInfo(layersInfo) {
    this.layersInfo.push(layersInfo);
  }

  addTab(tab) {
    if (tab.getExtendedId() != EmptyTab) this._tabs[tab.getId()] = tab;
  }

  setSelectedTab(tabId) {
    this._selectedTab = this._tabs[tabId];
  }

  setSelectedTabSearchQuery(q) {
    if (this._selectedTab != null) {
      this._selectedTab.setSearchQuery(q);
      this._selectedTab.itemsGetter = this._itemsGetter;
    }
  }

  getItemGroupById(id) {
    for (var key in this.items) {
      if (this.items[key].getId() == id) {
        return this.items[key];
      }
    }

    return null;
  }

  addItemGroup(itemGroup) {
    var itemAux;
    const configuredSectionStyle =
      itemGroup.sectionStyle ||
      app.items?.find(
        (item) => item.seccion === itemGroup.seccion && item.section_style,
      )?.section_style ||
      app.sectionStyles?.[itemGroup.seccion] ||
      null;

    if (configuredSectionStyle) {
      itemGroup.sectionStyle = configuredSectionStyle;
    }
    if (app.sectionExpanded?.[itemGroup.seccion] === true) {
      itemGroup.setActive(true);
    }

    if (!this.items[itemGroup.seccion] || itemGroup.isBaseLayer()) {
      //itemGroup.isBaseLayer() avoid to repeat base layer into selector
      itemAux = itemGroup;
      this._existsIndexes[itemGroup.seccion] = 0;
    } else {
      itemAux = this.items[itemGroup.seccion];
      if (configuredSectionStyle) {
        itemAux.sectionStyle = configuredSectionStyle;
      }
      this._existsIndexes[itemGroup.seccion] =
        Object.keys(itemAux.itemsComposite).length + 1; //Si ya existe el itemGroup pero se agregan datos de otras fuentes, esto evita que se repitan los ID
    }
    for (var key in itemGroup.itemsComposite) {
      if (this._existsIndexes[itemGroup.seccion] > 0) {
        //Para modificar item.seccion para no duplicar el contenido
        itemGroup.itemsComposite[key].seccion +=
          this._existsIndexes[itemGroup.seccion];
      }
      itemAux.setItem(itemGroup.itemsComposite[key]);
    }
    this.items[itemGroup.seccion] = itemAux;
  }

  addPlugin(pluginName, url, callback, styles = []) {
    if (!this.pluginExists(pluginName)) {
      const pluginAux = new Plugin(
        pluginName,
        url,
        typeof callback === "function" ? callback : null,
      );
      this.plugins[pluginAux.name] = pluginAux;
      this.pluginsCount++;
      this.pluginsLoading++;

      const resources = [
        appDependencies.loadScript(url),
        ...styles.map((style) =>
          (typeof style === "string"
            ? appDependencies.loadStyle(style)
            : appDependencies.loadStyle(style.url, style)
          ).catch((error) => {
            console.error(error);
          }),
        ),
      ];

      Promise.all(resources).then(
        () => {
          pluginAux.setStatus("ready");
          this.pluginsLoading--;
          pluginAux.triggerLoad();
          if (pluginAux.callback) {
            pluginAux.callback();
          }
        },
        (error) => {
          pluginAux.setStatus("fail");
          this.pluginsCount--;
          this.pluginsLoading--;
          pluginAux.triggerLoad(true);
          console.error(error);
        },
      );
    } else {
      return false;
    }
  }

  deletePlugin(pluginName) {
    if (this.pluginExists(pluginName)) {
      delete this.plugins[pluginName];
      return true;
    }
    return false;
  }

  pluginExists(pluginName) {
    return this.plugins[pluginName] ? true : false;
  }

  ordenaPorPeso(a, b) {
    var aName = a.peso;
    var bName = b.peso;
    return aName < bName ? -1 : aName > bName ? 1 : 0;
  }

  // imprime el menu de capas
  executeLayersInfo() {
    if (this.getLazyInitialization() == true) {
      for (var key in this.layersInfo) {
        this.layersInfo[key].generateGroups(this);
      }
      this.printMenu();

      var thisObj = this;
      const sectionLoadPromises = new WeakMap();

      const setSectionHeaderLoading = (collapse, isLoading) => {
        const section = collapse.closest(".panel-default");
        const header = section?.querySelector(":scope > .panel-heading");
        if (!header) return;

        header.classList.toggle("section-header-loading-active", isLoading);
        header.setAttribute("aria-busy", String(isLoading));
        collapse.setAttribute("aria-busy", String(isLoading));

        let spinner = header.querySelector(":scope > .section-header-loading");
        if (isLoading && !spinner) {
          spinner = document.createElement("img");
          spinner.className = "section-header-loading";
          spinner.src = "src/styles/images/loading.svg";
          spinner.alt = "";
          spinner.setAttribute("aria-hidden", "true");
          header.appendChild(spinner);
        } else if (!isLoading) {
          spinner?.remove();
        }
      };

      const loadSectionOnExpand = (collapse) => {
        if (!collapse.classList.contains("collapse")) return;
        const showingId = collapse.id;
        const layerInfos = thisObj._getLayerInfosForSection(showingId);
        if (layerInfos.length === 0) return;

        const currentLoad = sectionLoadPromises.get(collapse);
        if (currentLoad) {
          setSectionHeaderLoading(collapse, true);
          return currentLoad;
        }

        const needsLoading = layerInfos.some(
          (layerInfo) =>
            !layerInfo._executed ||
            (layerInfo._loadPromise && layerInfo._loadSettled !== true),
        );
        if (!needsLoading) return;

        setSectionHeaderLoading(collapse, true);
        const loadPromise = thisObj
          .loadSectionServices(showingId)
          .catch((error) => {
            console.error(
              `Error loading services for section '${showingId}':`,
              error,
            );
          })
          .finally(() => {
            sectionLoadPromises.delete(collapse);
            setSectionHeaderLoading(collapse, false);
          });
        sectionLoadPromises.set(collapse, loadPromise);
        return loadPromise;
      };

      document.addEventListener("show.bs.collapse", function (event) {
        loadSectionOnExpand(event.target);
      });

      document.addEventListener("hidden.bs.collapse", function (event) {
        if (event.target.classList.contains("panel-collapse")) {
          setSectionHeaderLoading(event.target, false);
        }
      });

      document
        .querySelectorAll(".panel-collapse.collapse.in")
        .forEach(loadSectionOnExpand);
    } else {
      for (var key in this.layersInfo) {
        this.layersInfo[key].get(this);
      }
    }
  }

  _countTabs() {
    //return this._tabs.length;
    return Object.keys(this._tabs).length;
  }

  _hasMoreTabsThanOne() {
    return this._countTabs() > 1;
  }

  _formatTabName(tab) {
    return tab.replace(EmptyTab, "");
  }

  processLayersJoin() {
    if (this._layersJoin != null) {
      //Buscar el item al cual incluirle capas
      for (var keyJoin in this._layersJoin) {
        var item = this.items[this._layersJoin[keyJoin].seccion];
        if (item) {
          for (var keyItem in item.itemsComposite) {
            if (
              this._layerMatchesJoinMember(
                item.itemsComposite[keyItem],
                this._layersJoin[keyJoin],
              )
            ) {
              //Busca las capas a incluir
              for (var keyJoinInt in this._layersJoin[keyJoin].joins) {
                var itemInt =
                  this.items[
                    this._layersJoin[keyJoin].joins[keyJoinInt].seccion
                  ];
                if (itemInt) {
                  for (var keyItemInt in itemInt.itemsComposite) {
                    if (
                      this._layerMatchesJoinMember(
                        itemInt.itemsComposite[keyItemInt],
                        this._layersJoin[keyJoin].joins[keyJoinInt],
                      )
                    ) {
                      item.itemsComposite[keyItem].capas = item.itemsComposite[
                        keyItem
                      ].capas.concat(itemInt.itemsComposite[keyItemInt].capas);
                      delete itemInt.itemsComposite[keyItemInt];
                      if (item.itemsComposite[keyItem].visible) {
                        if (!isNaN(keyItemInt)) {
                          item.itemsComposite[keyItem].capas[
                            keyItemInt
                          ].visible = true;
                          item.itemsComposite[keyItem].loadLayer(
                            item.itemsComposite[keyItem],
                            keyItemInt,
                          );
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  //llama a imprimir el menu de capas
  print() {
    this.executeLayersInfo();
  }

  _printSearcher() {
    if (this.getShowSearcher()) {
      const formContent = `
        <form id='searchForm' class='searchFormBtn sticky' novalidate>
          <div class='center-flex'>
            <div class='has-feedback has-clear formBtns center-flex'>
              <input type='text' class='form-control ag-input-text' id='q' name='q' value='${this.getQuerySearch()}' placeholder='Buscar capa' autocomplete='off'>
              <button type='button' class='ag-btn ag-btn-secondary btn-reset-layers form-control-clear glyphicon glyphicon-remove-circle form-control-feedback hidden'></button>
            </div>
            <button class='ag-btn ag-btn-secondary btn-search' type='submit'>
            <span class='glyphicon glyphicon-search' aria-hidden='true'></span>
            </button>
            <button class='ag-btn ag-btn-secondary btn-search' id='cleanTrash' type='button' onClick='gestorMenu.cleanAllLayers()' title='Desactivar capas'></button>
            <button class='ag-btn ag-btn-secondary btn-search' id='menuPined' type='button' onClick='gestorMenu._menuFixed()' title='Fijar menú de capas'>
            <span class='glyphicon glyphicon-pushpin'></span>
            </button>
          </div>
        </form>`;

      return formContent;
    }
  }

  _menuFixed() {
    const sidebar = document.getElementById("sidebar");
    const menuPined = document.getElementById("menuPined");
    menuPined.classList.toggle("ag-btn-danger");
    sidebar.classList.toggle("menuFixed");
  }

  getAvailableTags() {
    var availableTags = [];
    for (var key in this.items) {
      var itemComposite = this.items[key];
      if (
        this._hasMoreTabsThanOne() == false ||
        itemComposite.getTab().getId() == this._selectedTab.getId()
      ) {
        //If not use tabs get all tags or just get available tags from item in selected tab
        availableTags = availableTags.concat(itemComposite.getAvailableTags());
      }
    }
    let uniqueTags = [...new Set(availableTags)]; //Remove Duplicates from Tags array
    return uniqueTags;
  }

  _printWithTabs() {
    var aSections = {};

    //Set initial html printing for all tabs
    for (var key in this._tabs) {
      if (this._selectedTab == null) {
        this.setSelectedTab(this._tabs[key].id);
        var sClassAux = "active";
      } else if (this._selectedTab.getId() == this._tabs[key].id) {
        var sClassAux = "active";
      }
      aSections[this._tabs[key].getExtendedId()] = [];
      aSections[this._tabs[key].getExtendedId()].push(
        "<div role='tabpanel' class='tab-pane " +
          sClassAux +
          "' id='" +
          this._tabs[key].getExtendedId() +
          "'>",
      );
      aSections[this._tabs[key].getExtendedId()].push(
        this._tabs[key].getInitialPrint(),
      );
      sClassAux = "";
    }

    this.getMenuDOM().innerHTML = sInitialHTML;

    var itemsAux = new Array();
    var itemsIterator = this._itemsGetter.get(this);
    for (var key in itemsIterator) {
      itemsAux.push(itemsIterator[key]);
    }
    itemsAux.sort(this.ordenaPorPeso);

    //Set items html printing for all tabs
    for (var key in itemsAux) {
      var itemComposite = itemsAux[key];
      if (itemComposite.getTab().getExtendedId() != EmptyTab) {
        itemComposite
          .getTab()
          .setSearchQuery(
            this._tabs[itemComposite.getTab().getId()].getSearchQuery(),
          ); //Set query search for filtering items
        aSections[itemComposite.getTab().getExtendedId()].push(
          itemComposite.imprimir(),
        );
      } else {
        if (document.getElementById(itemComposite.seccion)) {
          itemComposite.getObjDom().innerHTML = "";
        }
        itemComposite.setQuerySearch(this.getQuerySearch()); //Set query search for filtering items
        appendRenderedContent(
          itemComposite.getObjDom(),
          itemComposite.imprimir(),
        );
      }
    }

    //Set end html printing for all tabs
    for (var key in this._tabs) {
      aSections[this._tabs[key].getExtendedId()].push(
        this._tabs[key].getEndPrint(),
      );
    }

    var sInitialHTML = "<ul id='menuTabs' class='nav nav-tabs' role='tablist'>";
    for (var key in this._tabs) {
      if (this._selectedTab == null) {
        this.setSelectedTab(this._tabs[key].id);
        var sClassAux = "active";
      } else if (this._selectedTab.getId() == this._tabs[key].id) {
        var sClassAux = "active";
      }
      sInitialHTML +=
        "<li role='presentation'  class='" +
        sClassAux +
        "'><a href='#" +
        this._tabs[key].getExtendedId() +
        "' aria-controls='" +
        this._tabs[key].getExtendedId() +
        "' role='tab' data-toggle='tab'>" +
        this._tabs[key].getContent() +
        "</a></li>";
      sClassAux = "";
    }
    sInitialHTML += "</ul>";
    sInitialHTML += "<div id='tabContent' class='tab-content'>";

    for (var key in aSections) {
      sInitialHTML += aSections[key].join("") + "</div>";
    }

    sInitialHTML += "</div>";

    this.getMenuDOM().innerHTML = sInitialHTML;

    let sidebar = document.getElementById("sidebar");
    const searcher = document.createElement("div");
    searcher.style = "position: fixed; display: contents;";
    searcher.innerHTML = this._printSearcher();
    sidebar.insertBefore(searcher, sidebar.firstChild);
  }

  generateSubFolders(itemsToFolders, folders) {
    var itemsToPrint = new Array();

    for (var itemIndex in itemsToFolders) {
      //real items loop
      var itemComposite = itemsToFolders[itemIndex];
      var encontro = false;
      for (var folderIndex in folders) {
        //folders loop
        var folder = folders[folderIndex];
        if (folder.items) {
          if (folder.items.indexOf(itemComposite.seccion) != -1) {
            encontro = true;
            if (!itemsToPrint[folderIndex]) {
              itemsToPrint[folderIndex] = new ItemGroup(
                itemComposite.tab,
                folder.nombre,
                itemComposite.seccion + "f" + folderIndex,
                itemComposite.peso,
                itemComposite.palabrasClave,
                folder.resumen,
                folder.resumen,
              );
              itemsToPrint[folderIndex].setImpresor(new ImpresorGrupoHTML());
              itemsToPrint[folderIndex].itemsComposite = {};
              itemsToPrint[folderIndex].setObjDom(itemComposite.objDOM);
            }
            itemsToPrint[folderIndex].itemsComposite[itemComposite.seccion] =
              itemComposite;
          }
        }
        if (folder.folders) {
          ret = this.generateSubFolders(itemsToFolders, folder.folders);
          if (ret != null && ret.length > 0) {
            itemComposite = ret[0];
            encontro = true;
            if (!itemsToPrint[folderIndex]) {
              itemsToPrint[folderIndex] = new ItemGroup(
                itemComposite.tab,
                folder.nombre,
                itemComposite.seccion + "f" + folderIndex,
                itemComposite.peso,
                itemComposite.palabrasClave,
                folder.resumen,
                folder.resumen,
              );
              itemsToPrint[folderIndex].setImpresor(new ImpresorGrupoHTML());
              itemsToPrint[folderIndex].itemsComposite = {};
              itemsToPrint[folderIndex].setObjDom(itemComposite.objDOM);
            }
            for (var j = 0; j < ret.length; j++) {
              itemsToPrint[folderIndex].itemsComposite[itemComposite.seccion] =
                ret[j];
            }
          }
        }
      }
    }

    return itemsToPrint;
  }

  isItemInSubFolders(itemComposite, folders) {
    for (var folderIndex in folders) {
      //folders loop
      var folder = folders[folderIndex];
      if (folder.items) {
        if (folder.items.indexOf(itemComposite.seccion) != -1) {
          return true;
        }
      }
      if (folder.folders) {
        return this.isItemInSubFolders(itemComposite, folder.folders);
      }
    }

    return false;
  }

  generateFolders(itemsToFolders) {
    var itemsToPrint = new Array();
    var i = 100;

    for (var itemIndex in itemsToFolders) {
      //real items loop
      var itemComposite = itemsToFolders[itemIndex];
      var encontro = false;
      for (var folderIndex in this._folders) {
        //folders loop
        var folder = this._folders[folderIndex];
        if (folder.items) {
          if (folder.items.indexOf(itemComposite.seccion) != -1) {
            encontro = true;
            if (!itemsToPrint[folderIndex]) {
              itemsToPrint[folderIndex] = new ItemGroup(
                itemComposite.tab,
                folder.nombre,
                itemComposite.seccion + "f" + folderIndex,
                itemComposite.peso,
                itemComposite.palabrasClave,
                folder.resumen,
                folder.resumen,
              );
              itemsToPrint[folderIndex].setImpresor(new ImpresorGrupoHTML());
              itemsToPrint[folderIndex].itemsComposite = {};
              itemsToPrint[folderIndex].setObjDom(itemComposite.objDOM);
            }
            itemsToPrint[folderIndex].itemsComposite[itemComposite.seccion] =
              itemComposite;
          }
        }
        if (encontro == false && folder.folders) {
          encontro = this.isItemInSubFolders(itemComposite, folder.folders);
        }
      }
      if (!encontro) {
        itemsToPrint[i++] = itemComposite;
      }
    }

    for (var folderIndex in this._folders) {
      //folders loop
      var folder = this._folders[folderIndex];
      if (folder.folders) {
        var ret = this.generateSubFolders(itemsToFolders, folder.folders);
        if (ret != null && ret.length > 0) {
          itemComposite = ret[0];
          if (!itemsToPrint[folderIndex]) {
            itemsToPrint[folderIndex] = new ItemGroup(
              itemComposite.tab,
              folder.nombre,
              itemComposite.seccion + "f" + folderIndex,
              itemComposite.peso,
              itemComposite.palabrasClave,
              folder.resumen,
              folder.resumen,
            );
            itemsToPrint[folderIndex].setImpresor(new ImpresorGrupoHTML());
            itemsToPrint[folderIndex].itemsComposite = {};
            itemsToPrint[folderIndex].setObjDom(itemComposite.objDOM);
          }
          for (var j = 0; j < ret.length; j++) {
            itemsToPrint[folderIndex].itemsComposite[itemComposite.seccion] =
              ret[j];
          }
        }
      }
    }

    itemsToPrint.sort(this.ordenaPorPeso);
    for (var key in itemsToPrint) {
      appendRenderedContent(
        itemsToPrint[key].getObjDom(),
        itemsToPrint[key].imprimir(),
      );
    }
  }

  printMenu() {
    this.processLayersJoin();

    if (this._hasMoreTabsThanOne()) {
      this._printWithTabs();
    } else {
      this.getMenuDOM().innerHTML = this._printSearcher();
      menu_ui.rebuildConfiguredFileLayers();

      var itemsAux = new Array();
      var itemsIterator = this._itemsGetter.get(this);
      for (var key in itemsIterator) {
        itemsAux.push(itemsIterator[key]);
      }
      itemsAux.sort(this.ordenaPorPeso);

      var itemsAuxToFolders = new Array(); //Array with items and folders
      for (var key in itemsAux) {
        var itemComposite = itemsAux[key];
        itemComposite.setQuerySearch(this.getQuerySearch()); //Set query search for filtering items

        if (document.getElementById(itemComposite.seccion)) {
          itemComposite.getObjDom().innerHTML = "";
        }

        itemsAuxToFolders.push(itemComposite);
      }
      //Generate logical folders
      this.generateFolders(itemsAuxToFolders);
    }

    const loading = this.getLoadingDOM();
    if (loading) loading.style.display = "none";
    bindZoomLayer();
    bindLayerOptions();

    //Call callback after print (if exists)
    if (this.printCallback != null) {
      this.printCallback();
    }

    //Show visible layers count in class (to save state after refresh menu)
    for (var key in this.items) {
      this.items[key].muestraCantidadCapasVisibles();
      showTotalNumberofLayers();
    }

    //Tabs
    document.querySelectorAll('a[data-toggle="tab"]').forEach((tab) => {
      tab.addEventListener("shown.bs.tab", function (event) {
      var target = event.target.getAttribute("href"); // activated tab object
      var activeTabId = target.replace("#main-menu-tab-", ""); // activated tab id
      gestorMenu.setSelectedTab(activeTabId);
      if (gestorMenu._selectedTab.isSearcheable == true) {
        document.getElementById("searchForm").style.display = "";
        const queryInput = document.getElementById("q");
        queryInput.value = gestorMenu._selectedTab.getSearchQuery();
        queryInput.dispatchEvent(new Event("input", { bubbles: true }));
      } else {
      }
      });
    });
    if (
      this._hasMoreTabsThanOne() == true &&
      this._selectedTab.isSearcheable == false
    ) {
      //Check if first active tab is searcheable
    }

    //Searcher
    document.querySelectorAll('.has-clear input[type="text"]').forEach((input) => {
      const updateClearButton = () => {
        input.parentElement
          ?.querySelectorAll(":scope > .form-control-clear")
          .forEach((button) => button.classList.toggle("hidden", !input.value));
      };
      input.addEventListener("input", updateClearButton);
      updateClearButton();
    });
    document.querySelectorAll(".form-control-clear").forEach((button) => {
      button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      const input = this.parentElement?.querySelector(':scope > input[type="text"]');
      if (input) {
        input.value = "";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus();
      }
      gestorMenu.setQuerySearch("");
      gestorMenu.printMenu();
      });
    });
    document.getElementById("searchclear")?.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      document.getElementById("q").value = "";
      gestorMenu.setQuerySearch("");
      gestorMenu.printMenu();
    });

    const performSearch = (queryValue) => {
      gestorMenu.setQuerySearch(queryValue == null ? "" : queryValue);
      gestorMenu.printMenu();
    };

    const searchFormElement = document.getElementById("searchForm");
    if (searchFormElement && !searchFormElement.dataset.boundSubmit) {
      searchFormElement.addEventListener("submit", function (event) {
        event.preventDefault();
        const queryInput = document.getElementById("q");
        const queryValue = queryInput ? queryInput.value : "";
        performSearch(queryValue);
      });
      searchFormElement.dataset.boundSubmit = "true";
    }

    bindLayerSearchAutocomplete(
      document.getElementById("q"),
      () => gestorMenu.getAvailableTags(),
      performSearch,
    );
  }

  //Prints only one section (works on lazy initialization only)
  printOnlySection(sectionId) {
    this.processLayersJoin();
    var itemGroup = this.items[sectionId];
    if (itemGroup.tab.listType == "combobox") {
      //Si es combobox
      itemGroup.imprimir();
      document.getElementById("wms-combo-list").innerHTML = itemGroup.itemsStr;
    } else {
      //Si no es es combobox
      itemGroup.imprimir();
      document.querySelector(`#${CSS.escape(sectionId)} > div`).innerHTML =
        itemGroup.itemsStr;
    }
    bindZoomLayer();
    bindLayerOptions();
  }

  muestraCapa(itemSeccion) {
    if (!mapa.hasOwnProperty("activeLayerHasChanged")) {
      window.addEventListener(
        ARGENMAP_EVENTS.ACTIVE_LAYER_HANDLER_READY,
        () => gestorMenu.muestraCapa(itemSeccion),
        { once: true },
      );
      return;
    }

    const wmtsLayers = [];

    //Hide all if itemComposite selected is Base Map
    var isBaseLayer = false;
    let baseLayerName = "";

    for (var key in this.items) {
      var itemComposite = this.items[key];
      for (var key2 in itemComposite.itemsComposite) {
        var item = itemComposite.itemsComposite[key2];
        if (item.getId() == itemSeccion) {
          isBaseLayer = itemComposite.isBaseLayer();
          baseLayerName = item.nombre;
          break;
        }
      }
    }

    if (isBaseLayer && this.lastBaseMapSelected !== baseLayerName) {
      if (this.baseMapDependencies[this.lastBaseMapSelected])
        this.baseMapDependencies[this.lastBaseMapSelected].forEach((layer) => {
          if (this.activeLayers.find((lyr) => lyr === layer))
            this.muestraCapa(this.getLayerIdByName(layer));
        });
    }

    //Show or hide selected item
    for (var key in this.items) {
      var itemComposite = this.items[key];
      if (isBaseLayer && itemComposite.isBaseLayer()) {
        this.availableBaseLayers.forEach((baseLayer) => {
          this.removeActiveLayer(baseLayer);
        });
        itemComposite.hideAllLayers();
      }

      for (var key2 in itemComposite.itemsComposite) {
        var item = itemComposite.itemsComposite[key2];

        const layerIsActive = this.layerIsActive(item.nombre);
        const layerIsWmts = this.layerIsWmts(item.nombre);

        if (isBaseLayer && layerIsActive && layerIsWmts) {
          wmtsLayers.push(item);
        } else {
          let id = item.getId();
          if (id === itemSeccion) {
            if (document.getElementById(itemSeccion)?.classList.contains("active")) {
              this.removeActiveLayer(item.nombre);
              if (!isBaseLayer) mapa.activeLayerHasChanged(item.nombre, false);
              if (geoProcessingManager) {
                geoProcessingManager.updateLayerSelect(item.nombre, false);
              }
            } else {
              this.addActiveLayer(item.nombre);
              if (!isBaseLayer) mapa.activeLayerHasChanged(item.nombre, true);
              if (geoProcessingManager) {
                geoProcessingManager.updateLayerSelect(item.nombre, true);
              }
            }

            item.showHide();
            itemComposite.muestraCantidadCapasVisibles();
            showTotalNumberofLayers();
            break;
          }
        }
      }
    }

    if (isBaseLayer && this.lastBaseMapSelected !== baseLayerName) {
      this.setLastBaseMapSelected(baseLayerName);

      setValidZoomLevel(baseLayerName);

      if (this.baseMapDependencies[baseLayerName])
        this.baseMapDependencies[baseLayerName].forEach((layer) => {
          if (!this.activeLayers.find((lyr) => lyr === layer))
            this.muestraCapa(this.getLayerIdByName(layer));
        });

      wmtsLayers.forEach((wmtsLayer) => {
        wmtsLayer.showHide();
        wmtsLayer.showHide();
      });

      for (let i = 0; i < this.availableBaseLayers.length; i++) {
        const id = "child-mapasbase" + i;
        const element = document.getElementById(id);
        if (itemSeccion !== id && element?.classList.contains("active")) {
          element.classList.remove("active");
        }
      }
    }

    if (this.activeLayersHasBeenUpdated) this.activeLayersHasBeenUpdated();
  }

  showWMSLayerCombobox(itemSeccion) {
    let nuevo_impresor = new Menu_UI();
    nuevo_impresor.addLoadingAnimation("NEW-wms-combo-list");
    //Realiza el GET de las capas

    let tempMenu = document.getElementById("temp-menu");
    tempMenu ? tempMenu.remove() : 0;

    var itemSeccionAux = itemSeccion.replace(ItemGroupPrefix, "");
    for (var key in this.layersInfo) {
      if (
        this.layersInfo[key].section == itemSeccionAux &&
        !this.layersInfo[key]._executed
      ) {
        this.addLazyInitLayerInfoCounter(itemSeccion);
        //nueva opcion crea un objeto para cada btn
        this.layersInfo[key].get_without_print(this);
        //this.layersInfo[key].get(this)
      }
    }
    // bindLayerOptionsIdera();
  }

  getLayerData(layerName, sectionName) {
    let sectionLayers,
      sections,
      layersArr = [],
      layerData = {};

    sectionName
      ? ((sectionLayers = gestorMenu.items[sectionName].itemsComposite),
        layersArr.push(...Object.values(sectionLayers)))
      : ((sections = gestorMenu.items),
        Object.values(sections).forEach((section) => {
          section.seccion !== "mapasbase"
            ? layersArr.push(...Object.values(section.itemsComposite))
            : "";
        }));

    layersArr.forEach((layer) => {
      let lyr = layer.capa;
      lyr.nombre === layerName
        ? (layerData = {
            name: lyr.nombre,
            title: lyr.titulo,
            url: lyr.host.substring(0, lyr.host.lastIndexOf("/")),
            keywords: lyr.keywords ?? [],
            icon: lyr.legendURL,
            bbox: {
              sw: {
                lng: lyr.minx,
                lat: lyr.miny,
              },
              ne: {
                lng: lyr.maxx,
                lat: lyr.maxy,
              },
            },
          })
        : "";
    });
    return layerData ?? {};
  }
}

/******************************************
Tabs menu class
******************************************/
class Tab {
  constructor(tab) {
    this.id = "";
    this.content = "";
    this.isSearcheable = false;
    this.searchQuery = "";
    this.listType = "accordion";
    this.itemsGetter = new ItemsGetter();
    if (tab != undefined && tab != "") {
      this.id = tab.id;
      if (tab.searcheable != undefined) {
        this.isSearcheable = tab.searcheable;
      }
      if (tab.content != undefined) {
        this.content = tab.content;
      }
      if (tab.list_type != undefined) {
        this.listType = tab.list_type;
      }
    }
  }

  getId() {
    return this.id;
  }

  getExtendedId() {
    return EmptyTab + this.id;
  }

  getContent() {
    return this.content != undefined && this.content != ""
      ? this.content
      : this.getId();
  }

  getSearchQuery() {
    return this.searchQuery;
  }

  setSearchQuery(q) {
    this.searchQuery = q;
  }

  getInitialPrint() {
    if (this.listType == "combobox") {
      return (
        '<select id="wms-combobox-selector-' +
        this.id +
        '" onChange="gestorMenu.showWMSLayerCombobox(this.value)" class="wms-combobox-selector"><option value="">Seleccione un servicio</option>'
      );
    }
    return "";
  }

  getEndPrint() {
    if (this.listType == "combobox") {
      return '</select><div id="wms-combo-list"></div><div id="NEW-wms-combo-list"></div>';
    }
    return "";
  }
}

var serviceItems = [];
/******************************************
Menu_UI
******************************************/
class Menu_UI {
  constructor() {
    this.layer_active_options = null;
    this.available_options = ["download", "filter", "trash"];
  }

  addSection(name, idOverride = null) {
    // name: visible label, idOverride: optional stable identifier for HTML ids
    let groupnamev = clearSpecialChars(idOverride || name);
    const sectionStyle =
      app.items?.find(
        (item) => item.seccion === groupnamev && item.section_style,
      )?.section_style ||
      app.sectionStyles?.[groupnamev] ||
      null;
    const sectionPrinter = new ImpresorGrupoHTML();
    const styleAttributes = sectionPrinter.getSectionStyleAttributes(sectionStyle);
    const headerIcon = sectionPrinter.getHeaderIcon(sectionStyle?.header?.icon);
    const isExpanded = app.sectionExpanded?.[groupnamev] === true;
    let itemnew = document.createElement("div");
    itemnew.className = "custom-file-layer-section";
    itemnew.innerHTML = `
      <div id="lista-${groupnamev}" class="menu5 panel-default${sectionStyle ? " section-custom-style" : ""}"${styleAttributes}>
      <div class="panel-heading" data-toggle="collapse" data-target="#${groupnamev}-content" aria-expanded="${isExpanded}">
        <h4 class="panel-title">
        ${headerIcon}<a id="${groupnamev}-a" data-parent="#accordion1" class="item-group-title">${name}</a>
        </h4>
      </div>
      <div id='${groupnamev}-content' class="panel-collapse collapse${isExpanded ? " in" : ""}" aria-expanded="${isExpanded}">
        <div class="panel-body" id ="${groupnamev}-panel-body"></div>
      </div>
      </div>`;

    let searchForm = document.getElementById("searchForm");
    searchForm.after(itemnew);
  }

  addParentSection(parent, child) {
    let parentNamev = clearSpecialChars(parent);
    let childName = clearSpecialChars(child);

    let parentItemnew = document.createElement("div");
    parentItemnew.innerHTML = `
      <div id="lista-${parentNamev}" class="menu5 panel-default">
      <div class="panel-heading" data-toggle="collapse" data-target="#${parentNamev}-content" data-parent="#accordion1" aria-expanded="false">
          <h4 class="panel-title">
              <i class="fa-solid fa-folder-tree"></i>
              <a id="${parentNamev}-a" class="item-group-title">${parent}</a>
          </h4>
      </div>
      <div id='${parentNamev}-content' class="panel-collapse collapse" style="width: 90%; margin-left: auto;">
          <div class="panel-body" id ="${parentNamev}-panel-body"></div>
      </div>
      </div>`;

    let subItemnew = document.createElement("div");
    subItemnew.innerHTML = `
      <div id="lista-${childName}" class="menu5 panel-default">
      <div class="panel-heading" data-toggle="collapse" data-target="#${childName}-content" data-parent="#accordion1" aria-expanded="false">
      <h4 class="panel-title">
      <i class="fa-regular fa-folder-open"></i>
      <a id="${childName}-a" class="item-group-title">${"hijo"}</a>
      </h4>
      </div>
      <div id='${childName}-content' class="panel-collapse collapse" style="width: 90%; margin-left: auto;">
      <div class="panel-body" id ="${childName}-panel-body"></div>
      </div>
      </div>`;

    let searchForm = document.getElementById("searchForm"),
      isParent = document.getElementById(`lista-${parentNamev}`);
    if (!isParent) {
      searchForm.after(parentItemnew);
    }
    let location = document.getElementById(`${parentNamev}-panel-body`);
    location.appendChild(subItemnew);
  }

  addLayerOption({
    color = "#474b4e",
    classList = "far fa-question-circle",
    title = "Layer option",
    onclick = callback,
  }) {
    const layerOption = document.createElement("li");
    layerOption.innerHTML = `<a style="color:${color};" href="#"><i class="${classList}" aria-hidden="true" style="width:20px;"></i>${title}</a>`;
    layerOption.onclick = function () {
      callback;
    };
    return layerOption;
  }

  rebuildConfiguredFileLayers() {
    const sectionNodes = document.querySelectorAll(".custom-file-layer-section");
    sectionNodes.forEach((sectionNode) => sectionNode.remove());

    if (typeof configuredFileLayerRegistry === "undefined") {
      return;
    }

    configuredFileLayerRegistry.forEach((entry) => {
      this.addFileLayer(
        entry.sectionLabel,
        entry.layerType,
        entry.textName,
        entry.id,
        entry.fileName,
        entry.isActive,
        entry.icon,
        entry.description,
        entry.allowedOptions,
        entry.sectionId,
        entry.activeButtonColor,
        entry.editable,
      );
    });
  }

  addFileLayer(
    groupname,
    layerType,
    textName,
    id,
    fileName,
    isActive,
    icon = null,
    description = "",
    allowedOptions = null,
    groupId = null,
    activeButtonColor = null,
    editable = true,
  ) {
    // groupname: visible label; groupId: optional stable identifier for HTML IDs
    let groupnamev = clearSpecialChars(groupId || groupname);
    const existingLayerNode = document.getElementById(`fl-${id}`);
    if (existingLayerNode) {
      return;
    }

    const activeAllowedOptions = Array.isArray(allowedOptions)
      ? allowedOptions.map((option) => option.toLowerCase())
      : [
          "zoom",
          "query",
          "edit",
          "data",
          "download",
          "rename",
          "delete",
        ];

    if (!fileLayerGroup.includes(groupname)) {
      fileLayerGroup.push(groupname);
    }
    let main = document.getElementById("lista-" + groupnamev);

    let div = ` 
        <div style="display:flex; flex-direction:row;">
        <div style="cursor: pointer; width: 70%" onclick="clickGeometryLayer('${id}')"><span style="user-select: none;">${id}</span></div>
        <div class="icon-layer-geo" onclick="mapa.downloadMultiLayerGeoJSON('${id}')"><i class="fas fa-download" title="descargar"></i></div>
        <div class="icon-layer-geo" onclick="deleteLayerGeometry('${id}')"><i class="far fa-trash-alt" title="eliminar"></i></div>
        </div>
        `;
    //si no existe contenedor
    let id_options_container = "opt-c-" + id;
    if (!main) {
      this.addSection(groupname, groupId || groupnamev);
    }
    let content = document.getElementById(groupnamev + "-panel-body");
    let layer_container = document.createElement("div");
    layer_container.id = "fl-" + id;
    layer_container.className = "file-layer-container";

    let layer_item = document.createElement("div");
    layer_item.id = "flc-" + id;
    if (isActive) {
      layer_item.className = "file-layer active";
    } else if (!isActive) {
      layer_item.className = "file-layer";
    }
    if (activeButtonColor) {
      layer_item.style.setProperty(
        "--file-layer-active-color",
        activeButtonColor,
      );
    }

    let img_icon = document.createElement("div");
    img_icon.className = "file-img";
    if (icon && icon.includes("fa")) {
      img_icon.innerHTML = `<i class="${icon}" aria-hidden="true" title="${description || textName}"></i>`;
    } else if (icon) {
      img_icon.innerHTML = `<img loading="lazy" src="${icon}" alt="${textName}">`;
    } else {
      img_icon.innerHTML = `<img loading="lazy" src="src/js/components/openfiles/icon_file.svg" alt="Capa">`;
    }
    img_icon.onclick = function () {
      clickGeometryLayer(id);
    };

    let layer_name = document.createElement("div");
    layer_name.className = "file-layername";
    layer_name.innerHTML = "<a>" + textName + "</a>";
    layer_name.title = description || fileName;
    layer_name.onclick = function () {
      clickGeometryLayer(id);
    };

    let options = document.createElement("div");
    options.style = "width:10%;padding-right:5px;cursor:pointer;";
    options.className = "btn-group";
    options.role = "group";
    options.id = id_options_container;

    let fdiv = document.createElement("div");
    fdiv.style = "border: 0px;";
    fdiv.className = "dropdown-toggle";
    fdiv.setAttribute("data-toggle", "dropdown");
    fdiv.setAttribute("aria-haspopup", "true");
    fdiv.setAttribute("aria-expanded", "false");
    fdiv.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16"> <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/> </svg>';
    // fdiv.innerHTML = '<span class="caret"></span>'

    let mainul = document.createElement("ul");
    mainul.className = "dropdown-menu file-layer-dropdown-menu";
    mainul.id = "opt-c-" + id;

    // Render the menu outside the layer sidebar while it is open. Several
    // ancestors scroll or clip their contents, so z-index alone cannot make
    // the dropdown extend over the map.
    const openLayerOptions = () => {
        const buttonBounds = fdiv.getBoundingClientRect();
        document.body.appendChild(mainul);
        mainul.classList.add("file-layer-dropdown-menu-open");
        const viewport = window.visualViewport;
        const viewportLeft = viewport?.offsetLeft || 0;
        const viewportTop = viewport?.offsetTop || 0;
        const viewportWidth = viewport?.width || document.documentElement.clientWidth;
        const viewportHeight = viewport?.height || window.innerHeight;
        const menuWidth = mainul.getBoundingClientRect().width;
        const spaceOnRight = viewportLeft + viewportWidth - buttonBounds.right;
        const preferredLeft =
          spaceOnRight >= menuWidth + 8
            ? buttonBounds.right
            : buttonBounds.left - menuWidth;
        const left = Math.min(
          Math.max(viewportLeft + 8, preferredLeft),
          viewportLeft + viewportWidth - menuWidth - 8,
        );

        mainul.style.left = `${left}px`;
        mainul.style.top = `${buttonBounds.top}px`;

        const bottomOverflow =
          mainul.getBoundingClientRect().bottom - (viewportTop + viewportHeight);
        if (bottomOverflow > 0) {
          mainul.style.top = `${Math.max(
            viewportTop + 8,
            buttonBounds.top - bottomOverflow - 8,
          )}px`;
        }
        options.classList.add("open");
        fdiv.setAttribute("aria-expanded", "true");
    };
    const closeLayerOptions = () => {
        mainul.classList.remove("file-layer-dropdown-menu-open");
        mainul.removeAttribute("style");
        options.appendChild(mainul);
        options.classList.remove("open");
        fdiv.setAttribute("aria-expanded", "false");
    };
    fdiv.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (mainul.classList.contains("file-layer-dropdown-menu-open")) {
        closeLayerOptions();
      } else {
        document
          .querySelectorAll(".file-layer-dropdown-menu-open")
          .forEach((menu) => menu.dispatchEvent(new CustomEvent("argenmap:close")));
        openLayerOptions();
      }
    });
    mainul.addEventListener("argenmap:close", closeLayerOptions);
    mainul.addEventListener("click", (event) => {
      event.stopPropagation();
      queueMicrotask(closeLayerOptions);
    });
    document.addEventListener("click", closeLayerOptions);

    let delete_opt = document.createElement("li");
    delete_opt.innerHTML = `<a style="color:#474b4e;" href="#"><i  class="fa fa-trash" aria-hidden="true" style="width:20px;"></i>Eliminar Capa</a>`;
    delete_opt.onclick = function () {
      let menu = new Menu_UI();
      menu.modalEliminar(id, groupnamev, layerType);
      //deleteLayerGeometry(layer)
    };

    let download_opt = document.createElement("li");
    download_opt.innerHTML = `<a style="color:#474b4e;" href="#"><i class="fa fa-download" aria-hidden="true" style="width:20px;"></i>Descargar</a>`;
    download_opt.onclick = function () {
      const index_file = getIndexFileLayerbyID(id);
      // let d_file_name = addedLayers[index_file].name // unused
      const layer = addedLayers[index_file];
      if (!layer.download) {
        mapa.downloadMultiLayerGeoJSON(id, layer.name, true);
        return;
      }
      layer.download();
      return;
    };

    let edit_data_opt = document.createElement("li");
    edit_data_opt.innerHTML = `<a style="color:#474b4e;" href="#"><i class="fa fa-table" aria-hidden="true" style="width:20px;"></i>Ver Datos</a>`;
    edit_data_opt.onclick = async function () {
      await ensureTableDependencies();
      const index_file = getIndexFileLayerbyID(id);
      const data = addedLayers[index_file];
      let dTable = new Datatable(data.layer);
      createTabulator(dTable, data.file_name, { editable: true });
      return;
    };

    let edit_name_opt = document.createElement("li");
    edit_name_opt.innerHTML = `<a style="color:#474b4e;" href="#"><i class="fa fa-edit" aria-hidden="true" style="width:20px;"></i>Editar Nombre</a>`;
    edit_name_opt.onclick = function () {
      menu_ui.editFileLayerName(id);
    };

    let zoom_layer_opt = document.createElement("li");
    zoom_layer_opt.innerHTML = `<a style="color:#474b4e;" href="#"><i class="fa fa-search-plus" aria-hidden="true" style="width:20px;"></i>Zoom a capa</a>`;
    zoom_layer_opt.onclick = function () {
      addedLayers.forEach((lyr) => {
        if (lyr.id === id) {
          // Si la capa es un imageOverlay (waterRise/cota), usar sus bounds directamente
          if (lyr.layer && typeof lyr.layer.getBounds === 'function' && lyr.layer._url) {
            mapa.fitBounds(lyr.layer.getBounds());
          } else {
            mapa.centerLayer(lyr.layer);
          }
        }
      });
    };

    const addedLayer = addedLayers.find((layer) => layer.id === id);
    let queryIsActive = Boolean(addedLayer?.queryActive);
    const queryIsAvailable = addedLayer?.queryable !== false;
    const query_opt = document.createElement("li");

    const getQueryLayers = () => getFileLayerFeatures(id);

    const renderQueryOption = () => {
      query_opt.innerHTML = `<a style="color:#474b4e;" href="#"><i class="fa ${
        queryIsActive ? "fa-toggle-on" : "fa-toggle-off"
      }" aria-hidden="true" style="width:20px;"></i>${
        queryIsActive ? "Desactivar consulta" : "Activar consulta"
      }</a>`;
    };

    renderQueryOption();
    query_opt.onclick = function (event) {
      event.preventDefault();
      event.stopPropagation();
      const queryLayers = getQueryLayers();
      queryIsActive = !queryLayers.some((layer) => layer.activeData === true);
      queryLayers.forEach((layer) => {
        layer.activeData = queryIsActive;
      });

      const layerEntry = addedLayers.find((layer) => layer.id === id);
      if (layerEntry) {
        layerEntry.queryActive = queryIsActive;
      }
      renderQueryOption();
    };

    fdiv.addEventListener("click", () => {
      const queryLayers = getQueryLayers();
      if (queryLayers.length > 0) {
        queryIsActive = queryLayers.some((layer) => layer.activeData === true);
      }
      renderQueryOption();
    });

    let editIsActive = addedLayer?.editable ?? (editable !== false);
    const edit_opt = document.createElement("li");
    const renderEditOption = () => {
      edit_opt.innerHTML = `<a style="color:#474b4e;" href="#"><i class="fa ${
        editIsActive ? "fa-lock" : "fa-unlock"
      }" aria-hidden="true" style="width:20px;"></i>${
        editIsActive ? "Desactivar edición" : "Activar edición"
      }</a>`;
    };

    renderEditOption();
    layer_item.addEventListener("argenmap:editabilitychange", (event) => {
      editIsActive = event.detail?.editable !== false;
      renderEditOption();
    });
    edit_opt.onclick = function (event) {
      event.preventDefault();
      event.stopPropagation();
      editIsActive = setFileLayerEditable(id, !editIsActive);
      renderEditOption();
    };

    fdiv.addEventListener("click", () => {
      const fileLayer = addedLayers.find((layer) => layer.id === id);
      editIsActive = fileLayer?.editable ?? (editable !== false);
      renderEditOption();
    });

    /* let query_opt = document.createElement("li")
            query_opt.innerHTML =`<a style="color:#474b4e;" href="#"><i class="far fa-question-circle" aria-hidden="true" style="width:20px;"></i>Ver datos</a>`
            query_opt.onclick = function(){
                console.log('add a popup here!')
                addedLayers.forEach( lyr => {
                    if( lyr.id === id ) {
                        //addedLayers[0].id
                        lyr.bindPopup(lyr.layer.features[0].properties);
                        mapa.editableLayers.polygon[0].bindPopup
                    }
                });
            } */

    /* let style_opt = document.createElement("li")
            style_opt.innerHTML =`<a style="color:#474b4e;" href="#"><i class="fas fa-paint-brush" aria-hidden="true" style="width:20px;"></i>Editar estilo</a>`
            style_opt.onclick = function(){
                console.log('edit style!');
            } */

    /* let chart_opt = document.createElement("li")
            chart_opt.innerHTML =`<a style="color:#474b4e;" href="#"><i class="fas fa-chart-pie" aria-hidden="true" style="width:20px;"></i>Editar estilo</a>`
            chart_opt.onclick = function(){
                console.log('add a popup here!');
            } */

    /* let copy_opt = document.createElement("li")
            copy_opt.innerHTML =`<a style="color:#474b4e;" href="#"><i class="fas fa-copy" aria-hidden="true" style="width:20px;"></i>Editar estilo</a>`
            copy_opt.onclick = function(){
                console.log('add a popup here!');
            } */

    if (activeAllowedOptions.includes("zoom")) {
      mainul.append(zoom_layer_opt);
    }
    if (activeAllowedOptions.includes("query") && queryIsAvailable) {
      mainul.append(query_opt);
    }
    if (activeAllowedOptions.includes("edit")) {
      mainul.append(edit_opt);
    }
    if (activeAllowedOptions.includes("rename")) {
      mainul.append(edit_name_opt);
    }
    if (activeAllowedOptions.includes("data")) {
      mainul.append(edit_data_opt);
    }
    if (activeAllowedOptions.includes("download")) {
      mainul.append(download_opt);
    }
    if (activeAllowedOptions.includes("delete")) {
      mainul.append(delete_opt);
    }
    //mainul.append(query_opt)
    //mainul.append(copy_opt)
    //mainul.append(style_opt)
    //mainul.append(chart_opt)

    options.append(fdiv);
    options.append(mainul);

    layer_item.append(img_icon);
    layer_item.append(layer_name);
    layer_item.append(options);
    layer_container.append(layer_item);
    content.appendChild(layer_container);
    showTotalNumberofLayers();
    addCounterForSection(groupname, layerType);
  }

  addLayerOptions(layer) {
    //display options true
    app.layers[layer].display_options = true;
    this.layer_active_options = layer;

    let id = "layer-options-" + layer;
    let el = document.getElementById(id);

    el.setAttribute("class", "layer-options-active");
    let options_container = document.createElement("div");
    options_container.className = "options-container";

    let options_tabs = document.createElement("div");
    options_tabs.className = "options-tabs";
    options_tabs.innerHTML = `
            <div class="option-tab-icon-active" title="descargar capa"><i class="fa fa-download" aria-hidden="true"></i></div>
            <div class="option-tab-icon" title="filtros"><i class="fa fa-filter" aria-hidden="true"></i></div>
            <div class="option-tab-icon" title="borrar capa"><i class="fa fa-trash" aria-hidden="true"></i></div>
            `;

    let options_panel = document.createElement("div");
    options_panel.className = "options-panel";
    options_panel.innerHTML = `
            <div class="panel-download"></div>
            <div class="panel-filter"></div>
            <div class="panel-trash"></div>
            `;
    options_container.append(options_tabs);
    options_container.append(options_panel);
    el.append(options_container);
  }

  closeLayerOptions(layer) {
    let el = document.getElementById("layer-options-" + layer);
    app.layers[layer].display_options = false;
    if (el) {
      el.setAttribute("class", "display-none");
      el.innerHTML = "";
    }
  }

  addLoadingAnimation(id_dom) {
    let contenedor = document.getElementById(id_dom);
    contenedor.innerHTML = "";
    contenedor.innerHTML =
      '<div class="loading"><img src="src/styles/images/loading.svg"></div>';
  }

  async addLayers_combobox(items) {
    let contenedor = document.getElementById("NEW-wms-combo-list");
    let list = document.createElement("div");
    list.classList = "panel-body";
    let layers = items.itemsComposite;
    for (const property in layers) {
      let id_dom = "child-" + layers[property].seccion;
      let title = layers[property].capa.titulo;
      let url_img = layers[property].capa.legendURL;
      let descripcion = layers[property].capa.descripcion;
      let li_layer = this.add_btn_Layer_combobox(
        id_dom,
        title,
        url_img,
        descripcion,
        false,
      );
      list.append(li_layer);
    }
    contenedor.innerHTML = "";
    contenedor.append(list);
  }

  add_btn_Layer_combobox(id_dom, title, url_img, descripcion, options) {
    // reemplazar =title
    let min_url_img =
      url_img +
      _LEGEND_PARAMS +
      _LEGEND_OPTIONS +
      "forceTitles:off;forceLabels:off;";
    let max_url_img =
      url_img + _LEGEND_PARAMS + _LEGEND_OPTIONS + "forceLabels:on;";
    let li = document.createElement("li");
    li.id = id_dom;
    li.className = "capa list-group-item";
    li.style = "padding: 10px 1px 10px 1px;";

    if (options) {
      //pendiente crear objeto
      options_layer =
        "<div class='display-none' id=layer-options-" + title + "></div>";
    }

    let capa_info = document.createElement("div");
    capa_info.className = "capa-info";

    let container_expand_legend_grafic = document.createElement("div");
    container_expand_legend_grafic.className = "expand-legend-graphic hidden";
    container_expand_legend_grafic.style = "overflow:hidden;";
    container_expand_legend_grafic.setAttribute("load", false);

    let capa_legend_div = document.createElement("div");
    capa_legend_div.className = "legend-layer";

    let img_legend = document.createElement("img");
    img_legend.className = "legend-img";
    img_legend.style = "width:22px;height:22px";
    img_legend.loading = "lazy";
    img_legend.src = min_url_img;
    img_legend.setAttribute("onerror", "showImageOnError(this)");
    capa_legend_div.append(img_legend);

    let resize_img_icon = document.createElement("div");
    resize_img_icon.className = "resize-legend-combobox";
    resize_img_icon.style = "align-self: center;font-size: 14px";
    resize_img_icon.innerHTML =
      '<i class="fas fa-angle-down" aria-hidden="true"></i>';
    resize_img_icon.onclick = () => {
      if (container_expand_legend_grafic.getAttribute("load") === "true") {
        container_expand_legend_grafic.innerHTML = "";
        container_expand_legend_grafic.classList.toggle("hidden");
        container_expand_legend_grafic.setAttribute("load", false);
        resize_img_icon.innerHTML =
          '<i class="fas fa-angle-down" aria-hidden="true"></i>';
      } else {
        container_expand_legend_grafic.innerHTML =
          "<img class='legend-img-max' loading='lazy'  src='" +
          max_url_img +
          "' onerror='showImageOnError(this);'></img>";
        container_expand_legend_grafic.setAttribute("load", true);
        container_expand_legend_grafic.classList.toggle("hidden");
        resize_img_icon.innerHTML =
          '<i class="fas fa-angle-up" aria-hidden="true"></i>';
      }
    };

    img_legend.addEventListener("load", (event) => {
      /* This code seems to be replaced adaptToImage function in functions.js */
      if (img_legend.naturalHeight > 22) {
        capa_legend_div.removeChild(img_legend);
        capa_legend_div.append(resize_img_icon);
        capa_legend_div.title = "abrir leyenda";
        img_legend.src = "";
      }
    });

    capa_legend_div.onclick = () => {
      /*
            if(li.className === "capa list-group-item active"){
                li.className = "capa list-group-item"
            }else{li.className = "capa list-group-item active"}
            gestorMenu.muestraCapa(id_dom)*/
    };

    let capa_title_div = document.createElement("div");
    capa_title_div.className = "name-layer";
    capa_title_div.style = "align-self: center;";
    capa_title_div.onclick = function () {
      if (li.className === "capa list-group-item active") {
        //clase btn desactivada
        li.className = "capa list-group-item";
        //desactivar capa en mapa
        gestorMenu.muestraCapa(id_dom);
        //si tiene opcion a expand legend grafic y esta abierta cerrar.
        if (li.getElementsByClassName("legend-img").length == 0) {
          if (container_expand_legend_grafic.getAttribute("load") === "true")
            resize_img_icon.click();
        }
      } else {
        //activar capa
        li.className = "capa list-group-item active";
        gestorMenu.muestraCapa(id_dom);
        if (li.getElementsByClassName("legend-img").length == 0) {
          resize_img_icon.click();
        }
      }
    };

    let capa_description_a = document.createElement("a");
    capa_description_a.nombre = title;
    capa_description_a.href = "#";
    capa_description_a.innerHTML =
      "<span data-toggle2='tooltip' title='" +
      descripcion +
      "'>" +
      title +
      "</span>";
    capa_title_div.append(capa_description_a);

    let btn_zoom_layer = document.createElement("div");
    btn_zoom_layer.className = "zoom-layer-combobox";
    btn_zoom_layer.style = "align-self: center;";
    btn_zoom_layer.layername = title;
    btn_zoom_layer.innerHTML =
      "<i class='fas fa-search-plus' title='Zoom a capa'></i>";
    btn_zoom_layer.addEventListener("click", function () {
      if (li.className === "capa list-group-item") {
        li.className = "capa list-group-item active";
      }
      if (li.getElementsByClassName("legend-img").length == 0) {
        if (container_expand_legend_grafic.getAttribute("load") === "false")
          resize_img_icon.click();
      }
      zoomLayer(id_dom);
    });

    capa_info.append(capa_legend_div);
    capa_info.append(capa_title_div);
    capa_info.append(btn_zoom_layer);
    li.append(capa_info);
    li.append(container_expand_legend_grafic);
    return li;
  }

  modalEliminar(id, groupnamev, layerType) {
    let index_file = getIndexFileLayerbyID(id);
    let textname = addedLayers[index_file].name;
    let fileName = addedLayers[index_file].file_name;
    document.getElementById("modal_layer_del")?.remove();
    let modal = document.createElement("div");
    modal.id = "modal_layer_del";
    modal.className = "modal-file-delete";

    let close_icon = document.createElement("div");
    close_icon.style = "display:flex;flex-direction: row;padding-top:5px";
    let c_empty = document.createElement("div");
    c_empty.style.width = "90%";
    let c_close = document.createElement("div");
    c_close.style = "width:10%;text-align: center;cursor:pointer;";
    c_close.innerHTML =
      '<i style="color:grey;font-size:16px" class="fa fa-times" aria-hidden="true"></i>';
    c_close.onclick = function () {
      document.getElementById("modal_layer_del")?.remove();
    };
    close_icon.append(c_empty);
    close_icon.append(c_close);

    let modal_body = document.createElement("div");
    modal_body.className = "modal-file-delete-body";
    modal_body.innerHTML = `¿Eliminar Capa <strong>${textname}</strong>?`;
    modal_body.title = `¿Eliminar ${fileName}?`;

    let btn_container = document.createElement("div");
    btn_container.style =
      "display: flex; flex-direction: row;  justify-content: space-between;margin:0px 20px 10px 20px;";

    let btn_si = document.createElement("button");
    btn_si.className = "ag-btn ag-btn-danger";
    btn_si.innerHTML = "Eliminar";
    btn_si.onclick = function () {
      let section;
      addedLayers.forEach((lyr) => {
        if (lyr.id === id) {
          section = lyr.section;
        }
      });
      delFileItembyID(id);
      deleteLayerGeometry(id);
      document.getElementById("modal_layer_del")?.remove();

      //ElevationProfile
      if (typeof IElevationProfile !== "undefined" && IElevationProfile) {
        let perfilDelete = new IElevationProfile();
        if (id.includes(perfilDelete.namePrefixElevProfile)) {
          perfilDelete.removeElevationProfile(id);
          delFileItembyID(id); //Delete section/group from addedLayer
        }
      }
      updateNumberofLayers(section);
      showTotalNumberofLayers();
    };

    let btn_no = document.createElement("button");
    btn_no.className = "ag-btn ag-btn-primary";
    btn_no.innerHTML = "Cancelar";
    btn_no.onclick = function () {
      document.getElementById("modal_layer_del")?.remove();
    };

    btn_container.append(btn_si);
    btn_container.append(btn_no);

    modal.append(close_icon);
    modal.append(modal_body);
    modal.append(btn_container);
    document.body.appendChild(modal);

    enableNativeInteractions("#modal_layer_del", {
      draggable: {
        containment: "#mapa",
      },
    });
  }

  editFileLayerName(id) {
    let index = getIndexFileLayerbyID(id);
    addedLayers[index].laodingname = false;
    let id_i = "flc-" + id;
    let container = document.getElementById(id_i);
    let element = container.getElementsByClassName("file-layername")[0];
    let name = element.innerText;
    let nodo_hijo = container.getElementsByClassName("btn-group")[0];
    element.remove();

    let input_name = document.createElement("input");
    input_name.value = name;
    input_name.type = element.innerText;
    input_name.className = "input_newname form-control";
    input_name.style = "width: 75% !important;";
    input_name.id = "i-" + id;

    input_name.autocomplete = "off";
    input_name.style = "height:22px!important;";
    input_name.onblur = function (e) {
      if (!addedLayers[index].laodingname) {
        document.getElementById("i-" + id)?.remove();
        let a_new = document.createElement("div");
        a_new.className = "file-layername";
        a_new.innerHTML = `<a>${name}</a>`;
        container.insertBefore(a_new, nodo_hijo);
      }
    };

    input_name.onkeyup = function (e) {
      if (e.key === "Enter" || e.keyCode === 13) {
        addedLayers[index].laodingname = true;
        document.getElementById("i-" + id)?.remove();
        let a_new = document.createElement("div");
        a_new.className = "file-layername";
        a_new.title = this.value;
        editDomNameofFileLayerbyID(id, this.value);
        a_new.innerHTML = `<a>${this.value}</a>`;
        a_new.onclick = function () {
          clickGeometryLayer(id);
        };
        container.insertBefore(a_new, nodo_hijo);
      }
    };

    container.insertBefore(input_name, nodo_hijo);
    document.getElementById(`i-${id}`)?.focus();
  }

  editGroupName(id, oldName, newName) {
    clearSpecialChars(oldName);
    clearSpecialChars(newName);
    let el = document.getElementById(`${oldName}-a`);
    if (el) {
      el.innerText = newName;
      document.getElementById(`lista-${oldName}`).id = `lista-${newName}`;
      document.getElementById(oldName + "-panel-body").id =
        newName + "-panel-body";
    }
  }

  removeLayerFromGroup(groupname, textName, id, fileName, layer) {
    if (serviceItems[id].layers[textName].L_layer != null) {
      serviceItems[id].layers[textName].L_layer.remove();
    }

    let el = document.getElementById("srvcLyr-" + id + textName);
    if (el) {
      el.parentElement.remove();
      el.remove();
    }
    serviceItems[id].layersInMenu--;

    for (let i in serviceItems[id].layers) {
      if (serviceItems[id].layers[i] === textName) {
        serviceItems[id].layers.splice(i, 1);
        break;
      }
    }
    if (
      serviceItems[id].layersInMenu == 0 ||
      serviceItems[id].layersInMenu == undefined
    ) {
      this.removeLayersGroup(groupname);
    }
    showTotalNumberofLayers();
  }

  removeLayersGroup(groupname) {
    let el = document.getElementById(`lista-${clearSpecialChars(groupname)}`);
    if (el) {
      el.parentElement.remove();
      el.remove();
    }
  }

  addLayerToGroup(groupname, layerType, textName, id, fileName, layer) {
    // layer.name = encodeURI(layer.name);
    let newLayer = layer;
    newLayer.active = false;
    newLayer.L_layer = null;
    // let firstLayerAdded = false; // To simulate the click event
    if (serviceItems[id] != undefined) {
      serviceItems[id].layers[textName] = newLayer;
      serviceItems[id].layersInMenu++;
    } else {
      serviceItems[id] = {
        layers: [],
        layersInMenu: 0,
      };
      serviceItems[id].layers[textName] = newLayer;
      serviceItems[id].layersInMenu++;
      // firstLayerAdded = true; // Yes! First layer added
    }

    let groupnamev = clearSpecialChars(groupname);
    if (!fileLayerGroup.includes(groupname)) {
      fileLayerGroup.push(groupname);
    }
    let main = document.getElementById("lista-" + groupnamev);
    let id_options_container = "opt-c-" + id;
    if (!main) {
      this.addSection(groupname);
    }

    let content = document.getElementById(groupnamev + "-panel-body");
    let layer_container = document.createElement("div");
    layer_container.id = "fl-" + id;
    layer_container.className = "file-layer-container";

    let layer_item = document.createElement("div");
    layer_item.id = "srvcLyr-" + id + textName;
    layer_item.className = "file-layer";

    // add default layer options if not defined in layer definition ASAP
    if (!layer.version) {
      layer.version = "1.3.0";
    }

    //console.log(layer);

    if (!layer.featureInfoFormat) {
      layer.featureInfoFormat = "application/json";
    }

    if (!layer.legend) {
      layer.legend =
        layer.host +
        "?service=WMS&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=" +
        layer.name;
    } // maybe this should be implemented within layer definition, not in menu methods

    let imageFormats = ["png", "jpg", "gif", "webp", "svg", "bmp", "ico"],
      notLegendFromFile = !imageFormats.some((imgFormat) =>
        layer.legend.includes("." + imgFormat),
      );

    if (notLegendFromFile) {
      layer.legend +=
        _LEGEND_PARAMS + _LEGEND_OPTIONS + "forceTitles:off;forceLabels:off;";
    }

    let img_icon = document.createElement("div");
    img_icon.className = "loadservice-layer-img";
    img_icon.innerHTML = `<img loading="lazy" src="${layer.legend}" onerror='showImageOnError(this);' onload='adaptToImage(this.parentNode)'>`;
    img_icon.onclick = function () {
      clickWMSLayer(layer, layer_item, fileName);
    };

    let layer_name = document.createElement("div");
    layer_name.className = "file-layername";
    let capitalizedTitle =
      layer.title[0].toUpperCase() + layer.title.slice(1).toLowerCase();
    layer_name.innerHTML = "<a>" + capitalizedTitle + "</a>";
    layer_name.title = fileName;
    layer_name.onclick = function () {
      clickWMSLayer(layer, layer_item, fileName);
      // layer_item.classList.toggle("active");
      // if (!layer.active) {
      //   layer.L_layer = L.tileLayer
      //     .wms(layer.host, {
      //       layers: layer.name,
      //       format: "image/png",
      //       transparent: true,
      //     })
      //     .addTo(mapa);
      //   layer.active = true;

      //   gestorMenu.layersDataForWfs[layer.name] = {
      //     name: layer.name,
      //     section: layer.title,
      //     host: layer.host,
      //   };
      // } else {
      //   mapa.removeLayer(layer.L_layer);
      //   layer.active = false;
      // }
    };

    let zoom_button = document.createElement("div");
    zoom_button.className = "loadservice-layer-img";
    zoom_button.innerHTML = `<i class="fas fa-search-plus" title="Zoom a capa"></i>`;
    zoom_button.onclick = function () {
      clickWMSLayer(layer, layer_item, fileName);
      let bounds = [
        [layer.maxy, layer.maxx],
        [layer.miny, layer.minx],
      ];
      mapa.fitBounds(bounds);
    };

    layer_item.append(img_icon);
    layer_item.append(layer_name);
    layer_item.append(zoom_button);
    layer_container.append(layer_item);
    content.appendChild(layer_container);

    // Open the tab

    if (serviceItems[id].layersInMenu == 1)
      document.getElementById(`${groupnamev}-a`)?.click();
    addCounterForSection(groupname, layerType);
  }

  addButton({
    id = "custom-btn",
    location = "top",
    text = "A custom button",
    link = "#",
    title = "A custom button",
  }) {
    let btn = document.getElementById(id);

    if (!btn) {
      let btnHtml = `<li id="${id}" onclick="window.open('${link}', '_blank');" class="list-group-item menu-button" style="cursor: pointer; padding: 10px 1px;"><div class="capa-title"><div class="name-layer" style="align-self: center;"><a href="#"><span data-toggle2="tooltip" title="${title}">${text}</span></a></div><div class="zoom-layer" style="align-self: center;"><i class="fas fa-external-link" title="Abrir link"></i></div></div></li>`;

      let menuItems = document.getElementById("sidebar");
      if (location === "top") {
        const searchBar = document.getElementById("searchForm");
        searchBar.insertAdjacentHTML("afterend", btnHtml); // It is removed after searching a layer in the search layer form
      }
      if (location === "bottom") {
        menuItems.insertAdjacentHTML("beforend", btnHtml);
      }
    }
  }

  removeButton(id) {
    let btn = document.getElementById(id);
    if (btn) {
      btn.remove();
    }
  }
}

class Geometry {
  constructor() {
    this._types = [
      "Geometry",
      "Point",
      "MultiPoint",
      "LineString",
      "MultilineString",
      "Polygon",
      "MultiPolygon",
    ];
  }

  isValidType(geom) {
    let match = this._types.filter((type) => type === geom);
    return match ? true : false;
  }
}

/******************************************
CAPTURAR FECHA DE IMAGEN SATELITAL
******************************************/
class Fechaimagen {
  constructor(lat, long, zoom) {
    this.lat = lat;
    this.long = long;
    this.zoom = zoom;
  }

  get area() {
    return this.getFechaImagen();
  }

  getFechaImagen() {
    let picMdata = "",
      id = "",
      esriUrl =
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/",
      outFields = [
        "SRC_RES",
        "SRC_ACC",
        "SRC_DESC",
        "MinMapLevel",
        "MaxMapLevel",
        "NICE_NAME",
        "SRC_DATE2",
        "NICE_DESC",
      ],
      // available outFields : OBJECTID,SRC_DATE,SRC_RES,SRC_ACC,SAMP_RES,SRC_DESC,MinMapLevel,MaxMapLevel,NICE_NAME,DrawOrder,SRC_DATE2,NICE_DESC,Shape_Length,Shape_Area
      x = (this.long * 20037508.34) / 180,
      y =
        Math.log(Math.tan(((90 + parseFloat(this.lat)) * Math.PI) / 360)) /
        (Math.PI / 180),
      metadataIndex = {
        19: 9,
        18: 10,
        17: 11,
        16: 12,
        15: 13,
        14: 14,
        13: 15,
        12: 16,
      },
      sensorData = {
        WV01: {
          name: "WorldView-1 (COSPAR: 2007-041A)",
          link: "https://en.wikipedia.org/wiki/WorldView-1",
        },
        WV02: {
          name: "WorldView-2 (COSPAR: 2009-055A)",
          link: "https://www.maxar.com/constellation",
        },
        WV03: {
          name: "WorldView-3 (COSPAR: 2014-048A)",
          link: "http://worldview3.digitalglobe.com/",
        },
        WV04: {
          name: "WorldView-4 (COSPAR: 2016-067A)",
          link: "https://resources.maxar.com/data-sheets/worldview-4/",
        },
        GE01: {
          name: "GeoEye-1 (COSPAR: 2008-042A)",
          link: "https://en.wikipedia.org/wiki/GeoEye-1",
        },
        PNOA: {
          name: "Plan Nacional de Ortofotografía Aérea",
          link: "https://pnoa.ign.es/",
        },
        "NYS ITS GIS Orthos": {
          name: "Ortofotos del Estado de Nueva York",
          link: "https://orthos.dhses.ny.gov/",
        },
        "Madrid Orthos": {
          name: "Ortofoto rápida 2019 de Madrid",
          link: "https://geoportal.madrid.es/IDEAM_WBGEOPORTAL/dataset.iam?id=f44997dd-a1a9-11ea-a9ae-ecb1d753f6e8",
        },
      },
      providerData = {
        Maxar: { name: "Maxar", link: "https://www.maxar.com" },
        "Ayuntamiento de Madrid": {
          name: "IDE Ayuntamiento de Madrid",
          link: "https://www.comunidad.madrid/servicios/mapas/geoportal-comunidad-madrid",
        },
      };

    y = (y * 20037508.34) / 180;
    id = metadataIndex[this.zoom];
    esriUrl += `${id}/query?f=json&returnGeometry=false&spatialRel=esriSpatialRelIntersects&geometry=%7B%22xmin%22%3A${x}%2C%22ymin%22%3A${y}%2C%22xmax%22%3A${x}%2C%22ymax%22%3A${y}%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%7D&geometryType=esriGeometryEnvelope&inSR=102100&outFields=${outFields}&outSR=102100`;

    try {
      const request = new XMLHttpRequest();
      request.open("GET", esriUrl, false);
      request.send();
      if (request.status >= 200 && request.status < 300) {
        const data = JSON.parse(request.responseText);
        let md = "";
        if (data.features && data.features.length) {
          md = data.features[0].attributes;
          picMdata = {
            date: new Date(md.SRC_DATE2).toLocaleString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            resolution: md.SRC_RES,
            accuracy: md.SRC_ACC,
            sensor: sensorData[md.SRC_DESC]
              ? `<a href="${sensorData[md.SRC_DESC].link}" target="_blank">${
                  sensorData[md.SRC_DESC].name
                }</a>`
              : md.SRC_DESC,
            provider: providerData[md.NICE_DESC]
              ? `<a href="${providerData[md.NICE_DESC].link}" target="_blank">${
                  providerData[md.NICE_DESC].name
                }</a>`
              : md.NICE_DESC,
            sensor_texto: sensorData[md.SRC_DESC].name,
            provider_texto: providerData[md.NICE_DESC].name,
            product: md.NICE_NAME,
            minZoom: md.MinMapLevel,
            maxZoom: md.MaxMapLevel,
          };
        }
      }
    } catch (error) {
      console.warn("Unable to retrieve image metadata:", error);
    }

    return picMdata;
  }
}
