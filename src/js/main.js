import * as modules from './modules/modules.js';

// instance of BaseLayer class
//let argenmapLayer = new modules.newmap.BaseLayer();

// accessing baselayer method
//console.log(argenmapLayer.name);

let TESTargenmapLayer = new modules.newmap.Raster();
TESTargenmapLayer.type = "soy raster";
TESTargenmapLayer.setOpacity("mucha opacidad")
console.log(TESTargenmapLayer);

// let contourLines = modules.process.Contour(); 