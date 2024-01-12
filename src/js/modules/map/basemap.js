const ARGENMAP_BASEMAP_URL = "https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{-y}.png"

console.clear()
console.info("módulo cargado")

class Layer {
    constructor(id, name, title, attribution, icon) {
        this.id = id,
        this.name = name ?? "A sample layer",
        this.title = title,
        this.icon = icon
    }    
    addTo() { };
    remove() { };
    removeFrom() { };
    isActive() { };
}

/* Base Layer */
export class BaseLayer extends Layer {
    constructor(url, theme) {
        super();
        this.url = url ?? ARGENMAP_BASEMAP_URL,
        this.theme = theme,
        this._overlay = null
    }

    set overlay(overlayLayer) {
        this.overlay = overlayLayer;
    };

    get legend() {
        /* linkear con L.TileLayer(pasarle como args los atributos de esta clase) */
    }

}

