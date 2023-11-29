// L.tileLayer(url, options)

/* Options 
minZoom Number
maxZoom Number
subdomains String
errorTileUrl String
zoomOffset Number
tms Boolean
zoomReverse Boolean
detectRetina Boolean
crossOrigin Boolean
referrerPolicy Boolean 
*/

class Layer {
    constructor(name, title, keywords, icon) {
        this._id = null,
            this.name = name,
            this.title = title,
            this.keywords = keywords,
            this.icon = icon,
            this._layer = new L.Layer();
    }
    get id() {
        return this._id;
    }
    set id(name) {
        // checks if id exists in library
        this._id = name + Math.random();
    }
    addTo(map) {
        console.log("added to" + map)
    }
    isActive() { }
    remove() {
        console.log("removed")
    }
}

class BaseLayer {
    constructor(options) {
        this.opts = options,
            this.baseLayer = new L.TileLayer(this.opts.url, {
                attribution: this.opts.attribution,
                minZoom: this.opts.minZoom,
                maxZoom: this.opts.maxZoom,
                // subdomains: this.opts.subdomains,
                errorTileUrl: this.opts.errorTileUrl,
                zoomOffset: this.opts.zoomOffset,
                tms: this.opts.tms
            });
    }
    addTo(map) {
        this.baseLayer.addTo(map);
    }
    setOverlay(layer) {
        console.log("overlay set");
    }
    showLegend() {
        console.log("legend shown");
    }
}

let basemaps = {
    argenmap: {
        url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
        attribution: "IGN + OSM",
        minZoom: 0,
        maxZoom: 20,
        subdomains: ['a', 'b', 'c'],
        errorTileUrl: "https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/0/0/0.png",
        zoomOffset: null,
        tms: false
    }
}

// let argenmap_test = new BaseLayer(basemaps.argenmap);
// argenmap_test.addTo(mapa);