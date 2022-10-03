class IElevationProfile {
    constructor() {
        this.serviceURL = "https://imagenes.ign.gob.ar/geoserver/ows?service=WMS&version=1.1.1";
        this.serviceLayer = "geoprocesos:alos_unificado";
        this.values = "";
        this.data = [];
    }

    getGeoJSON() { // would be moved to the Layer class as part of export method
        const geoJSON = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: [],
              },
            },
          ],
        };
    
        let coords = [];
        this.data.forEach(point => {
           let coord = [ point.lat, point.lng, point.y ];
            geoJSON.features[0].geometry.coordinates.push(coord);
        });

        console.log(geoJSON);
    }

    drawPolyline() {
        const drawPolyline = new L.Draw.Polyline(mapa);
        $("#drawBtn").addClass("disabledbutton");
        $("#msgRectangle").addClass("hidden");
        drawPolyline.enable();
    }

    getFields() {
        
        const inputs = [
          {
            name: "Capa",
            element: "select",
            references: "drawedLayers",
            allowedTypes: ["polyline"],
            points: ["ne", "sw"],
          },
          {
            name: "Dibujar línea",
            element: "button",
            id: "drawBtn",
            onclick: this.drawPolyline
        }
        ];
        /* 
            [
            {
                "name": "Capa",
                "element": "select",
                "references": "drawedLayers",
                "allowedTypes": [
                "rectangle"
                ],
                "points": [
                "ne",
                "sw"
                ]
            },
            {
                "name": "Cota",
                "element": "input",
                "type": "number",
                "min": 0,
                "max": 10000
            }
            ]
        */
        return inputs;
    }

    executeElevationProfile() {
        let layerSelected;
        mapa.editableLayers.polyline.forEach((polyline) => {
            let selctedLayerName = document.getElementById("select-capa").value;
            if (polyline.name === selctedLayerName) {
                layerSelected = polyline;
            }
        });

        geoProcessingManager.loadingBtn("on")
        //let lastPolyline = mapa.editableLayers.polyline.at(-1);
        this._processLayer(layerSelected.getGeoJSON());
        this._executeProcess();
        
    }
        
    _processLayer(geoJSON) {
        this.values = [];
        let c = geoJSON.geometry.coordinates;
        let comma = "";

        for (let i = 0; i < c.length; i++) {
            this.values += `${comma}${c[i][0]} ${c[i][1]}`;
            comma = ",";
        }
        return this.values;
    }

    _executeProcess() {
        this.data = [];
        let elevationProfile = new GeoserviceFactory.ElevationProfileGetFeatureInfo(
            this.serviceURL, this.serviceLayer);

        elevationProfile
        .execute(this.values)
        .then((result) => {
            let altura;
            let distancia = 0.0;
            let desde = null;
            let hasta = null;
    
            for (let i = 0; i < result.coordinates.length; i++) {
    
                altura = result.coordinates[i][2].toFixed(2).toString();
    
                this.data.push({
                    x: Math.floor(distancia * 100) / 100,
                    lat: result.coordinates[i][0],
                    lng: result.coordinates[i][1],
                    y: parseFloat(altura),
                    dist: 'Distancia: ' + (distancia) + ' (km)'
                });
    
                if ((i + 1) < result.coordinates.length) {
                    desde = turf.point([result.coordinates[i][0], result.coordinates[i][1]]);
                    hasta = turf.point([result.coordinates[i + 1][0], result.coordinates[i + 1][1]]);
    
                    distancia = distancia + turf.distance(desde, hasta, { units: 'kilometers' });
                };
            }
            geoProcessingManager.loadingBtn("off")
            this._displayResult();
            menu_ui.addFileLayer("Geoprocesos", "elevation-profile", "elevation-profile", "elevation-profile");

            document.getElementById("select-process").selectedIndex = 0;
            document.getElementsByClassName("form")[1].innerHTML = "";
            new UserMessage(`Geoproceso ejecutado exitosamente.`, true, "information");
        })
        .catch((error) => {
            console.log('Hay error: ', error);
            new UserMessage(error, true, 'error');
            geoProcessingManager.loadingBtn("off")
        });
    }

    _displayResult() {
        $("#pt-wrapper").append(`
            <div class="pt" id="elevationProfile">
                <a href="javascript:void(0)" style="float:right; color:#676767;" onclick="$('#pt-wrapper').hide(); document.getElementById('elevationProfile').remove();">
                    <i class="fa fa-times"></i>
                </a>
                <div id="pt-inner">

                </div>
            </div>
        `);

        let tplLoad = `
            <div style="width:100%; height:400px; display:flex; justify-content:center; align-items:center;">
                <div>
                    <p class="text-center" style="color:#464542">Cargando Perfil Topográfico</p>
                    <p class="text-center" style="color:#464542"><i class="fas fa-spinner fa-spin"></i></p>
                </div>
            </div>
        `;

        document.getElementById("pt-inner").innerHTML = tplLoad;
        document.getElementById("pt-wrapper").style.display = "flex";

        $("#pt-wrapper").draggable();
        $("#pt-wrapper").css("top", $("body").height() - 420);

        $('#pt-inner').highcharts({
            credits: { enabled: false },
            lang: {
                viewFullscreen: "Pantalla Completa",
                printChart: "Imprimir",
                downloadCSV: "Descargar en CSV",
                downloadJPEG: "Descargar en JPG",
                downloadPDF: "Descargar en PDF",
                downloadPNG: "Descargar en PNG",
                downloadSVG: "Descargar en SVG",
                downloadXLS: "Descargar en XLS"
            },
            chart: {
                zoomType: 'x',
                backgroundColor: 'rgba(255, 255, 255, 0.0)',
            },
            title: {
                //text: 'Perfil Topográfico',
                text: '',
                style: {
                    fontSize: "15px",
                    color: '#FFFFFF'
                }
            },
            subtitle: {
                //text: 'Distancia Total: ' + data.distancia_total + "Km.",
                text: '',
                style: {
                    //color:'#FFFFFF'
                    color: '#000000'
                }
            },
            xAxis: {
                //type: 'distancia',
                title: {
                    text: 'Distancia (km)'
                }
            },
            yAxis: {
                //type: 'altura',
                title: {
                    text: 'Altura (m)'
                }
            },
            legend: {
                enabled: true
            },
            tooltip: {
                formatter: function () {
                    return 'Altura ' + this.y + ' (m) <br>Distancia ' + this.x + ' (Km)';
                },
                shared: true
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },

            series: [{
                type: 'area',
                name: 'Altura',
                data: this.data,
                point: {
                    events: {
                        mouseOver: function (event) {
                            mapa.markerPerfilTopografico = L.marker([event.target.lng, event.target.lat]).addTo(mapa);
                        },
                        mouseOut: function () {
                            mapa.markerPerfilTopografico.remove();
                        }
                    }
                }
            }]
        });
    
    }

    
}
