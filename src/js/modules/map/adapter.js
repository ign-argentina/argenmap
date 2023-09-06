const BASEMAPS = L.TileLayer.Provider.providers = {
    OpenStreetMap: {
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        options: {
            maxZoom: 19,
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        },
        variants: {
            Mapnik: {},
            DE: {
                url: 'https://tile.openstreetmap.de/{z}/{x}/{y}.png',
                options: {
                    maxZoom: 18
                }
            },
            France: {
                url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
                options: {
                    maxZoom: 20,
                    attribution: '&copy; OpenStreetMap France | {attribution.OpenStreetMap}'
                }
            }
        }
    },
    Esri: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/{variant}/MapServer/tile/{z}/{y}/{x}',
        options: {
            variant: 'World_Street_Map',
            attribution: 'Tiles &copy; Esri'
        },
        variants: {
            WorldImagery: {
                options: {
                    variant: 'World_Imagery',
                    attribution:
                        '{attribution.Esri} &mdash; ' +
                        'Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                }
            },
            WorldTerrain: {
                options: {
                    variant: 'World_Terrain_Base',
                    maxZoom: 13,
                    attribution:
                        '{attribution.Esri} &mdash; ' +
                        'Source: USGS, Esri, TANA, DeLorme, and NPS'
                }
            }
        }
    }
};

// Define the interfaces for the map libraries
class MapLibrary {
    create() { }
    setMarker(lat, lng) { }
    centerAt(lat, lng) { }
    geoJSON(lat, lng) { }
    tileLayer(url, options) { }
    // Add more methods as needed
    // Add method for fetching dependencies (js, css, etc)
}

// Implement the Leaflet library
class LeafletMap extends MapLibrary {
    constructor(containerId, options = { center, zoom }) {
        this.#id = containerId,
        this.#zoom = options.zoom ?? 0,
        this.#center = options.center ?? [0, 0]
    }
    create() {
        // Implementation for creating a Leaflet map
        try {
            let map = L.map(this.#id);
            map.setView(this.#center, this.#zoom);
        } catch (error) {
            window.alert(error);
        }
    }

    setMarker(lat, lng) {
        // Implementation for adding a marker using Leaflet
    }

    centerAt(lat, lng) {

    }

    GeoJSON(lat, lng) {

    }

    tileLayer(url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', options = {
            maxZoom: maxZoom ?? 19,
            attribution: attribution ?? '© OpenStreetMap'
    }) {
        let tileLayer = L.tileLayer(url, options).addTo(map);
    }
}

// Implement the Maplibre library
/* class MaplibreMap extends MapLibrary {
    create(containerId) {
        // Implementation for creating a Maplibre map
    }

    setMarker(lat, lng) {
        // Implementation for adding a marker using Maplibre
    }
} */

// Implement the Cesium library
/* class CesiumMap extends MapLibrary {
    create(containerId) {
        // Implementation for creating a Cesium map
    }

    setMarker(lat, lng) {
        // Implementation for adding a marker using Cesium
    }
} */

// Implement the OpenLayers library
/* class OpenLayersMap extends MapLibrary {
    create(containerId) {
        // Implementation for creating an OpenLayers map
    }

    setMarker(lat, lng) {
        // Implementation for adding a marker using OpenLayers
    }
} */

// Adapter class to switch between different map libraries
class MapAdapter {
    constructor(library) {
        this.library = library;
    }

    create(containerId) {
        return this.library.create(containerId);
    }

    setMarker(lat, lng) {
        return this.library.setMarker(lat, lng);
    }
}

// Usage
const selectedLibrary = new LeafletMap(); // Change this to the desired library
const mapAdapter = new MapAdapter(selectedLibrary);

const containerId = "mapContainer";
const map = mapAdapter.create(containerId);
mapAdapter.setMarker(37.7749, -122.4194);
