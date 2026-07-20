/**
 * File Layer handles KML, JSON, GeoJson, WKT, TXT, GPX and Zip (shapefile) file types from an input file
 * Used libraries:
 * · Shpafiles: https://github.com/calvinmetcalf/shapefile-js
 * · KML, WKT, TOPOJSON, GPX: https://github.com/mapbox/leaflet-omnivore
 * · GeoJSON: Leaflet
 **/

class FileLayer {
  constructor() {
    this.file = null;
    this.fileName = null;
    this.format = null;
    this.layerData = null;
    this.layerType = null;
    this.fileSize = null;
    this.layer = null;
    this.id = null;
  }

  getFileName() {
    return this.fileName;
  }

  getLayer() {
    return this.layer;
  }

  getRawLayerData() {
    return this.layerData;
  }

  getFormat() {
    return this.format;
  }

  getLayerType() {
    return this.layerType;
  }

  getId() {
    return this.id;
  }

  getGeoJSON() {
    // we assume that zip is the format for shapefile
    if (this.format == "zip") {
      return this.layer;
    }

    return this.layer.toGeoJSON();
  }

  getFileSize(measure) {
    if (measure && typeof measure == "string") {
      if (measure == "kb") {
        return this.fileSize / 1000;
      }
    }
    return this.fileSize;
  }

  async handleFile(file) {
    if (file == undefined || file == null) {
      throw new Error("Ningún archivo seleccionado");
    }

    const sourceUrl = URL.createObjectURL(file);
    try {
      this.file = file;
      return await this.handleUrl(
        sourceUrl,
        file.name,
        file.name.split(".").pop(),
        file.size,
      );
    } finally {
      URL.revokeObjectURL(sourceUrl);
    }
  }

  async handleUrl(url, fileName = null, format = null, fileSize = null) {
    if (url == undefined || url == null || url === "") {
      throw new Error("Ningún archivo seleccionado");
    }

    this.file = null;
    this.fileName = fileName || this.getNameFromUrl(url);
    this.format = (format || this.getFormatFromFileName(this.fileName || url)).toLowerCase();
    this.fileSize = fileSize || null;
    this.id = this.format + ("" + new Date().getTime()).substr(8);

    const response = await fetch(url);
    const responseType = this.getResponseType(this.format);
    const data = await this.handleResponse(response, responseType);
    const result = await this.getGeojson(data);
    this.layer = result;
    return result;
  }

  /**
   * Converts different data to the expected format and returns a geoJSON
   * @param {String} data from response
   * @returns a geoJSON object
   */
  getGeojson(data) {
    return new Promise((resolve, reject) => {
      const leafletGlobal =
        typeof window !== "undefined" && window.L ? window.L : typeof L !== "undefined" ? L : null;

      if (!leafletGlobal) {
        reject(
          "Leaflet no está disponible para procesar este archivo. Revise la carga de la librería en la página.",
        );
        return;
      }

      let layer = null;
      switch (this.format) {
        case "zip":
          // Its necessary return the promise, only in this case because shp resolves in a promise
          this.layerType = "shapefile";
          return shp(data)
            .then((parsedLayer) => {
              resolve(parsedLayer);
            })
            .catch(() => {
              reject(
                `El archivo ${this.fileName} no pudo ser procesado, verifíquelo e intente nuevamente.`,
              );
            });
          break;
        case "json":
        case "geojson":
          if (data.type == "Topology") {
            this.layerType = "topoJSON";
            layer = omnivore.topojson.parse(data);
          } else {
            this.layerType = "geoJSON";
            layer = leafletGlobal.geoJSON(data);
          }
          break;
        case "kml":
          this.layerType = "kml";
          layer = omnivore.kml.parse(data);
          break;
        case "txt":
        case "wkt":
          this.layerType = "wkt";
          layer = omnivore.wkt.parse(data);
          break;
        case "gpx":
          this.layerType = "gpx";
          layer = omnivore.gpx.parse(data);
          break;
        default:
          break;
      }

      // Se comprueba que layer haya sido resuelto y que disponga de layers
      if (layer == null || Object.keys(layer._layers).length == 0) {
        reject(
          `El archivo ${this.fileName} no pudo ser procesado, verifíquelo e intente nuevamente.`,
        );
      } else {
        resolve(layer);
      }
    });
  }

  /**
   * Convert the body text of a response to the desired format type (json, text, arrayBuffer)
   * @param {*} response
   * @param {String} responseType
   * @returns promise which resolves with the result of parsing the body text
   */
  handleResponse(response, responseType) {
    return new Promise((resolve, reject) => {
      switch (responseType) {
        case "text":
          response.text().then((data) => {
            this.layerData = data;
            resolve(data);
          });
          break;
        case "json":
          response.json().then((data) => {
            this.layerData = data;
            resolve(data);
          });
          break;
        case "arrayBuffer":
          response.arrayBuffer().then((data) => {
            this.layerData = data;
            resolve(data);
          });
          break;
        default:
          reject("invalid file");
      }
    });
  }

  getResponseType(format = this.format) {
    /**
     * An object to retrieve the type of response, it is used to parse the response of a fetch
     */
    let responseType = {
      txt: "text",
      wkt: "text",
      gpx: "text",
      kml: "text",
      json: "json",
      geojson: "json",
      zip: "arrayBuffer",
    };

    return responseType[format];
  }

  getFormatFromFileName(fileNameOrUrl) {
    if (!fileNameOrUrl) return null;

    const sanitizedName = String(fileNameOrUrl).split("?")[0].split("#")[0];
    const extension = sanitizedName.split(".").pop();
    if (!extension) return null;

    return extension.toLowerCase();
  }

  getNameFromUrl(url) {
    if (!url) return null;

    try {
      const parsedUrl = new URL(url, window.location.href);
      const endSegment = parsedUrl.pathname.split("/").filter(Boolean).pop();
      return endSegment || parsedUrl.pathname || "archivo";
    } catch (error) {
      return String(url).split("/").filter(Boolean).pop() || "archivo";
    }
  }
}
