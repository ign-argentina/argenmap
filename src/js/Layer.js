class Layer {
    constructor(name, title, keywords, icon) {
        this._id = null,
        this.name = name,
        this.title = title,
        this.keywords = keywords,
        this.icon = icon
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

class BaseLayer extends Layer {
    constructor(theme, url) {
        super(),
        this.theme = theme,
        this.url = url;
    }
    addTo(map) {
        console.log("added");
    }
    setOverlay(layer) {
        console.log("overlay set");
    }
    showLegend() {
        console.log("legend shown");
    }
}

class OverlayLayer extends Layer {
    constructor(zIndex, opacity) {
        super()
        this.zIndex = zIndex;
        this.opacity = opacity;
    }
    addTo(map) { }
    getBounds() { }
    bringForward() { }
    sendBackward() { }
    setOpacity() { }
    exportLayer() { }
}

class LayerGroup extends Layer {
    constructor(layers, name) {
        this.layers = layers
    }
    addTo(map) {
        this.layers.forEach(layer => {
            layer.addTo();
        });
    }
    addLayer() { }
    removeLayer() { }
}

class RasterLayer extends OverlayLayer {
    constructor(bands) {
        super()
        this.bands = bands;
    }
    exportLayer() {
        console.log("export")
    }
}
class VectorLayer extends OverlayLayer {
    constructor(properties, srs, style, color, type) {
        super()
        this.properties = properties,
        this.projection = srs,
        this.style = style;
        this.color = color;
        this.opacity = 1;
        this.type = type
    }
    
    exportLayer() { }

    //downloadGeoJSON()
    //getGeoJSON()

    addProperty(propertyName, propertyValue) {
        this.properties[propertyName] = propertyValue;
    }
    removeProperty(propertyName) {
        delete this.properties[propertyName];
    }
    setStyle(newStyle) {
        this.style = newStyle;
    }
    setOpacity(opacity) {
        this.opacity = opacity;
    }
    setColor(color) {
        this.color = color;
    }
}

class LayerStyle {
    constructor(options) {
        this.defaultStyle = {
            "icon": {
                "options": {
                    "iconUrl": "src/styles/images/marker.png",
                    "shadowUrl": "src/styles/images/marker-shadow.png",
                    "popupAnchor": [0, -41],
                    "iconSize": [25, 41],
                    "iconAnchor": [12.5, 41]
                }
            },
            "color": "#ff7800",
            "weight": "8",
            "opacity": "0.35",
            "fill": true,
            "fillColor": "#613583",
            "fillOpacity": "0.65",
            "clickable": true,
            "dashArray": "16",
            "lineJoin": "miter",
            "stroke": true,
            "clickable": true,
            "lineCap": "butt",
            "radius": 132352.86427154695,
            "metric": true,
            "zIndexOffset": 2000,
            "repeatMode": false
        },
            this.icon = options.icon ?? this.defaultStyle.icon,
            this.color = options.color ?? this.defaultStyle.color,
            this.weight = options.weight ?? this.defaultStyle.weight,
            this.opacity = options.opacity ?? this.defaultStyle.opacity,
            this.fill = options.fill ?? this.defaultStyle.fill,
            this.fillColor = options.fillColor ?? this.defaultStyle.fillColor,
            this.fillOpacity = options.fillOpacity ?? this.defaultStyle.fillOpacity,
            this.clickable = options.clickable ?? this.defaultStyle.clickable,
            this.dashArray = options.dashArray ?? this.defaultStyle.dashArray,
            this.lineJoin = options.lineJoin ?? this.defaultStyle.lineJoin,
            this.stroke = options.stroke ?? this.defaultStyle.stroke,
            this.clickable = options.clickable ?? this.defaultStyle.clickable,
            this.lineCap = options.lineCap ?? this.defaultStyle.lineCap,
            this.radius = options.radius ?? this.defaultStyle.radius,
            this.metric = options.metric ?? this.defaultStyle.metric,
            this.zIndexOffset = options.zIndexOffset ?? this.defaultStyle.zIndexOffset,
            this.repeatMode = options.repeatMode ?? this.defaultStyle.repeatMode
    }
    resetStyle() {
        // this = Object.assign(this.defaultStyle);
    }
}