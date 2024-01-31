class ZoomLevel {
    constructor(zoomLevel) {
        this._zoom = zoomLevel;
        this.createComponent();
    }

    set zoom(zoomLevel) {
        this._zoom = zoomLevel;
        this.updateZoomLevel();
    }

    getTemplate() {
        const zoomLevel = document.createElement('div');
        zoomLevel.id = 'zoom-level';
        zoomLevel.title = 'Zoom';
        zoomLevel.className = 'leaflet-bar leaflet-control';

        const iconContainer = document.createElement('a');
        iconContainer.id = 'icon-container';

        const zoomIcon = document.createElement('i');
        zoomIcon.classList = 'fa fa-search-plus';
        zoomIcon.setAttribute('aria-hidden', 'true');

        const valueContainer = document.createElement('a');
        valueContainer.id = 'zoom-container';

        const zoomValue = document.createElement('p');
        zoomValue.id = 'zoom-value';

        iconContainer.appendChild(zoomIcon);
        valueContainer.appendChild(zoomValue);
        zoomLevel.appendChild(iconContainer);
        zoomLevel.appendChild(valueContainer);

        return zoomLevel;
    }

    createComponent() {
        let zoom = this.getTemplate();
        L.Control.zoomLevel = L.Control.extend({
            onAdd: function (map) {
                return zoom;
            }
        });
        L.control.zoomLevel = function (opts) {
            return new L.Control.zoomLevel(opts);
        }
        L.control.zoomLevel({ position: 'bottomleft' }).addTo(mapa);

        this._zoomLevelDomElement = document.getElementById('zoom-value');
        this._zoomLevelDomElement.style.margin = 0;

        this.updateZoomLevel();
    }

    updateZoomLevel() {
        this._zoomLevelDomElement.innerHTML = `<b>${this._zoom}</b>`;
    }
}
