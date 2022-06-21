L.Control.MousePosition = L.Control.extend({
  options: {
    position: 'bottomleft',
    separator: ' : ',
    emptyString: 'Unavailable',
    lngFirst: false,
    numDigits: 6,
    lngFormatter: function(num) {
      var direction = (num < 0) ? 'O' : 'E';
      return deg_to_dms(Math.abs(num)) + direction; 
    },
    latFormatter: function(num) {
      var direction = (num < 0) ? 'S' : 'N';
      return deg_to_dms(Math.abs(num)) + direction; 
    },
    prefix: "",
  },

  onAdd: function (map) {
    this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
    // L.DomEvent.disableClickPropagation(this._container);
    map.on('mousemove', this._onMouseMove, this);
    this._container.innerHTML=this.options.emptyString;

    this._container.onclick = function(){
      if (L.Control.MousePosition.prototype.options.lngFormatter == undefined) {
        L.Control.MousePosition.prototype.options.lngFormatter = function(num) {
          var direction = (num < 0) ? 'O' : 'E';
          return deg_to_dms(Math.abs(num)) + direction; 
        }
        L.Control.MousePosition.prototype.options.latFormatter = function(num) {
          var direction = (num < 0) ? 'S' : 'N';
          return deg_to_dms(Math.abs(num)) + direction; 
        }
        document.getElementsByClassName('leaflet-control-mouseposition')[0].style.width = '142px';
      }else {
        document.getElementsByClassName('leaflet-control-mouseposition')[0].style.width = '128px';
        L.Control.MousePosition.prototype.options.lngFormatter = undefined;
        L.Control.MousePosition.prototype.options.latFormatter = undefined;
      }

      L.Control.MousePosition.prototype._onMouseMove
    };
    return this._container;
  },

  onRemove: function (map) {
    map.off('mousemove', this._onMouseMove)
  },

  _onMouseMove: function (e) {
    var lng = this.options.lngFormatter ? this.options.lngFormatter(e.latlng.lng) : L.Util.formatNum(e.latlng.lng, this.options.numDigits);
    var lat = this.options.latFormatter ? this.options.latFormatter(e.latlng.lat) : L.Util.formatNum(e.latlng.lat, this.options.numDigits);
    var value = this.options.lngFirst ? lng + this.options.separator + lat : lat + this.options.separator + lng;
    var prefixAndValue = this.options.prefix + ' ' + value;
    this._container.innerHTML = prefixAndValue;
  }

});

L.Map.mergeOptions({
    positionControl: false
});

L.Map.addInitHook(function () {
    if (this.options.positionControl) {
        this.positionControl = new L.Control.MousePosition();
        this.addControl(this.positionControl);
    }
});

L.control.mousePosition = function (options) {
    return new L.Control.MousePosition(options);
};
