class Data {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
  add() {}
  remove() {}
}
/* OGC Services */
class ogcService extends Data {
  constructor(id, name, url, bbox, license, abstract, version) {
    super(id, name);
    this.url = url;
    this.bbox = bbox;
    this.license = license;
    this.abstract = abstract;
    this.version = version;
  }
}
class wmsSource extends ogcService {
  constructor(id, name, url, bbox, license, abstract, version, layers) {
    super(id, name, url, bbox, license, abstract, version);
    this.layers = layers;
  }
  getMap(){}
  getFeatureInfo(){}
}
class wmtsSource extends ogcService {
    constructor(id, name, url, bbox, license, abstract, version, layers) {
      super(id, name, url, bbox, license, abstract, version);
      this.layers = layers;
    }
    getTile(){}
}
/* Vector files formats */
class FeatureCollection extends Data {
    constructor(id, name, url, bbox, license, abstract, layers) {
      super(id, name);
      this.url = url;
      this.bbox = bbox;
      this.license = license;
      this.abstract = abstract;
      this.layers = layers;
    }
  }