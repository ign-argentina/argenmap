const zoomTemplate = `
    <div class="center-flex" id="zoom-level" title="Zoom" data-html2canvas-ignore="true">
        <div class="center-flex" id="icon-container">
            <i class="fa fa-search" aria-hidden="true"></i>
        </div>
        <div class="center-flex" id="zoom-container">
            <p id="zoom-value"></p>
        </div>
    </div>
`;

class ZoomLevel {
    constructor(zoomLevel) {
        this._zoom = zoomLevel;
        this.createComponent();
    }

    set zoom(zoomLevel) {
        this._zoom = zoomLevel;
        this.updateZoomLevel();
    }

    createComponent() {
        const elem = document.createElement('div');
        elem.innerHTML = zoomTemplate;
        document.getElementById('mapa').appendChild(elem);

        this._zoomLevelDomElement = document.getElementById('zoom-value');
        this._zoomLevelDomElement.style.margin = 0;

        this.updateZoomLevel();
    }

    updateZoomLevel() {
        this._zoomLevelDomElement.innerHTML = `<b>${this._zoom}</b>`;
    }
}
