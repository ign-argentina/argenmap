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
            CH: {
                url: 'https://tile.osm.ch/switzerland/{z}/{x}/{y}.png',
                options: {
                    maxZoom: 18,
                    bounds: [[45, 5], [48, 11]]
                }
            },
            France: {
                url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
                options: {
                    maxZoom: 20,
                    attribution: '&copy; OpenStreetMap France | {attribution.OpenStreetMap}'
                }
            },
            HOT: {
                url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
                options: {
                    attribution:
                        '{attribution.OpenStreetMap}, ' +
                        'Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> ' +
                        'hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
                }
            },
            BZH: {
                url: 'https://tile.openstreetmap.bzh/br/{z}/{x}/{y}.png',
                options: {
                    attribution: '{attribution.OpenStreetMap}, Tiles courtesy of <a href="http://www.openstreetmap.bzh/" target="_blank">Breton OpenStreetMap Team</a>',
                    bounds: [[46.2, -5.5], [50, 0.7]]
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
            WorldStreetMap: {
                options: {
                    attribution:
                        '{attribution.Esri} &mdash; ' +
                        'Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
                }
            },
            DeLorme: {
                options: {
                    variant: 'Specialty/DeLorme_World_Base_Map',
                    minZoom: 1,
                    maxZoom: 11,
                    attribution: '{attribution.Esri} &mdash; Copyright: &copy;2012 DeLorme'
                }
            },
            WorldTopoMap: {
                options: {
                    variant: 'World_Topo_Map',
                    attribution:
                        '{attribution.Esri} &mdash; ' +
                        'Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
                }
            },
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
            },
            WorldShadedRelief: {
                options: {
                    variant: 'World_Shaded_Relief',
                    maxZoom: 13,
                    attribution: '{attribution.Esri} &mdash; Source: Esri'
                }
            },
            WorldPhysical: {
                options: {
                    variant: 'World_Physical_Map',
                    maxZoom: 8,
                    attribution: '{attribution.Esri} &mdash; Source: US National Park Service'
                }
            },
            OceanBasemap: {
                options: {
                    variant: 'Ocean/World_Ocean_Base',
                    maxZoom: 13,
                    attribution: '{attribution.Esri} &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri'
                }
            }
        }
    },
    AzureMaps: {
        url: 
            'https://atlas.microsoft.com/map/tile?api-version={apiVersion}'+
            '&tilesetId={variant}&x={x}&y={y}&zoom={z}&language={language}'+
            '&subscription-key={subscriptionKey}',
        options: {
            attribution: 'See https://docs.microsoft.com/en-us/rest/api/maps/render-v2/get-map-tile for details.',
            apiVersion: '2.0',
            variant: 'microsoft.imagery',
            subscriptionKey: '<insert your subscription key here>',
            language: 'en-US',
        },
        variants: {
            MicrosoftImagery: 'microsoft.imagery',
            MicrosoftBaseDarkGrey: 'microsoft.base.darkgrey',
            MicrosoftBaseRoad: 'microsoft.base.road',
            MicrosoftBaseHybridRoad: 'microsoft.base.hybrid.road',
            MicrosoftTerraMain: 'microsoft.terra.main',
            MicrosoftWeatherInfraredMain: {
                url: 
                'https://atlas.microsoft.com/map/tile?api-version={apiVersion}'+
                '&tilesetId={variant}&x={x}&y={y}&zoom={z}'+
                '&timeStamp={timeStamp}&language={language}' +
                '&subscription-key={subscriptionKey}',
                options: {
                    timeStamp: '2021-05-08T09:03:00Z',
                    attribution: 'See https://docs.microsoft.com/en-us/rest/api/maps/render-v2/get-map-tile#uri-parameters for details.',
                    variant: 'microsoft.weather.infrared.main',
                },
            },
            MicrosoftWeatherRadarMain: {
                url: 
                'https://atlas.microsoft.com/map/tile?api-version={apiVersion}'+
                '&tilesetId={variant}&x={x}&y={y}&zoom={z}'+
                '&timeStamp={timeStamp}&language={language}' +
                '&subscription-key={subscriptionKey}',
                options: {
                    timeStamp: '2021-05-08T09:03:00Z',
                    attribution: 'See https://docs.microsoft.com/en-us/rest/api/maps/render-v2/get-map-tile#uri-parameters for details.',
                    variant: 'microsoft.weather.radar.main',
                },
            }
        },
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
