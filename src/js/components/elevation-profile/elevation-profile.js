let polylineColor = '#D63900';

class IElevationProfile {
    constructor() {
        this.serviceURL = "https://imagenes.ign.gob.ar/geoserver/ows?service=WMS&version=1.1.1";
        this.serviceLayer = "geoprocesos:alos_unificado";
        this.values = "";
        this.data = [];
        this.namePrefixElevProfile = geoProcessingManager.namePrefix;
        this.verticesLimit = 100;
        this.verticesLimitMsg = `Selected line has too much vertices. Simplifiy the geometry to execute the process or select a line with less than `;
    }

    drawPolyline() {
        const drawPolyline = new L.Draw.Polyline(mapa, { shapeOptions: { color: polylineColor, opacity: 0.8 } });
        $("#drawBtn").addClass("ui-btn-disabled");
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
        this.addWrapper();
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

        if (layerSelected.getLatLngs().length > this.verticesLimit) {
            const tooMuchVertices = this.verticesLimitMsg + this.verticesLimit;
            return new UserMessage(tooMuchVertices, true, "error");
        }

        loadingBtn("on", "ejec_gp");
        this._processLayer(layerSelected.getGeoJSON());
        this._executeProcess();
        geoProcessingManager.geoprocessId = null;
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
                let layername = this.namePrefixElevProfile + counterElevProfile;
                counterElevProfile++;
                let dataForDisplay = this.data;
                let selectedPolyline = mapa.editableLayers.polyline.at(-1).idElevProfile = layername,
                    layerType = "geoprocess",
                    sectionName = "Geoprocesos";

                let polylineLayer = mapa.editableLayers.polyline.at(-1);
                polylineLayer._uneditable = true; //Aux to disallow editing/delete the polyline

                addedLayers.push({
                    id: layername,
                    name: layername,
                    file_name: layername,
                    layer: result,
                    data: dataForDisplay,
                    isActive: true,
                    polyline: selectedPolyline,
                    type: layerType,
                    section: sectionName
                });


                this.addGeoprocessLayer(sectionName, layerType, layername, layername, layername, true);
                showTotalNumberofLayers();
                updateNumberofLayers(sectionName);
                mapa.groupLayers[layername] = [polylineLayer.name];

                this._displayResult(dataForDisplay, selectedPolyline);
                loadingBtn("off", "ejec_gp");

                document.getElementById("select-process").selectedIndex = 0;
                document.getElementsByClassName("form")[1].innerHTML = "";
                new UserMessage(`Geoproceso ejecutado exitosamente.`, true, "information");

                removeGeometryFromDrawingsGroup(polylineLayer);
            })
            .catch((error) => {
                console.log('Hay error: ', error);
                new UserMessage(error, true, 'error');
                loadingBtn("off", "ejec_gp");
            });
    }

    clickDisplayResult(id) {
        let aux = document.getElementById("flc-" + id),
            wrapper = document.getElementById("pt-wrapper"),
            ptInner = document.getElementById(id);
        addedLayers.forEach(lyr => {
            if (lyr.id === id) {
                if (aux.classList.contains("active")) {
                    if (wrapper.classList.contains("hidden")) { //if wrapper window is closed while btn is active
                        wrapper.classList.toggle("hidden");
                    } else {
                        aux.classList.remove("active")
                        this.removePolyline(id); //Removes drawItems
                        ptInner.classList.toggle("hidden");
                    }
                    lyr.isActive = false;
                } else {
                    if (wrapper.classList.contains("hidden")) { //if wrapper is  hidden & all layers are deactivated
                        wrapper.classList.toggle("hidden");
                    }
                    aux.classList.add("active");
                    if (mapa.editableLayers.hasOwnProperty('polyline')) {
                        const lyr = mapa.editableLayers["polyline"].find(lyr => lyr.idElevProfile === id);
                        if (lyr) {
                            drawnItems.addLayer(lyr);
                        }
                    }
                    ptInner.classList.toggle("hidden");
                    lyr.isActive = true;
                }
                updateNumberofLayers(lyr.section);
            }
        });

        //Is wrapper empty?
        let count = 0;
        addedLayers.forEach(layer => {
            if (layer.id.includes(this.namePrefixElevProfile)) {
                count++;
            }
        });
        if (document.getElementById("elevationProfile").querySelectorAll('.hidden').length == count) {
            wrapper.classList.toggle("hidden");
        }
        showTotalNumberofLayers();
    }

    addWrapper() {
        if (document.getElementById("pt-wrapper")) {
            return 0
        }
        else {
            const wrapper = document.createElement("div");
            wrapper.id = "pt-wrapper";
            wrapper.classList = "justify-content-center col-12 col-xs-12 col-sm-10 col-md-10 hidden"

            document.body.appendChild(wrapper);

            $("#pt-wrapper").append(`
                <div class="pt" id="elevationProfile" style="overflow-y: auto; height: 250px; padding: 5px 7px;">
                </div>
            `);

            let mainIcons = document.createElement("div");
            mainIcons.className = "icons-modalfile";

            let f_sec = document.createElement("section");
            f_sec.style = "width: 95%;";

            let s_sec = document.createElement("section");
            s_sec.style = "width: 5%; display: flex; justify-content: end; padding-right: 1%;";

            let btnclose = document.createElement("a");
            btnclose.id = "btnclose-wrapper";
            btnclose.className = "icon-modalfile";
            btnclose.innerHTML =
                '<i title="Cerrar" class="fa fa-times icon_close_mf" aria-hidden="true"></i>';
            btnclose.onclick = () => {
                hideAllElevationProfile();
                let idElevProfile = document.getElementById("elevationProfile").children[1].id,
                    section;
                addedLayers.forEach(lyr => {
                    if (lyr.id === idElevProfile) {
                        section = lyr.section;
                    }
                })
                updateNumberofLayers(section);
                showTotalNumberofLayers();

            };
            s_sec.append(btnclose);

            mainIcons.append(f_sec);
            mainIcons.append(s_sec);

            document.getElementById("elevationProfile").append(mainIcons);

            document.getElementById("pt-wrapper").style.display = "flex";
            $("#pt-wrapper").draggable({ containment: "body", scroll: false });
            $("#pt-wrapper").css("top", $("body").height() - 320);

        }
    }

    _displayResult(dataForDisplay, selectedPolyline) {
        if (document.getElementById("pt-wrapper").classList.contains("hidden")) {
            document.getElementById("pt-wrapper").classList.toggle("hidden");
        }

        const inner = document.createElement("div");
        inner.id = selectedPolyline;
        inner.style.height = '220px';

        document.getElementById("elevationProfile").appendChild(inner);

        Highcharts.setOptions({
            credits: { enabled: false },
            lang: {
                viewFullscreen: "Pantalla Completa",
                exitFullscreen: "Salir de pantalla completa",
                contextButtonTitle: "Menú",
                printChart: "Imprimir",
                resetZoom: "Restablecer zoom",
                resetZoomTitle: "Restablecer zoom escala 1:1",
                downloadCSV: "Descargar en CSV",
                downloadJPEG: "Descargar en JPG",
                downloadPDF: "Descargar en PDF",
                downloadPNG: "Descargar en PNG",
                downloadSVG: "Descargar en SVG",
                downloadXLS: "Descargar en XLS"
            },
            accessibility: {
                enabled: false
            }
        });

        $('#' + inner.id).highcharts({
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
                            [1, new Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
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
                data: dataForDisplay,
                point: {
                    events: {
                        mouseOver: function (event) {
                            mapa.markerPerfilTopografico = L.circleMarker([event.target.lng, event.target.lat], {
                                radius: 4,
                                fillOpacity: 0.7,
                                color: polylineColor,
                                fillColor: polylineColor,
                                weight: 3,
                            }).addTo(mapa);
                        },
                        mouseOut: function () {
                            mapa.markerPerfilTopografico.remove();
                        }
                    }
                }
            }]
        });

    }

    downloadPolyline(id) {
        let layerData;
        addedLayers.forEach(layer => {
            if (layer.id == id) {
                layerData = layer.data;
            }
        });

        let geoJSON = {
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

        layerData.forEach(point => {
            let coord = [point.lat, point.lng, point.y];
            geoJSON.features[0].geometry.coordinates.push(coord);
        });

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geoJSON));
        const downloadANode = document.createElement('a');
        downloadANode.setAttribute("href", dataStr);
        downloadANode.setAttribute("download", id + ".geojson");
        document.body.appendChild(downloadANode);
        downloadANode.click();
        downloadANode.remove();
    }

    getGeoJSON(data) { // would be moved to the Layer class as part of export method

        let geoJSON = {
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

        data.forEach(point => {
            let coord = [point.lat, point.lng, point.y];
            geoJSON.features[0].geometry.coordinates.push(coord);
        });

        //console.log(geoJSON);
    }

    editElevProfileName(id) {
        let index = getIndexFileLayerbyID(id)
        addedLayers[index].laodingname = false
        let id_i = "flc-" + id
        let container = document.getElementById(id_i)
        let element = container.getElementsByClassName("file-layername")[0]
        let name = element.innerText
        let nodo_hijo = container.getElementsByClassName("btn-group")[0]
        element.remove()

        let input_name = document.createElement("input")
        input_name.value = name
        input_name.type = element.innerText
        input_name.className = "input_newname form-control"
        input_name.style = "width: 75% !important;"
        input_name.id = "i-" + id

        input_name.autocomplete = "off"
        input_name.style = "height:22px!important;"
        input_name.onblur = function (e) {
            if (!addedLayers[index].laodingname) {
                $("#i-" + id).remove()
                let a_new = document.createElement("div")
                a_new.className = "file-layername"
                a_new.innerHTML = `<a>${name}</a>`
                container.insertBefore(a_new, nodo_hijo);
            }
        }

        input_name.onkeyup = function (e) {
            if (e.key === 'Enter' || e.keyCode === 13) {
                addedLayers[index].laodingname = true
                $("#i-" + id).remove()
                let a_new = document.createElement("div")
                a_new.className = "file-layername"
                a_new.title = this.value
                editDomNameofFileLayerbyID(id, this.value)
                a_new.innerHTML = `<a>${this.value}</a>`
                a_new.onclick = () => {
                    let perfilEdit = new IElevationProfile();
                    perfilEdit.clickDisplayResult(id)
                }
                container.insertBefore(a_new, nodo_hijo);
            }
        }

        container.insertBefore(input_name, nodo_hijo);
        $(`#i-${id}`).focus()
    }

    /**
     * Removes an elevation profile layer.
     * @param {string} id - The ID of the layer to remove.
     */
    removeElevationProfile(id) {
        // Remove drawItems
        this.removePolyline(id);

        // Remove editable layer
        const polylines = mapa.editableLayers.polyline.filter(lyr => lyr.idElevProfile === id);
        polylines.forEach(lyr => mapa.deleteLayer(lyr.name));

        // Remove from groupLayers
        delete mapa.groupLayers[id];

        // Update number of layers in section and total layers count
        const lyrToRemove = addedLayers.find(lyr => lyr.id === id);
        if (lyrToRemove) {
            updateNumberofLayers(lyrToRemove.section);
            showTotalNumberofLayers();
        }

        controlSeccionGeom();

        // Remove Highcharts chart
        const highchartsGraph = document.getElementById(id);
        if (highchartsGraph) {
            highchartsGraph.remove();
        }

        // Check if wrapper can be hidden or removed
        let layersCount = addedLayers.filter(layer => layer.id.includes(this.namePrefixElevProfile)).length;
        let hiddenCount = 0;
        const elevProfileDiv = document.getElementById("elevationProfile");
        if (elevProfileDiv) {
            hiddenCount = elevProfileDiv.querySelectorAll('.hidden').length;
        }

        const wrapper = document.getElementById("pt-wrapper");
        if (wrapper) {
            if (layersCount === hiddenCount && !wrapper.classList.contains("hidden")) {
                wrapper.classList.toggle("hidden");
            }
            if (layersCount === 0 && hiddenCount === 0) {
                wrapper.remove();
            }
        }
    }

    removePolyline(id) {
        Object.values(drawnItems._layers).forEach(lyr => {
            if (id === lyr.idElevProfile) {
                drawnItems.removeLayer(lyr);
                return;
            }
        });
    }

    addGeoprocessLayer(groupname, layerType, textName, id, fileName, isActive) {
        let groupnamev = clearSpecialChars(groupname);
        let main = document.getElementById("lista-" + groupnamev)
        if (!fileLayerGroup.includes(groupnamev)) {
            fileLayerGroup.push(groupnamev);
        }
        let id_options_container = "opt-c-" + id
        if (!main) { menu_ui.addSection(groupnamev) }
        let content = document.getElementById(groupnamev + "-panel-body")
        let layer_container = document.createElement("div")
        layer_container.id = "fl-" + id
        layer_container.className = "file-layer-container"

        let layer_item = document.createElement("div")
        layer_item.id = "flc-" + id
        if (isActive) {
            layer_item.className = "file-layer active"
        } else if (!isActive) {
            layer_item.className = "file-layer"
        }

        let img_icon = document.createElement("div")
        img_icon.className = "file-img"
        img_icon.innerHTML = `<img loading="lazy" src="src/js/components/openfiles/icon_file.svg">`
        img_icon.onclick = () => {
            this.clickDisplayResult(id);
        }

        let layer_name = document.createElement("div")
        layer_name.className = "file-layername"
        layer_name.innerHTML = "<a>" + textName + "</a>"
        layer_name.title = fileName
        layer_name.onclick = () => {
            this.clickDisplayResult(id);
        }

        let options = document.createElement("div")
        options.style = "width:10$;padding-right:5px;cursor:pointer;"
        options.className = "btn-group"
        options.role = "group"
        options.id = id_options_container

        let fdiv = document.createElement("div")
        fdiv.style = "border: 0px;"
        fdiv.className = "dropdown-toggle"
        fdiv.setAttribute('data-toggle', 'dropdown')
        fdiv.setAttribute('aria-haspopup', 'true')
        fdiv.setAttribute('aria-expanded', 'false')
        fdiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16"> <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/> </svg>'

        let mainul = document.createElement("ul")
        mainul.className = "dropdown-menu"
        mainul.style = "right:0px !important;left:auto !important;"
        mainul.id = "opt-c-" + id

        let delete_opt = document.createElement("li")
        delete_opt.innerHTML = `<a style="color:#474b4e;" href="#"><i  class="fa fa-trash" aria-hidden="true" style="width:20px;"></i>Eliminar Capa</a>`
        delete_opt.onclick = () => {
            let menu = new Menu_UI
            menu.modalEliminar(id, groupnamev, layerType)
        }

        let download_opt = document.createElement("li")
        download_opt.innerHTML = `<a style="color:#474b4e;" href="#"><i class="fa fa-download" aria-hidden="true" style="width:20px;"></i>Descargar .geojson</a>`
        download_opt.onclick = () => {
            this.downloadPolyline(id)
        }

        let edit_name_opt = document.createElement("li")
        edit_name_opt.innerHTML = `<a style="color:#474b4e;" href="#"><i class="fa fa-edit" aria-hidden="true" style="width:20px;"></i>Editar Nombre</a>`
        edit_name_opt.onclick = () => {
            this.editElevProfileName(id);
        }

        let zoom_layer_opt = document.createElement("li")
        zoom_layer_opt.innerHTML = `<a style="color:#474b4e;" href="#"><i class="fa fa-search-plus" aria-hidden="true" style="width:20px;"></i>Zoom a capa</a>`
        zoom_layer_opt.onclick = function () {
            mapa.editableLayers.polyline.forEach(lyr => {
                if (lyr.idElevProfile === id) {
                    mapa.centerLayer(lyr);
                }
            });
        }

        mainul.append(zoom_layer_opt)
        mainul.append(edit_name_opt)
        mainul.append(download_opt)
        mainul.append(delete_opt)

        options.append(fdiv)
        options.append(mainul)

        layer_item.append(img_icon)
        layer_item.append(layer_name)
        layer_item.append(options)
        layer_container.append(layer_item)
        content.appendChild(layer_container)
        addCounterForSection(groupnamev, layerType);
    }

}
