cls_perfiltopografico = function() {
    this.control = null;
    this.drawItems = null;

    this.init = () => {
        mapa.markerPerfilTopografico = null;
        mapa.capaPerfilTopografico = new L.FeatureGroup().addTo(mapa);

        if (!L.Control.Draw) {
            setTimeout(this.init, 1000);
        } else {
            this.control = new L.Control.Draw({
                position: 'bottomright',
                draw: {
                    polygon: false,
                    circle: false,
                    marker: false,
                    falsemarker: false,
                    circlemarker: false,
                    rectangle: false,
                    edit: false,
                    remove: false
                },
                edit: {
                    featureGroup: mapa.capaPerfilTopografico,
                    edit: false
                }
            });

            mapa.addControl(this.control);
            
            const controlButton = this.control._toolbars.draw._toolbarContainer.firstChild;
            controlButton.addEventListener('click', function(){
                perfilTopografico.isActive = true;
                event.stopPropagation()
            });
            controlButton.id = 'elevationProfileBtn';

            $(".leaflet-draw-draw-polyline").last().css("background-image", "url('./src/styles/images/perfil_topo.png')");
            $(".leaflet-draw-draw-polyline").last().css("background-size", "24px 24px");
            $(".leaflet-draw-draw-polyline").last().css("background-position", "2px 1px");
            $(".leaflet-draw-draw-polyline").last().parent().parent().next().remove();
            $(".leaflet-draw-draw-polyline").last().parent().parent().css("top", "-70px");
            $(".leaflet-draw-draw-polyline").last().parent().parent().css("left", "-2px");
            $(".leaflet-draw-draw-polyline").last().attr("title", "Perfil Topográfico");

            $("#pt-wrapper").draggable();
            $("#pt-wrapper").css("top", $("body").height() - 420);
        }
    }

    this.process = (geoJSON) => {
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

        let c = geoJSON.geometry.coordinates;
        let points_txt = "",
            comma = "";

        for (let i = 0; i < c.length; i++) {
            points_txt += `${comma}${c[i][0]} ${c[i][1]}`;
            comma = ",";
        }

        let elevationProfile = new GeoserviceFactory.ElevationProfileGetFeatureInfo(
            "https://imagenes.ign.gob.ar/geoserver/ows?service=WMS&version=1.1.1",
            "geoprocesos:alos_unificado"
        );
        
        elevationProfile
            .execute(
                points_txt,
            )
            .then((result) => {
                let data = [];
                let altura;
                for (let i = 0; i < result.coordinates.length; i++) {
         
                    altura = result.coordinates[i][2].toFixed(2).toString();

                    data.push({
                        i: (i + 1),
                        lat: result.coordinates[i][0],
                        lng: result.coordinates[i][1],
                        y: parseFloat(altura)
                    });
                }

                $('#pt-inner').highcharts({
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
                            text: 'Muestra',
                        }
                    },
                    yAxis: {
                        //type: 'altura',
                        title: {
                            text: 'Altura'
                        }
                    },
                    legend: {
                        enabled: true
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
                        data: data,
                        point: {
                            events: {
                                mouseOver: function(event) {
                                    mapa.markerPerfilTopografico = L.marker([event.target.lng, event.target.lat]).addTo(mapa);
                                },
                                mouseOut: function() {
                                    mapa.markerPerfilTopografico.remove();
                                }
                            }
                        }
                    }]
                });

            })
            .catch((error) => {
                console.log('Hay error: ', error);
                new UserMessage(error, true, 'error');
            });
    }

    this.toggleControl = (node) => {

        if ($(node).hasClass("active")) {
            $(node).removeClass("active");
        } else {
            $(node).addClass("active");
        }

    }

    this._addElevationProfile = () => {
        $("#pt-wrapper").append(`
            <div class="pt">
                <a href="javascript:void(0)" style="float:right; color:#676767;" onclick="$('#pt-wrapper').hide(); mapa.capaPerfilTopografico.clearLayers();">
                    <i class="fa fa-times"></i>
                </a>
                <div id="pt-inner">

                </div>
            </div>
        `);
    }

    return this;
}