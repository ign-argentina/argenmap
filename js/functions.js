// -- Plugins Control
var plugins = new Array("loadGeojson", "loadWms");

var allLayers = new Array();
function getGeoserver(host, servicio, seccion, peso, nombre, version, short_abstract) {
  const impresorGroup = new ImpresorGrupoHTML();
  const impresorItem = new ImpresorItemHTML();
  
    if (!$('#temp-menu').hasClass('temp')) { $('body').append('<div id="temp-menu" class="temp" style="display:none"></div>'); }
    // Load geoserver Capabilities, if success Create menu and append to DOM
    $('#temp-menu').load(host + '/ows?service=' + servicio + '&version=' + version + '&request=GetCapabilities', function () {
        var capability = $('#temp-menu').find("capability");
        var keywordHtml = $('#temp-menu').find("Keyword");
        var abstractHtml = $('#temp-menu').find("Abstract");
        var keyword = keywordHtml[0].innerText; // reads 1st keyword for filtering sections if needed
        var abstract = abstractHtml[0].innerText; // reads wms 1st abstract
        var capas_layer = $('layer', capability);
        var capas_info = $('layer', capas_layer);
    
        var items = new Array();
    
        // create an object with all layer info for each layer
        capas_info.each(function (index, b) {
            var i = $(this);
            var iName = $('name', i).html();
            var iTitle = $('title', i).html();
            var iBoundingBox = $('boundingbox', i);
            var iAbstract = $('abstract', i).html();
            var keywordsHTMLList = $('keywordlist', i).find("keyword");
            var keywords = [];
            $.each( keywordsHTMLList, function( i, el ) {
                keywords.push(el.innerText);
            });
            if (iBoundingBox[0].attributes.srs) {
                var iSrs = iBoundingBox[0].attributes.srs;
            } else {
                var iSrs = iBoundingBox[0].attributes.crs;
            }
            var iMaxY = iBoundingBox[0].attributes.maxy;
            var iMinY = iBoundingBox[0].attributes.miny;
            var iMinX = iBoundingBox[0].attributes.minx;
            var iMaxX = iBoundingBox[0].attributes.maxx;
                
            var capa = new Capa(iName, iTitle, iSrs.nodeValue, host, servicio, version, iMinX.nodeValue, iMaxX.nodeValue, iMinY.nodeValue, iMaxY.nodeValue);
            var item = new Item(capa.nombre, seccion+index, keywords, iAbstract, capa.titulo, capa);
            item.setImpresor(impresorItem);
            items.push(item);
        });
    
        var groupAux;
        try {
            var groupAux = new ItemGroup(nombre, seccion, peso, keyword, abstract, short_abstract, loadWms);
            groupAux.setImpresor(impresorGroup);
            groupAux.setObjDom(".nav.nav-sidebar");
            for (var i = 0; i < items.length; i++) {
                groupAux.setItem(items[i]);
            }
        }
        catch (err) {
                if (err.name == "ReferenceError") {
                    var groupAux = new ItemGroup(nombre, seccion, peso, "", "", short_abstract, null);
                    groupAux.setImpresor(impresorGroup);
                    groupAux.setObjDom(".nav.nav-sidebar");
                    for (var i = 0; i < items.length; i++) {
                    groupAux.setItem(items[i]);
                }
            }
        }

        gestorMenu.add(groupAux);
        
        getGeoserverCounter--;
        /*
        if (getGeoserverCounter == 0) { //Si ya cargó todas las capas solicitadas
            //Ocultar loading
            $(".loading").hide();
            //Imprimir menú
            gestorMenu.imprimir($(".nav.nav-sidebar"));
            //Agregar tooltip resumen
            $("[data-toggle2='tooltip']").tooltip({
                placement: "right",
                trigger: "hover",
                container: "body"
            });
        }
        */
        
        return;
    });
}


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
    image.src = "img/noimage.gif";
    return true;
}


/****** Enveloped functions ******/
function loadGeojson (url, layer) {
    return loadGeojsonTpl(wmsUrl, layer);
}

function loadWms (wmsUrl, layer) {
    return loadWmsTpl(wmsUrl, layer);
}

function loadMapaBase (tmsUrl, layer, attribution) {
    return loadMapaBaseTpl(tmsUrl, layer, attribution);
}

function loadMapaBaseBing (bingKey, layer, attribution) {
    return loadMapaBaseBingTpl(tmsUrl, layer, attribution);
}
