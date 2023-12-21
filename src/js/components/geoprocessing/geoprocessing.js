let g_modal_close = true;
let btn_modal_loading = false;
let process = {};
let contourRectangles = [];
let isValidRectangle = false;
let isSelectionDrawingActive = false;
let counterContour = 0, counterHeight = 0, counterBuffer = 0,
  counterElevProfile = 0; //soon to be moved to their respective class

class Geoprocessing {
  formContainer = null;
  contour_result_active = false;
  geoprocessId = null;
  geoprocessingConfig = null;
  geoprocessing = null;
  optionsForm = null;
  fieldsToReferenceLayers = [];
  editableLayer_name = null;
  _namePrefix = null;
  GEOPROCESS = {
    contour: "curvas_de_nivel_",
    waterRise: "cota_",
    buffer: "area_de_influencia_",
    elevationProfile: "perfil_de_elevacion_"
  }

  svgZoomStyle(zoom) {
    if (this.contour_result_active) {
      let aux = document.getElementById("fix-textpath");
      if (zoom < 14) {
        aux.innerHTML = `
        .leaflet-pane svg text {
          font-size: 0.1em !important;
        }
        `;
      } else {
        aux.innerHTML = "";
      }
    }
  }
  createIcon() {
    const modalIcon = `
    <a id="geoPIcon">
        <i  class="${app.geoprocessing.buttonIcon}" aria-hidden="true" ></i>
    </a>
    `;
    const elem = document.createElement("div");
    elem.className = "leaflet-bar leaflet-control";
    elem.id = "geoprocesos-icon";
    elem.title = app.geoprocessing.buttonTitle;
    elem.innerHTML = modalIcon;

    elem.onclick = () => {
      if (g_modal_close) {
        geoProcessingManager.createModal();
        document.getElementById("geoPIcon").style.backgroundColor = "rgba(238, 238, 238, 0.9)";
        g_modal_close = false;
      }
      else {
        //Close geoprocess window and clear
        document.getElementById("geoPIcon").style.backgroundColor = "rgba(255, 255, 255, 0.9)";
        this.closeModal();
      }
    };
    document.querySelector(".leaflet-top.leaflet-left").appendChild(elem);
  }

  closeModal() {
    document.getElementsByClassName("leaflet-draw-draw-rectangle")[0].style =
      "";
    document.getElementsByClassName("leaflet-draw-draw-polyline")[0].style =
      "";
    document.getElementById("select-process").selectedIndex = 0;
    document.getElementsByClassName("form")[1].innerHTML = "";
    document.getElementById("mr").remove();
    g_modal_close = true;
    document.getElementById("geoPIcon").style.backgroundColor = "rgba(255, 255, 255, 0.9)";

    this.resetHeightLayerColor();
  }

  createModal() {
    let divContainer = document.createElement("div");
    divContainer.id = "mr";
    divContainer.className = "modalOpenFile";

    let mainIcons = document.createElement("div");
    mainIcons.className = "icons-modalfile";

    let f_sec = document.createElement("section");
    f_sec.style = "width:93%";

    let s_sec = document.createElement("section");
    s_sec.style = "width: 7%; display: flex; justify-content: start;";
    let btnclose = document.createElement("a");
    btnclose.id = "btnclose-icon-modalfile";
    btnclose.className = "icon-modalfile";
    btnclose.innerHTML =
      '<i title="Cerrar" class="fa fa-times icon_close_mf" aria-hidden="true"></i>';
    btnclose.onclick = () => {
      //Close geoprocess window and clear
      this.closeModal();
    };
    s_sec.append(btnclose);

    mainIcons.append(f_sec);
    mainIcons.append(s_sec);

    let main_container = document.createElement("div");
    main_container.id = "contenedor-geoprocesos";

    let formulario = document.createElement("section");
    formulario.id = "main-Geoprocesos";
    main_container.append(formulario);

    divContainer.append(mainIcons);
    divContainer.append(main_container);
    document.body.appendChild(divContainer);

    const geoprocessingTabContent = document.getElementById("main-Geoprocesos");
    geoprocessingTabContent.innerHTML = "";
    geoprocessingTabContent.appendChild(geoProcessingManager.getForm());

    document.getElementById("select-process").options[0].text =
      "Seleccione una Opción";

    $("#mr").draggable({
      containment: "body",
    });

    if (document.getElementById("mr")) {
      document.getElementsByClassName("leaflet-draw-draw-rectangle")[0].style =
        "filter: contrast(22%) brightness(157%);pointer-events:none;";
      document.getElementsByClassName("leaflet-draw-draw-polyline")[0].style =
        "filter: contrast(22%) brightness(157%);pointer-events:none;";
    }
  }

  setAvailableGeoprocessingConfig(geoprocessingConfig) {
    this.geoprocessingConfig = geoprocessingConfig;
  }

  getProcesses() {
    return this.geoprocessingConfig.availableProcesses;
  }

  getNewProcessPrefix() {
    this.getProcesses().forEach(process => {
      if (process.namePrefix) {
        this.GEOPROCESS[process.geoprocess] = process.namePrefix;
      }
    })
  }

  set namePrefix(processId) {
    this._namePrefix = this.GEOPROCESS[processId];
  }

  get namePrefix() {
    return this._namePrefix;
  }

  displayResult(result, chosenRectangle) {
    let layerType = "geoprocess",
      sectionName = "Geoprocesos"

    switch (this.geoprocessId) {
      case "contour": {
        btn_modal_loading = false;
        this.contour_result_active = true;
        let style_fix_textpath = document.createElement("style");
        style_fix_textpath.id = "fix-textpath";
        style_fix_textpath.innerHTML = `.leaflet-pane svg text { font-size: 0.8em; }`;

        document.head.appendChild(style_fix_textpath);
        let layername = this.namePrefix + counterContour;
        counterContour++;

        mapa.getEditableLayer(this.editableLayer_name).setStyle({ fillOpacity: 0 });
        let resultGeoJson = mapa.createLayerFromGeoJSON(result, layername);
        addLayerToAllGroups(resultGeoJson, layername);

        let selectedRectangle = mapa.editableLayers.rectangle.at(-1);
        selectedRectangle._uneditable = true; //aux to disallow editing the layer
        selectedRectangle.process = layername; //aux to relate contour with waterRise
        mapa.groupLayers[layername].push(selectedRectangle.name); // hack for including rectangle in contour lines layer 

        result.features.push(selectedRectangle.getGeoJSON()) //include rectangle in contour lines addedLayers 

        addedLayers.push({
          id: layername,
          layer: result,
          name: layername,
          file_name: layername,
          rectangle: selectedRectangle,
          type: layerType,
          isActive: true,
          section: sectionName
        });

        removeGeometryFromDrawingsGroup(selectedRectangle);

        // ** Avoiding Leaflet Draw object test **
        // first comment createLayerFromGeoJSON() call

        // makes a Leaflet featureGroup object and add it to the map
        //mapa.featureGroups = L.featureGroup().addTo(mapa);

        // adds an arbitrary layer to the featureGroup
        //mapa.featureGroups.addLayer(L.geoJSON(addedLayers[0].layer));

        // set style for all layers in the featureGroup
        //mapa.featureGroups.setStyle({color: '#876508'});
        // **

        menu_ui.addFileLayer(sectionName, layerType, layername, layername, layername, true);
        updateNumberofLayers(sectionName)
        break;
      }
      case "waterRise": {
        btn_modal_loading = true;
        const height = this.lastHeightProcessed;
        let layername = `${this.namePrefix + counterHeight}_${height}m`;
        counterHeight++;

        let selectedRectangle;
        mapa.editableLayers.rectangle.forEach(rect => {
          if (rect.process === chosenRectangle.process) {
            selectedRectangle = rect;
          }
        });

        const urlCreator = window.URL || window.webkitURL;
        const imageUrl = urlCreator.createObjectURL(result);

        let imageBounds = [
          [
            selectedRectangle._bounds._southWest.lat,
            selectedRectangle._bounds._southWest.lng,
          ],
          [
            selectedRectangle._bounds._northEast.lat,
            selectedRectangle._bounds._northEast.lng,
          ],
        ];

        let hasPane = mapa.getPanes().hasOwnProperty("heightPane");
        if (!hasPane) {
          mapa.createPane("heightPane");
        }
        const options = { opacity: 0.3, pane: "heightPane" }

        let imageLayer = L.imageOverlay(imageUrl, imageBounds, options); // makes leaflet image overlay from received blob
        imageLayer.title = layername;
        imageLayer.name = layername;
        imageLayer._uneditable = true;

        mapa.addLayerToGroup(imageLayer, layername, layername); // adds imageLayer to mapa.groupLayers

        const type = layername.split('_')[0]; // gets gruop name without count number

        if (!mapa.editableLayers[type]) {
          mapa.editableLayers[type] = [];
        }
        mapa.editableLayers[type].push(imageLayer); // adds new custom type into editableLayers for show/hideLayer functions legacy 
        drawnItems.addLayer(imageLayer); // makes imageLayer into the map

        const title = `${imageLayer.name}`;
        const download = () => {
          const latlngs = selectedRectangle.getLatLngs()[0];
          const coords = `${latlngs[0].lng} ${latlngs[0].lat}, ${latlngs[1].lng} ${latlngs[1].lat},${latlngs[2].lng} ${latlngs[2].lat},${latlngs[3].lng} ${latlngs[3].lat},${latlngs[0].lng} ${latlngs[0].lat}`;

          this.geoprocessing
            .execute(coords, height, "image/tiff", "#0368ff60", 1.0)
            .then((result) => {
              downloadBlob(result, title);
            })
            .catch((ex) => {
              console.log(ex.message);
            });
        };

        addedLayers.push({
          id: layername,
          layer: imageLayer,
          name: layername,
          file_name: layername,
          rectangle: selectedRectangle,
          isActive: true,
          download: download,
          type: layerType,
          section: sectionName
        });

        menu_ui.addFileLayer(sectionName, layerType, layername, layername, layername, true);
        updateNumberofLayers(sectionName)

        break;
      }
      case "buffer": {
        btn_modal_loading = false;
        let layername = this.namePrefix + counterBuffer;
        counterBuffer++;

        let resultGeoJson = mapa.createLayerFromGeoJSON(result, layername);
        addLayerToAllGroups(resultGeoJson, layername);

        mapa.editableLayers.polygon.forEach(lyr => {
          if (lyr.id === layername) {
            lyr._uneditable = true; //aux to disallow editing the layer
          }
        })

        addedLayers.push({
          id: layername,
          layer: result,
          name: layername,
          file_name: layername,
          type: layerType,
          isActive: true,
          section: sectionName
        });
        menu_ui.addFileLayer(sectionName, layerType, layername, layername, layername, true);
        updateNumberofLayers(sectionName)

        break;
      }
    }
    this.resetHeightLayerColor();
    document.getElementById("select-process").selectedIndex = 0;
    document.getElementsByClassName("form")[1].innerHTML = "";
    new UserMessage(`Geoproceso ejecutado exitosamente.`, true, "information");
    geoProcessingManager.geoprocessId = null;
  }

  updateReferencedDrawedLayers(event, layers) {
    if (!this.optionsForm) return;
    if (this.geoprocessId === "contour") {
      this.checkRectangleArea(event);
      this.fieldsToReferenceLayers.forEach((fieldId) => {
        const element = this.optionsForm.getElement(fieldId);
        if (
          element.hasAttribute("references") &&
          element.getAttribute("references") === "drawedLayers"
        ) {
          const options = [];
          options.push({ value: "", text: "" });
          const layerTypes = element.getAttribute("layerTypes").split(",");
          layerTypes.forEach((type) => {
            if (layers.hasOwnProperty(type)) {
              layers[type].forEach((layer) => {
                options.push({ value: layer.name, text: layer.name });
              });
            }
          });
          this.optionsForm.setOptionsToSelect(fieldId, options);
        }
      });
    }

    if (this.geoprocessId === "waterRise") {
      this.fieldsToReferenceLayers.forEach((fieldId) => {
        const element = this.optionsForm.getElement(fieldId);
        if (
          element.hasAttribute("references") &&
          element.getAttribute("references") === "drawedLayers"
        ) {
          const options = [];
          options.push({ value: "", text: "" });
          const layerTypes = element.getAttribute("layerTypes").split(",");
          layerTypes.forEach((type) => {
            if (layers.hasOwnProperty(type)) {
              layers[type].forEach((layer) => {
                options.push({ value: layer.name, text: layer.name });
              });
            }
          });
          this.optionsForm.setOptionsToSelect(fieldId, options);
        }
      });
    }

    if (this.geoprocessId === "buffer") {
      this.checkRectangleArea(event);
    }
    if (this.geoprocessId === "elevationProfile") {
      this.checkPolyline(event);
    }
  }

  resetHeightLayerColor() {
    mapa.editableLayers.polyline.forEach((lyr) => {
      if (lyr.layer && lyr.options.color == "#ff1100") {
        //Same id, spedific value
        lyr.setStyle({ color: "#E4C47A" });
      }
    });
  }

  updateSliderHeight(sliderLayer) {
    document.getElementById("rangeSlider").classList.remove("hidden");
    document.getElementById("sliderValue").classList.remove("hidden");
    let arraySlider = []; //Array that contains all unique values
    sliderLayer.layer.features.forEach((element) => {
      if (!arraySlider.includes(element.properties.value) && element.geometry.type == "LineString") {
        arraySlider.push(element.properties.value);
      }
    });

    document.getElementById("rangeSlider").min = "1";
    document.getElementById("rangeSlider").value = "1";
    document.getElementById("rangeSlider").max = arraySlider.length;
    document.getElementById("sliderValue").innerHTML = arraySlider[0] + " (m)";

    //Display the default slider value
    mapa.editableLayers.polyline.forEach((lyr) => {
      if (lyr.layer == sliderLayer.id && lyr.value == arraySlider[0]) {
        lyr.setStyle({ color: "#ff1100" }); //Same id, spedific value
      }
    });
    //Update the current slider value (each time you drag the slider handle)
    this.sliderHeight(sliderLayer, rangeSlider, sliderValue, arraySlider);
  }

  setSliderHeight(sliderLayer) {
    $("#ejec_gp").removeClass("ui-btn-disabled");

    //Contains all unique values
    let arraySlider = []; //Array that contains all unique values

    sliderLayer.layer.features.forEach((element) => {
      if (!arraySlider.includes(element.properties.value) && element.geometry.type == "LineString") {
        arraySlider.push(element.properties.value);
      }
    });

    //Create Slider Div
    let containerSlider = document.createElement("div");
    containerSlider.id = "containerSlider";
    containerSlider.className = "containerSlider";
    document.getElementsByClassName("form")[1].appendChild(containerSlider);
    //Create Slider
    let rangeSlider = document.createElement("input");
    rangeSlider.type = "range";
    rangeSlider.min = "1";
    rangeSlider.max = arraySlider.length;
    rangeSlider.value = "1";
    rangeSlider.title = "slider";
    rangeSlider.className = "rangeSlider";
    rangeSlider.id = "rangeSlider";
    document.getElementById("containerSlider").appendChild(rangeSlider);
    //Create Slider value
    let sliderValue = document.createElement("div");
    sliderValue.id = "sliderValue";
    sliderValue.className = "sliderValue";
    document.getElementsByClassName("form")[1].appendChild(sliderValue);
    //Display the default slider value
    sliderValue.innerHTML = arraySlider[0] + " (m)";
    mapa.editableLayers.polyline.forEach((lyr) => {
      if (lyr.layer == sliderLayer.id && lyr.value == arraySlider[0]) {
        //Same id, spedific value
        lyr.setStyle({ color: "#ff1100" });
      }
    });
    //Update the current slider value (each time you drag the slider handle)
    this.sliderHeight(sliderLayer, rangeSlider, sliderValue, arraySlider);
  }

  sliderHeight(sliderLayer, rangeSlider, sliderValue, arraySlider) {
    rangeSlider.oninput = function () {
      sliderValue.innerHTML = arraySlider[this.value - 1] + " (m)"; //layers value
      mapa.editableLayers.polyline.forEach((lyr) => {
        if (
          lyr.layer == sliderLayer.id &&
          lyr.value == arraySlider[this.value - 1]
        ) {
          //Same id, same value
          //Set all layers with normal colour
          mapa.editableLayers.polyline.forEach((lyr) => {
            if (
              lyr.layer == sliderLayer.id &&
              lyr.value !== arraySlider[this.value - 1]
            ) {
              //Same id, diferent value
              lyr.setStyle({ color: "#E4C47A" });
            }
          });
          //Then, change specific layer
          lyr.setStyle({ color: "#ff1100" });
        }
      });
    };
  }

  calculateRectangleArea(event) {
    let _area, rectPos, rectangleArea, formattedArea, maxSize;
    if (this.geoprocessId === "contour") {
      maxSize = 100;
    } else if (this.geoprocessId === "buffer") {
      maxSize = 1000;
    }

    if (event === "add-layer") {
      L.GeometryUtil.readableArea = function (area, isMetric, precision) {
        $("#ejec_gp").addClass("ui-btn-disabled");
        rectPos = mapa.editableLayers.rectangle;
        formattedArea = L.GeometryUtil.formattedNumber(area / 1000000, 2);
        _area = formattedArea + " km²";

        if (formattedArea > maxSize) {
          isValidRectangle = false;
          $("#ejec_gp").addClass("ui-btn-disabled");
          $("#invalidRect").removeClass("hidden");
        } else if (formattedArea < maxSize) {
          isValidRectangle = true;
          $("#msgRectangle").addClass("hidden");
          $("#invalidRect").addClass("hidden");
          if (
            $("#input-equidistancia").val() >= 10 &&
            $("#input-equidistancia").val() <= 10000
          ) {
            $("#ejec_gp").removeClass("ui-btn-disabled");
          }
        }
        contourRectangles = [];
        return _area;
      };
    } else if (event === "edit-layer") {
      $("#ejec_gp").addClass("ui-btn-disabled");
      rectPos = mapa.editableLayers.rectangle;

      contourRectangles.push(rectPos[rectPos.length - 1]);
      rectangleArea = L.GeometryUtil.geodesicArea(
        contourRectangles[contourRectangles.length - 1].getLatLngs()[0]
      );
      formattedArea = L.GeometryUtil.formattedNumber(
        rectangleArea / 1000000,
        2
      );

      if (formattedArea > maxSize) {
        isValidRectangle = false;
        $("#ejec_gp").addClass("ui-btn-disabled");
        $("#invalidRect").removeClass("hidden");
      } else if (formattedArea < maxSize) {
        isValidRectangle = true;
        $("#msgRectangle").addClass("hidden");
        $("#invalidRect").addClass("hidden");
        if (
          $("#input-equidistancia").val() >= 10 &&
          $("#input-equidistancia").val() <= 10000
        ) {
          $("#ejec_gp").removeClass("ui-btn-disabled");
        }
      }
      contourRectangles = [];
    }
  }

  checkRectangleArea(event) {
    switch (event) {
      case "add-layer":
        this.calculateRectangleArea(event);
        break;

      case "edit-layer":
        this.calculateRectangleArea(event);
        break;

      case "delete-layer":
        contourRectangles = [];
        $("#invalidRect").addClass("hidden");
        $("#ejec_gp").addClass("ui-btn-disabled");
        $("#drawRectangleBtn").removeClass("ui-btn-disabled");
        $("#msgRectangle").removeClass("hidden");
        break;

      default:
        break;
    }
  }

  checkPolyline(event) {
    switch (event) {
      case "add-layer":
        mapa.editableLayers.polyline.forEach((layer) => {
          if (layer.name.includes("polyline")) {
            setTimeout(function () {
              $("#select-capa").val(layer.name).change();
              $("#ejec_gp").removeClass("ui-btn-disabled");
            }, 500);
          }
        });
        break;

      case "delete-layer":
        document.getElementById("select-capa").selectedIndex = 0;
        $("#ejec_gp").addClass("ui-btn-disabled");
        $("#drawBtn").removeClass("ui-btn-disabled");
        $("#msgRectangle").removeClass("hidden");
        break;

      default:
        break;
    }
  }


  checkLayersForBuffer() {
    let isBuffer = false;
    getAllActiveLayers().forEach((layer) => {
      if (layer) {
        isBuffer = true;
      }
    });
    addedLayers.forEach(lyr => {
      if (lyr.type === "WMS") {
        isBuffer = true;
      }
    })
    if (isBuffer) {
      $("#msgNoLayer").addClass("hidden");
      $("#msgRectangle").removeClass("hidden");
      //$("#drawRectangleBtn").removeClass("disabledbutton");
      $('label[for="input-equidistancia"]').show();
      document
        .getElementById("input-equidistancia")
        .classList.remove("hidden");
    }
  }

  buildOptionFormMessages(sliderLayer) {
    //Contour & Buffer Rectangle Message
    let rectSizeMsg = document.createElement("div");
    rectSizeMsg.innerHTML =
      "Se superó el limite. <br> Edite o elimine el rectángulo.";
    rectSizeMsg.id = "invalidRect";
    rectSizeMsg.style = "color: #ff1100; font-weight: bolder;";
    document.getElementsByClassName("form")[1].appendChild(rectSizeMsg);
    $("#invalidRect").addClass("hidden");

    let layerMessage = document.createElement("div");
    layerMessage.id = "msgRectangle";
    layerMessage.style = "color: #37bbed; font-weight: bolder; font-size: 13px";

    //Contour Messages
    if (this.geoprocessId === "contour") {
      layerMessage.innerHTML = "Dibuje Rectángulo hasta 100km²";
      document.getElementsByClassName("form")[1].appendChild(layerMessage);

      //Hide Capa for Contour Lines
      $('label[for="select-capa"]').hide();
      document.getElementById("select-capa").classList.add("hidden");
    }

    //Buffer Messages
    else if (this.geoprocessId === "buffer") {
      layerMessage.innerHTML = "Dibuje Rectángulo hasta 1000km²";
      document.getElementsByClassName("form")[1].appendChild(layerMessage);

      let messageBuffer = document.createElement("div");
      messageBuffer.innerHTML = "Active una Capa";
      messageBuffer.id = "msgNoLayer";
      messageBuffer.style = "color: red; font-weight: bolder;";
      document.getElementsByClassName("form")[1].appendChild(messageBuffer);
      $("#msgRectangle").addClass("hidden");

      $('label[for="select-capa"]').show();
      $('label[for="input-equidistancia"]').hide();
      $("#drawRectangleBtn").addClass("ui-btn-disabled");
      document.getElementById("input-equidistancia").classList.add("hidden");
      document.getElementById("select-capa").classList.remove("hidden");

      this.checkLayersForBuffer();
    }

    //Cota Messages & Slider
    else if (this.geoprocessId === "waterRise") {
      let message = document.createElement("div");
      message.innerHTML = "No hay Curvas de Nivel";
      message.id = "msgNoContour";
      message.style = "color: red; font-weight: bolder;";
      document.getElementsByClassName("form")[1].appendChild(message);
      $("#msgRectangle").addClass("hidden");

      for (let polyline of mapa.editableLayers.polyline) {
        if (polyline.layer && polyline.layer.includes(this.GEOPROCESS.contour)) {
          this.setSliderHeight(sliderLayer);
          $("#msgNoContour").addClass("hidden");
          break;
        }
      };

      $('label[for="select-capa"]').show();
      document.getElementById("drawRectangleBtn").classList.add("hidden");
      document.getElementById("select-capa").classList.remove("hidden");
    }

    //elevationProfile
    else if (this.geoprocessId === "elevationProfile") {
      layerMessage.innerHTML = "Dibuje una Línea";
      document.getElementsByClassName("form")[1].appendChild(layerMessage);

      //Hide drawRectangle for elevationProfile
      document.getElementById("drawRectangleBtn").classList.add("hidden");
    }
  }

  buildOptionForm(fields) {
    this.optionsForm.clearForm();
    this.fieldsToReferenceLayers = [];
    const formFields = [];
    let sliderLayer;

    fields.forEach((field) => {
      const id = field.name.toLowerCase().replace(/\s/g, "");

      switch (field.element) {
        case "select":
          {
            const selectId = `select-${id}`;

            const options = [];
            options.push({ value: "", text: "" });

            const extraProps = {};
            extraProps.title = field.name;
            if (field.references === "drawedLayers") {
              this.fieldsToReferenceLayers.push(selectId);
              extraProps.references = "drawedLayers";
              extraProps.layerTypes = field.allowedTypes;
              const editableLayers = mapa.getEditableLayers();

              //show elements in "Capa"
              if (this.geoprocessId === "contour") {
                addedLayers.forEach((layer) => {
                  if (layer.id.includes("rectangle")) {
                    options.push({ value: layer.id, text: layer.name });
                  }
                });
              } else if (this.geoprocessId === "waterRise") {
                addedLayers.forEach((layer) => {
                  if (layer.id.includes(this.GEOPROCESS.contour)) {
                    options.push({ value: layer.id, text: layer.name });
                    sliderLayer = layer;
                  }
                });
              } else if (this.geoprocessId === "buffer") {
                let layerTitle;
                getAllActiveLayers().forEach((layer) => {
                  if (layer && gestorMenu.layerIsWmts(layer.name) == false) {
                    gestorMenu.getLayerData(layer.name).title ?
                    layerTitle = gestorMenu.getLayerData(layer.name).title :
                    layerTitle = layer.name;
                    options.push({
                      value: layer.name,
                      text: layerTitle,
                    });
                  }
                });
                addedLayers.forEach(lyr => {
                  if (lyr.type === "WMS") {
                    options.push({
                      value: lyr.name,
                      text: lyr.layer.title,
                    });
                  }
                });
              } else if (this.geoprocessId === "elevationProfile") {
                const polylines = mapa.editableLayers.polyline;
                if (polylines.length > 0) {
                  polylines.forEach((poly) => {
                    if (!poly.layer) {
                      options.push({ value: poly.name, text: poly.name });
                    }
                  });
                }
              }
            }

            //Select layer in "Capa"
            const select = this.optionsForm.addElement("select", selectId, {
              title: field.name,
              events: {
                change: (element) => {
                  if (this.geoprocessId === "contour") {
                    if (!element.value) return;
                    const layer = mapa.getEditableLayer(element.value);
                    mapa.centerLayer(layer);
                  } else if (this.geoprocessId === "waterRise") {
                    let selectedLayer = "";
                    if (!element.value) {
                      this.resetHeightLayerColor();
                      document.getElementById("rangeSlider").classList.add("hidden");
                      document.getElementById("sliderValue").classList.add("hidden");
                      $("#ejec_gp").addClass("ui-btn-disabled");
                      return;
                    }
                    addedLayers.forEach((lyr) => {
                      lyr.id == element.value
                        ? (selectedLayer = lyr)
                        : null;
                    });
                    if (selectedLayer.layer.features.length != 0) {
                      this.resetHeightLayerColor();
                      mapa.centerLayer(selectedLayer.layer);

                      sliderLayer = selectedLayer;
                      this.updateSliderHeight(sliderLayer);
                      $("#ejec_gp").removeClass("ui-btn-disabled");
                    }
                  } else if (this.geoprocessId === "buffer") {
                    if (!element.value) {
                      $("#drawRectangleBtn").addClass("ui-btn-disabled");
                      $("#ejec_gp").addClass("ui-btn-disabled");
                    } else {
                      this.checkLayersForBuffer()
                      $("#drawRectangleBtn").removeClass("ui-btn-disabled");
                    }
                  } else if (this.geoprocessId === "elevationProfile") {
                    if (!element.value) {
                      $("#ejec_gp").addClass("ui-btn-disabled");
                      return;
                    }
                    let selectedLayer = "";
                    const polylines = mapa.editableLayers.polyline;
                    if (polylines.length > 0) {
                      polylines.forEach((polyline) => {
                        polyline.name === element.value
                          ? (selectedLayer = polyline)
                          : null;
                      });
                      mapa.centerLayer(selectedLayer.getGeoJSON());
                      $("#ejec_gp").removeClass("ui-btn-disabled");
                    }
                  }
                },
              },
              extraProps: extraProps,
            });

            this.optionsForm.setOptionsToSelect(selectId, options);
            formFields.push(select);
          }
          break;
        case "input":
          {
            const extraProps = {};
            extraProps.type = field.type;
            extraProps.title = field.name;
            if (field.hasOwnProperty("min")) {
              extraProps.min = field.min;
            }
            if (field.hasOwnProperty("max")) {
              extraProps.max = field.max;
            }
            const inputId = `input-${id}`;
            const input = this.optionsForm.addElement("input", inputId, {
              title: field.name,
              extraProps: extraProps,
            });
            let inputDefault = document.getElementById("input-equidistancia");

            //Different inputs depending on active geoprocess
            if (this.geoprocessId == "contour") {
              inputDefault.value = 100;
              $("label[for='input-equidistancia']").html("Equidistancia (m)");
            } else if (this.geoprocessId == "buffer") {
              inputDefault.value = 1000;
              $("label[for='input-equidistancia']").html("Distancia (m)");
            } else if (this.geoprocessId == "waterRise") {
              $("label[for='input-cota']").hide();
              document.getElementById("input-cota").classList.add("hidden");
            }
            formFields.push(input);
          }
          break;
        case "button":
          {
            this.optionsForm.addButton(field.name, field.onclick, field.id);
          }
          break;
        default:
          break;
      }
    });

    function checkExecuteBtn() {
      //Check to see if there is any text entered
      if (
        $("#input-equidistancia").val() >= 10 &&
        $("#input-equidistancia").val() <= 10000 &&
        isValidRectangle == true
      ) {
        $("#ejec_gp").removeClass("ui-btn-disabled");
      } else if (
        $("#input-equidistancia").val() < 10 ||
        $("#input-equidistancia").val() > 10000
      ) {
        $("#ejec_gp").addClass("ui-btn-disabled");
      }
    }
    $(document).ready(function () {
      $("#input-equidistancia").keyup(checkExecuteBtn);
    });

    //Draw Rectangle Button
    let rectangleBtn;
    if (this.geoprocessId === "contour") {
      rectangleBtn = "Dibujar Rectángulo";
    } else if (this.geoprocessId === "buffer") {
      rectangleBtn = "Selección de Área";
    }
    this.optionsForm.addButton(
      rectangleBtn,
      () => {
        let drawingRectangle = new L.Draw.Rectangle(mapa);
        $("#drawRectangleBtn").addClass("ui-btn-disabled");
        drawingRectangle.enable();
        this.checkRectangleArea("add-layer");
        isSelectionDrawingActive = true;
      },
      "drawRectangleBtn"
    );

    //Execute Button

    this.optionsForm.addButton(
      "Ejecutar",
      () => {
        if (this.geoprocessId === "buffer") {
          this.executeBuffer();
        } else if (this.geoprocessId === "elevationProfile") {
          //this.executeElevationProfile();
          let perfilTopografico = new IElevationProfile();
          perfilTopografico.executeElevationProfile();
        } else {
          this.executeGeoprocess(formFields);
        }
      },
      "ejec_gp"
    );

    $("#ejec_gp").addClass("ui-btn-disabled"); //Execute Button disabled from the start
    this.buildOptionFormMessages(sliderLayer); //Form Messages & Slider
  }


  executeBuffer() {
    let drawnRectangle,
      layerSelected,
      allLayers = getAllActiveLayers(),
      selctedLayerName = document.getElementById("select-capa").value;
    mapa.editableLayers.rectangle.forEach((lyr) => {
      if (lyr.id && lyr.id.includes("selection_")) {
        drawnRectangle = lyr;
      }
    });
    
    allLayers.forEach(lyr => {
      if (lyr.name === selctedLayerName) {
        layerSelected = lyr.layer;
      }
    })

    let coords = getGeometryCoords(drawnRectangle);

    let distanceBuffer =
      document.getElementById("input-equidistancia").value / 1000;

    loadingBtn("on", "ejec_gp");

    let buffer;
    if (!layerSelected.host ) {
      try {
        let arrayForBuffer = [],
          selecCoords = drawnRectangle.getGeoJSON(),
          within;
        
        turf.featureEach(layerSelected, function (feature) {
          within = turf.booleanIntersects(feature, selecCoords);
          if (within) {
            arrayForBuffer.push(feature)
          }
        });
        let bufferFeature = turf.featureCollection(arrayForBuffer);
        buffer = turf.buffer(bufferFeature, distanceBuffer)

      } catch (error) {        
        console.error(error);
        new UserMessage(error.message, true, "error");
        loadingBtn("off", "ejec_gp");
      }
      this.displayResult(buffer);

    } else {
      buffer = getLayerDataByWFS(coords, drawnRectangle.type, layerSelected)
        .then((data) => {
          if (!data) {
            throw new Error("Error fetching to server");
          }
          buffer = turf.buffer(data, distanceBuffer);
          this.displayResult(buffer);
        })
        .catch((error) => {
          console.error(error);
          new UserMessage(error.message, true, "error");
          loadingBtn("off", "ejec_gp");
        });
    }

    mapa.deleteLayer(drawnRectangle.name);
  }

  executeGeoprocess(formFields) {
    let values = [];
    let arrayWaterRise = "";
    let valueOfWaterRise;
    contourRectangles = [];
    let selectedRectangle;
    for (let i = 0; i < formFields.length; i++) {
      if (
        formFields[i].hasAttribute("references") &&
        formFields[i].getAttribute("references") === "drawedLayers"
      ) {
        let drawnRectangle;
        mapa.editableLayers.rectangle.forEach((lyr) => {
          if (lyr.id && lyr.id.includes("selection_")) {
            drawnRectangle = lyr;
          }
        });

        drawnRectangle != null ? (this.editableLayer_name = drawnRectangle.name) : null;

        switch (this.geoprocessId) {
          case "contour": {
            const sw = drawnRectangle.getBounds().getSouthWest();
            values.push(sw.lng);
            values.push(sw.lat);
            const ne = drawnRectangle.getBounds().getNorthEast();
            values.push(ne.lng);
            values.push(ne.lat);
            break;
          }
          case "waterRise": {
            mapa.editableLayers.rectangle.forEach(rect => {
              if (rect.process === document.getElementById("select-capa").value) {
                selectedRectangle = rect;
                rect._latlngs[0].forEach((coord) => {
                  arrayWaterRise += coord.lng + " " + coord.lat + ",";
                });
                arrayWaterRise +=
                  rect._latlngs[0][0].lng +
                  " " +
                  rect._latlngs[0][0].lat;
              }
            })

            let waterRiseValue =
              document.getElementById("sliderValue").innerHTML;
            waterRiseValue = waterRiseValue.substring(
              0,
              waterRiseValue.length - 4
            );
            valueOfWaterRise = parseInt(waterRiseValue);
            break;
          }
        }
      } else {
        values.push(+formFields[i].value);
      }
    }

    btn_modal_loading = true;
    loadingBtn("on", "ejec_gp");
    if (this.geoprocessId === "contour") {
      this.geoprocessing
        .execute(...values)
        .then((result) => {
          this.displayResult(result);
        })
        .catch((error) => {
          new UserMessage(error.message, true, "error");
          loadingBtn("off", "ejec_gp");
        });
    } else if (this.geoprocessId === "waterRise") {
      let waterRise = new GeoserviceFactory.WaterRise(
        this.geoprocessing.host,
        this.geoprocessing.mdeLayerFullname
      );
      this.lastHeightProcessed = valueOfWaterRise;
      waterRise
        .execute(arrayWaterRise, valueOfWaterRise)
        .then((result) => {
          this.displayResult(result, selectedRectangle);
        })
        .catch((error) => {
          new UserMessage(error.message, true, "error");
          loadingBtn("off", "ejec_gp");
        });
    }
  }

  buildForm() {
    const geoprocessingForm = new FormBuilder();
    const container = document.createElement("div");
    container.className = "geoprocessing-form-container";

    container.appendChild(geoprocessingForm.form);

    const selectProcessId = "select-process";
    geoprocessingForm.addElement("select", selectProcessId, {
      title: app.geoprocessing.dialogTitle,
      events: {
        change: (element) => {
          if (!element.value) {
            this.optionsForm.clearForm();
            this.resetHeightLayerColor();
            return;
          }
          this.geoprocessId = element.value;
          this.namePrefix = this.geoprocessId;

          //Auto show layer
          if (this.geoprocessId == "waterRise") {
            addedLayers.forEach((layer) => {
              if (layer.id.includes(this.GEOPROCESS.contour)) {
                setTimeout(function () {
                  $("#select-capa").val(layer.id).change();
                }, 500);
              }
            });
          }
          if (this.geoprocessId == "elevationProfile") {
            // mapa.editableLayers.polyline.forEach((layer) => {
            //   if (layer.name.includes("polyline")) {
            //     setTimeout(function () {
            //       $("#select-capa").val(layer.name).change();
            //     }, 500);
            //   }
            // });
          }
          if (this.geoprocessId == "buffer") {
            let layerForBuffer = getAllActiveLayers()[0]

            if (
              layerForBuffer &&
              gestorMenu.layerIsWmts(layerForBuffer.name) == false
            ) {
              setTimeout(function () {
                $("#select-capa").val(layerForBuffer.name).change();
                $("#drawRectangleBtn").removeClass("ui-btn-disabled");
              }, 500);
            }
          }
          if (this.geoprocessId !== "waterRise") {
            this.resetHeightLayerColor();
          }

          const item = this.geoprocessingConfig.availableProcesses.find(
            (e) => e.geoprocess === this.geoprocessId
          );

          this.process = {
            contour: GeoserviceFactory.Contour,
            elevationProfile: IElevationProfile,
            waterRise: GeoserviceFactory.WaterRise,
            buffer: GeoserviceFactory.Contour,
          };

          this.geoprocessing = new this.process[this.geoprocessId](
            item.baseUrl,
            item.layer
          );
          this.buildOptionForm(this.geoprocessing.getFields());
          //this.namePrefix = item.namePrefix;
        }
      }
    });

    const options = [];
    options.push({ value: "", text: "" });
    this.geoprocessingConfig.availableProcesses.forEach((geoprocess) => {
      //if(geoprocess.geoprocess !== 'elevationProfile') {
      options.push({ value: geoprocess.geoprocess, text: geoprocess.name });
      //}
    });

    geoprocessingForm.setOptionsToSelect(selectProcessId, options);

    this.optionsForm = new FormBuilder();
    container.appendChild(this.optionsForm.form);

    return container;
  }

  getForm() {
    if (!this.formContainer) {
      this.formContainer = this.buildForm();
      mapa.addMethodToEvent(
        this.updateReferencedDrawedLayers.bind(this, "add-layer"),
        "add-layer"
      );
      mapa.addMethodToEvent(
        this.updateReferencedDrawedLayers.bind(this, "delete-layer"),
        "delete-layer"
      );
      mapa.addMethodToEvent(
        this.updateReferencedDrawedLayers.bind(this, "edit-layer"),
        "edit-layer"
      );
    }
    return this.formContainer;
  }

  updateLayerSelect(layerName, addToList) { //updates elvePorfile polylines & buffer
    let select = document.getElementById("select-capa"),
      option = document.createElement("option");
    option.value = layerName;
    option.innerHTML = gestorMenu.getLayerData(layerName).title;

    if (layerName.includes('polyline') && select !== null) {
      if (addToList) {
        for (let i = 0; i < select.length; i++) {
          if (select[i].value !== layerName) {
            option.innerHTML = layerName;
            select.appendChild(option);
          }
        }
      } else if (!addToList) {
        for (let i = 0; i < select.length; i++) {
          if (select[i].value === layerName) {
            select[i].remove();
          }
          if (!document.getElementById("select-capa")[1]) {
            $("#drawRectangleBtn").addClass("ui-btn-disabled");
            $("#ejec_gp").addClass("ui-btn-disabled");
          }
        }
      }
    }

    if (select && this.geoprocessId === "buffer") {
      if (addToList && gestorMenu.layerIsWmts(layerName) == false) {
        for (let i = 0; i < select.length; i++) {
          if (select[i].value !== layerName && option.innerHTML !== "undefined") {
            select.appendChild(option);
            this.checkLayersForBuffer();
          }
        }
      } else if (!addToList) {
        for (let i = 0; i < select.length; i++) {
          if (select[i].value === layerName) {
            select[i].remove();
          }
          if (!document.getElementById("select-capa")[1]) {
            $("#drawRectangleBtn").addClass("ui-btn-disabled");
            $("#ejec_gp").addClass("ui-btn-disabled");
          }
        }
      }
    }
  }
}