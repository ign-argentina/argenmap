// -- Plugins Control
var plugins = new Array("loadGeojson", "loadWms");

function deg_to_dms (deg) {
   var d = Math.floor (deg);
   var minfloat = (deg-d)*60;
   var m = Math.floor(minfloat);
   var secfloat = (minfloat-m)*60;
   var s = Math.round(secfloat);
   // After rounding, the seconds might become 60. These two
   // if-tests are not necessary if no rounding is done.
   if (s==60) {
     m++;
     s=0;
   }
   if (m==60) {
     d++;
     m=0;
   }
   
   d += "";
   d = d.padStart(2, '0');
   m += "";
   m = m.padStart(2, '0');
   s += "";
   s = s.padStart(2, '0');
   return ("" + d + "° " + m + "' " + s + "''");
}

function showImageOnError(image) {
	image.onerror = "";
    image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    return true;
}

function mainMenuSearch(e) {
    e.preventDefault();
    gestorMenu.setQuerySearch($("#q").val());
    gestorMenu.printMenu();
}

function clearString(s) {
	return s.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
}


function sanatizeString(s) {
	return clearString(s).replace(/ /g, '_');
}

/****** Enveloped functions ******/
function loadGeojson (url, layer) {
    if (typeof loadGeojsonTpl === 'function') {
        return loadGeojsonTpl(wmsUrl, layer);
    } else {
        console.warn("Function loadGeojsonTpl() do not exists. Please, define it.");
    }
}

function loadWms (callbackFunction, objLayer) {
    if (typeof callbackFunction === 'function') {
        return callbackFunction(objLayer);
    } else {
        console.warn("Function " + callbackFunction + "() do not exists. Please, define it.");
    }
}

function loadWmts (callbackFunction, objLayer) {
    if (typeof callbackFunction === 'function') {
        return callbackFunction(objLayer);
    } else {
        console.warn("Function " + callbackFunction + "() do not exists. Please, define it.");
    }
}

function loadMapaBase (tmsUrl, layer, attribution) {
    if (typeof loadMapaBaseTpl === 'function') {
        return loadMapaBaseTpl(tmsUrl, layer, attribution);
    } else {
        console.warn("Function loadMapaBaseTpl() do not exists. Please, define it.");
    }
}

function loadMapaBaseBing (bingKey, layer, attribution) {
    if (typeof loadMapaBaseBingTpl === 'function') {
        return loadMapaBaseBingTpl(bingKey, layer, attribution);
    } else {
        console.warn("Function loadMapaBaseBingTpl() do not exists. Please, define it.");
    }
}
