/**
 *  File: L.SimpleGraticule.js
 *  Desc: A graticule for Leaflet maps in the L.CRS.Simple coordinate system.
 *  Auth: Andrew Blakey (ablakey@gmail.com)
 */
L.SimpleGraticule = L.LayerGroup.extend({
    options: {
        interval: 20,
        showOriginLabel: true,
        redraw: 'move',
        hidden: false,
		labelsFormat: 'decimal',
        zoomIntervals : []
    },

    lineStyle: {
        stroke: true,
        color: '#111',
        opacity: 0.6,
        weight: 1,
        interactive: false,
        clickable: false //legacy support
    },

    initialize: function(options) {
        L.LayerGroup.prototype.initialize.call(this);
        L.Util.setOptions(this, options);
    },

    onAdd: function(map) {
        this._map = map;

        var graticule = this.redraw();
        this._map.on('viewreset ' + this.options.redraw, graticule.redraw, graticule);

        this.eachLayer(map.addLayer, map);
    },

    onRemove: function(map) {
        map.off('viewreset '+ this.options.redraw, this.map);
        this.eachLayer(this.removeLayer, this);
    },

    hide: function() {
        this.options.hidden = true;
        this.redraw();
    },

    show: function() {
        this.options.hidden = false;
        this.redraw();
    },

    redraw: function() {
        this._bounds = this._map.getBounds().pad(0.5);

        this.clearLayers();

        if (!this.options.hidden) {

            var currentZoom = this._map.getZoom();

            for(var i = 0 ; i < this.options.zoomIntervals.length ; i++) {
                if(currentZoom >= this.options.zoomIntervals[i].start && currentZoom <= this.options.zoomIntervals[i].end){
                    this.options.interval = this.options.zoomIntervals[i].interval;
                    break;
                }
            }

            this.constructLines(this.getMins(), this.getLineCounts());

            if (this.options.showOriginLabel) {
                this.addLayer(this.addOriginLabel());
            }
        }

        return this;
    },

    getLineCounts: function() {
        return {
            x: Math.ceil((this._bounds.getEast() - this._bounds.getWest()) /
                this.options.interval),
            y: Math.ceil((this._bounds.getNorth() - this._bounds.getSouth()) /
                this.options.interval)
        };
    },

    getMins: function() {
        //rounds up to nearest multiple of x
        var s = this.options.interval;
        return {
            x: Math.floor(this._bounds.getWest() / s) * s,
            y: Math.floor(this._bounds.getSouth() / s) * s
        };
    },

    constructLines: function(mins, counts) {
        var lines = new Array(counts.x + counts.y);
        var labels = new Array(counts.x + counts.y);

        //for horizontal lines
        for (var i = 0; i <= counts.x; i++) {
            var x = mins.x + i * this.options.interval;
            lines[i] = this.buildXLine(x);
            labels[i] = this.buildLabel('gridlabel-horiz', x);
        }

        //for vertical lines
        for (var j = 0; j <= counts.y; j++) {
            var y = mins.y + j * this.options.interval;
            lines[j + i] = this.buildYLine(y);
            labels[j + i] = this.buildLabel('gridlabel-vert', y);
        }

        lines.forEach(this.addLayer, this);
        labels.forEach(this.addLayer, this);
    },

    buildXLine: function(x) {
        var bottomLL = new L.LatLng(this._bounds.getSouth(), x);
        var topLL = new L.LatLng(this._bounds.getNorth(), x);

        return new L.Polyline([bottomLL, topLL], this.lineStyle);
    },

    buildYLine: function(y) {
        var leftLL = new L.LatLng(y, this._bounds.getWest());
        var rightLL = new L.LatLng(y, this._bounds.getEast());

        return new L.Polyline([leftLL, rightLL], this.lineStyle);
    },
	
	decimalPlaces: function(num) {
	  var match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
	  if (!match) { return 0; }
	  return Math.max(
		   0,
		   // Number of digits right of decimal point.
		   (match[1] ? match[1].length : 0)
		   // Adjust for scientific notation.
		   - (match[2] ? +match[2] : 0));
	},
	
	degToDms: function (deg) {
       var multiplier = (deg < 0)?-1:1;
       deg = Math.abs(deg);
	   var vecAux = new Array();
	   var d = Math.floor (deg);
	   var minfloat = (deg-d)*60;
	   var m = Math.floor(minfloat);
	   var secfloat = (minfloat-m)*60;
	   var s = Math.round(secfloat);
	   // After rounding, the seconds might become 60. These two
	   // if-tests are not necessary if no rounding is done.
	   if (s==60) {
		 m++;
		 s=0;
	   }
	   if (m==60) {
		 d++;
		 m=0;
	   }
	   
	   vecAux[0] = (d * multiplier) + "°";
	   vecAux[1] = m + "'";
	   if (m < 10) {
		vecAux[1] = "0" + m + "'";
	   }
	   vecAux[2] = s + "''";
	   if (s < 10) {
		vecAux[2] = "0" + s + "'";
	   }

	   return vecAux.join('');
	},

    buildLabel: function(axis, val) {
        var bounds = this._map.getBounds().pad(-0.003);
        var latLng;
        if (axis == 'gridlabel-horiz') {
            latLng = new L.LatLng(bounds.getNorth(), val);
        } else {
            latLng = new L.LatLng(val, bounds.getWest());
        }
		
		if (this.options.labelsFormat == 'dms') {
			val = this.degToDms(val);
		}

        return L.marker(latLng, {
            interactive: false,
            clickable: false, //legacy support
            icon: L.divIcon({
                iconSize: [0, 0],
                className: 'leaflet-grid-label',
                html: '<div class="' + axis + '">' + val + '</div>'
            })
        });
    },

    addOriginLabel: function() {
        return L.marker([0, 0], {
            interactive: false,
            clickable: false, //legacy support
            icon: L.divIcon({
                iconSize: [0, 0],
                className: 'leaflet-grid-label',
                html: '<div class="gridlabel-horiz">(0,0)</div>'
            })
        });
    }
});

L.simpleGraticule = function(options) {
    return new L.SimpleGraticule(options);
};
