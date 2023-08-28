class Layer {
    constructor(id, name, title, attribution, icon, weight, keywords) {
        this.id = id,
            this.name = name ?? "lalo landa",
            this.title = title,
            this.attribution = attribution,
            this.icon = icon,
            this.weight = weight,
            this.keywords = keywords
    }

    addTo() { };
    remove() { };
    removeFrom() { };
    isActive() { };
}

export class BaseLayer extends Layer {
    constructor(url, theme) {
        super();
        this.url = url ?? "una url",
        this.theme = theme,
        this._overlay = null
    }

    set overlay(overlayLayer) {
        this.overlay = overlayLayer;
    };

    get layer() {
        /* linkear con L.TileLayer(pasarle como args los atributos de esta clase) */
    }

}