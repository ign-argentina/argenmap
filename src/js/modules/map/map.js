class Layer {
    constructor(id, name, title, attribution, icon, weight, keywords) {
        this.id = id,
        this.name = name ?? "A sample layer",
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

//VECTOR--------------------
export class Vector extends Layer {
    constructor(type) {
        super();
        this.type = type;
    }
}

class VectorFile extends Vector {
    constructor() {
        super();
    }
}

class WFSLayer extends Vector {
    constructor() {
        super();
    }
}



//RASTER--------------------
export class Raster extends Layer {
    constructor(type) {
        super();
        this.type = type;
        this.opacity = null;
    }

    setOpacity(opacity) {
        this.opacity = opacity;
    }
}
class TileLayer extends Raster {
    constructor() {
        super();
    }
}
class RasterFile extends Raster {
    constructor() {
        super();
    }
}
class WMTSLayer extends Raster {
    constructor() {
        super();
    }
}
class WMSLayer extends Raster {
    constructor() {
        super();
    }

    get featureInfo() {
    }
}


//OGCService-----------------
class OGCService   {
    constructor(id) {
        this.id = id;
    }

    getCapabilities(url) {
    }
}
class Source extends OGCService {
    constructor() {
        super();
    }

}


//BASE LAYER-----------------
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