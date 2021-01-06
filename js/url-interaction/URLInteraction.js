'use strict';

//Param values
const ZOOM_LEVEL = 'zoom';
const LATITUDE = 'lat';
const LONGITUDE = 'lng';

//Default map values
//***Should be defined as global or as a separated module */
const DEFAULT_ZOOM_LEVEL = 4;
const DEFAULT_LATITUDE = -40;
const DEFAULT_LONGITUDE = -59;

class URLInteraction {

    constructor() {
        this._zoom = DEFAULT_ZOOM_LEVEL;
        this._latitude = DEFAULT_LATITUDE;
        this._longitude = DEFAULT_LONGITUDE;
        this._areParamsInUrl = false;

        const params = window.location.search;

        if (params) {
            this._areParamsInUrl = true;
            const paramsArray = params.slice(1).split('&');
            paramsArray.forEach(element => {
                const [param, value] = element.split('=');
                switch (param.toLowerCase()) {
                    case ZOOM_LEVEL: {
                        this._zoom = +value;
                    }
                    break;
                    case LATITUDE: {
                        this._latitude = +value;
                    }
                    break;
                    case LONGITUDE: {
                        this._longitude = +value;
                    }
                    break;
                }
            });
        }

        this.updateURL();
    }

    get url() {
        return window.location.href.toString();
    }

    get center() {
        return {
            latitude: this._latitude,
            longitude: this._longitude
        };
    }

    get zoom() {
        return this._zoom;
    }

    get areParamsInUrl() {
        return this._areParamsInUrl;
    }

    set center(coords) {
        this._latitude = coords.lat;
        this._longitude = coords.lng;
        this.updateURL();
    }

    set zoom(zoom) {
        this._zoom = zoom;
        this.updateURL();
    }

    updateURL() {
        const zoom = `${ZOOM_LEVEL}=${this._zoom}`;
        const lat = `${LATITUDE}=${this._latitude}`;
        const lng = `${LONGITUDE}=${this._longitude}`;
        window.history.replaceState(null, null, `?${zoom}&${lat}&${lng}`);
    }
}
