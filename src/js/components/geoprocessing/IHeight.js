"use strict";

class IHeight {
  constructor({
    name = "Height",
    namePrefix = "height_",
    serviceURL = "http://somesite.com/ows?service=WPS&version=1.0.0",
    serviceLayer = "sampleDEMLayer"
  }) {
    this.name = name;
    this.namePrefix = namePrefix;
    this.serviceURL = serviceURL;
    this.serviceLayer = serviceLayer;
    this._process = new GeoserviceFactory.WaterRise(
            this.serviceURL,
            this.serviceLayer
          );
    this.height = null;
    this.result = null;
  }
  exportResult(format) {}
  getFields() {
    return this._process.getFields();
  }
}
