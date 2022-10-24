let g_modal_close = true;
let btn_modal_loading = false;
let process = {};
let results_counter = 0;
let contourRectangles = [];
let isValidRectangle = false;

class Geoprocessing {
  formContainer = null;
  contour_result_active = false;
  geoprocessId = null;
  geoprocessingConfig = null;
  geoprocessing = null;
  optionsForm = null;
  fieldsToReferenceLayers = [];
  editableLayer_name = null;
  namePrefix = app.geoprocessing.availableProcesses[0].namePrefix ?? "result_";
  namePrefixBuffer = app.geoprocessing.availableProcesses[2].namePrefix ?? "result_";

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
    const modalicon = `
    <div class="center-flex" id="iconopenfile-container">
        <span id="spanopenfolder" class="${app.geoprocessing.buttonIcon}" aria-hidden="true" ></span>
    </div>
    `;
    const elem = document.createElement("div");
    elem.className = "leaflet-control-locate leaflet-bar leaflet-control";
    elem.id = "geoprocesos-icon";
    elem.title = app.geoprocessing.buttonTitle;
    elem.innerHTML = modalicon;

    let isChrome =
      /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    let shadow_style = "0 1px 5px rgb(0 0 0 / 65%)";
    let border_style = "none";
    let size = "26px";
    if (!isChrome) {
      shadow_style = "none";
      border_style = "2px solid rgba(0, 0, 0, 0.2)";
      size = "34px";
    }
    elem.style.width = size;
    elem.style.height = size;
    elem.style.border = border_style;
    elem.style.boxShadow = shadow_style;

    elem.onclick = function () {
      if (g_modal_close) {
        geoProcessingManager.createModal();
        g_modal_close = false;
      }
    };
    document.querySelector(".leaflet-top.leaflet-left").appendChild(elem);
  }

  createModal() {
    let divContainer = document.createElement("div");
    divContainer.id = "mr";
    divContainer.className = "modalOpenFile";

    let mainIcons = document.createElement("div");
    mainIcons.className = "icons-modalfile";

    let f_sec = document.createElement("section");
    f_sec.style = "width:95%";

    let s_sec = document.createElement("section");
    s_sec.style = "width:5%";
    let btnclose = document.createElement("a");
    btnclose.id = "btnclose-icon-modalfile";
    btnclose.className = "icon-modalfile";
    btnclose.innerHTML =
      '<i title="cerrar" class="fa fa-times icon_close_mf" aria-hidden="true"></i>';
    btnclose.onclick = function () {
      //Close geoprocess window and clear
      document.getElementsByClassName("leaflet-draw-draw-rectangle")[0].style =
        "";
      document.getElementsByClassName("leaflet-draw-draw-polyline")[0].style =
        "";
      document.getElementById("select-process").selectedIndex = 0;
      document.getElementsByClassName("form")[1].innerHTML = "";
      divContainer.remove();
      g_modal_close = true;
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
      containment: "#mapa",
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

  displayResult(result) {
    switch (this.geoprocessId) {
      case "contour": {
        btn_modal_loading = false;
        this.contour_result_active = true;
        let style_fix_textpath = document.createElement("style");
        style_fix_textpath.id = "fix-textpath";
        style_fix_textpath.innerHTML = `
        .leaflet-pane svg text {
          font-size: 0.8em;
        }`;

        document.head.appendChild(style_fix_textpath);

        let namePrefix = this.namePrefix;

        let layername = namePrefix + results_counter;
        results_counter++;

        mapa
          .getEditableLayer(this.editableLayer_name)
          .setStyle({ fillOpacity: 0 });
        mapa.addGeoJsonLayerToDrawedLayers(result, layername, true, true);

        let selectedRectangle = mapa.editableLayers.rectangle.at(-1);

        addedLayers.push({
          id: layername,
          layer: result,
          name: layername,
          file_name: layername,
          rectangle: selectedRectangle,
          kb: null,
        });

        // ** Avoiding Leaflet Draw object test **
        // first comment addGeoJsonLayerToDrawedLayers() call

        // makes a Leaflet featureGroup object and add it to the map
        //mapa.featureGroups = L.featureGroup().addTo(mapa);

        // adds an arbitrary layer to the featureGroup
        //mapa.featureGroups.addLayer(L.geoJSON(addedLayers[0].layer));

        // set style for all layers in the featureGroup
        //mapa.featureGroups.setStyle({color: '#876508'});
        // **

        menu_ui.addFileLayer("Geoprocesos", layername, layername, layername);
        break;
      }
      case "waterRise": {
        btn_modal_loading = true;
        let layername = app.geoprocessing.availableProcesses[1].namePrefix + results_counter;
        results_counter++;

        let selectedRectangle = mapa.editableLayers.rectangle.at(-1);

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
        const options = {opacity: 0.3, pane: "heightPane"}
        
        let imageLayer = L.imageOverlay(imageUrl, imageBounds, options); // makes leaflet image overlay from received blob
        imageLayer.title = layername;
        imageLayer.name = layername;
        
        mapa.addLayerToGroup(imageLayer, layername, layername); // adds imageLayer to mapa.groupLayers
        
        const type = layername.split('_')[0]; // gets gruop name without count number
        mapa.editableLayers[type] = [];
        mapa.editableLayers[type].push(imageLayer); // adds new custom type into editableLayers for show/hideLayer functions legacy 
        drawnItems.addLayer(imageLayer); // makes imageLayer into the map ;)

        const download = () => {
          // download image
        }

        addedLayers.push({
          id: layername,
          layer: result,
          name: layername,
          file_name: layername,
          rectangle: selectedRectangle,
          download: download
        });
        menu_ui.addFileLayer("Geoprocesos", layername, layername, layername);
        break;
      }
      case "buffer": {
        btn_modal_loading = false;
        let namePrefixBuffer = this.namePrefixBuffer;
        let layername = namePrefixBuffer + results_counter;
        results_counter++;

        mapa.addGeoJsonLayerToDrawedLayers(result, layername, true, true);
        addedLayers.push({
          id: layername,
          layer: result,
          name: layername,
          file_name: layername,
          kb: null,
        });
        menu_ui.addFileLayer("Geoprocesos", layername, layername, layername);
        break;
      }
    }
    document.getElementById("select-process").selectedIndex = 0;
    document.getElementsByClassName("form")[1].innerHTML = "";
    new UserMessage(`Geoproceso ejecutado exitosamente.`, true, "information");
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

  updateSliderForWaterRise(sliderLayer) {
    document.getElementById("rangeSlider").classList.remove("hidden");
    document.getElementById("sliderValue").classList.remove("hidden");
    let arraySlider = []; //Array that contains all unique values
    sliderLayer.layer.features.forEach((element) => {
      if (!arraySlider.includes(element.properties.value)) {
        arraySlider.push(element.properties.value);
      }
    });

    document.getElementById("rangeSlider").min = "1";
    document.getElementById("rangeSlider").value = "1";
    document.getElementById("rangeSlider").max = arraySlider.length;
    document.getElementById("sliderValue").innerHTML = arraySlider[0] + " (m)";
    //Update the current slider value (each time you drag the slider handle)
    this.sliderForWaterRise(sliderLayer, rangeSlider, sliderValue, arraySlider);
  }

  setSliderForWaterRise(sliderLayer) {
    //Contains all unique values
    let arraySlider = []; //Array that contains all unique values

    sliderLayer.layer.features.forEach((element) => {
      if (!arraySlider.includes(element.properties.value)) {
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
    this.sliderForWaterRise(sliderLayer, rangeSlider, sliderValue, arraySlider);
  }

  sliderForWaterRise(sliderLayer, rangeSlider, sliderValue, arraySlider) {
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
          let execute = document.getElementById("ejec_gp");
          execute.classList.toggle("disabledbutton") 
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
        $("#ejec_gp").addClass("disabledbutton");
        rectPos = mapa.editableLayers.rectangle;
        formattedArea = L.GeometryUtil.formattedNumber(area / 1000000, 2);
        _area = formattedArea + " km²";

        if (formattedArea > maxSize) {
          isValidRectangle = false;
          $("#ejec_gp").addClass("disabledbutton");
          $("#invalidRect").removeClass("hidden");
        } else if (formattedArea < maxSize) {
          isValidRectangle = true;
          $("#msgRectangle").addClass("hidden");
          $("#invalidRect").addClass("hidden");
          if (
            $("#input-equidistancia").val() >= 10 &&
            $("#input-equidistancia").val() <= 10000
          ) {
            $("#ejec_gp").removeClass("disabledbutton");
          }
        }
        contourRectangles = [];
        return _area;
      };
    } else if (event === "edit-layer") {
      $("#ejec_gp").addClass("disabledbutton");
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
        $("#ejec_gp").addClass("disabledbutton");
        $("#invalidRect").removeClass("hidden");
      } else if (formattedArea < maxSize) {
        isValidRectangle = true;
        $("#msgRectangle").addClass("hidden");
        $("#invalidRect").addClass("hidden");
        if (
          $("#input-equidistancia").val() >= 10 &&
          $("#input-equidistancia").val() <= 10000
        ) {
          $("#ejec_gp").removeClass("disabledbutton");
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
        $("#ejec_gp").addClass("disabledbutton");
        $("#drawRectangleBtn").removeClass("disabledbutton");
        $("#msgRectangle").removeClass("hidden");
        break;

      default:
        break;
    }
  }

  checkPolyline(event) {
    switch (event) {
      case "delete-layer":
        //contourRectangles = [];
        $("#ejec_gp").addClass("disabledbutton");
        $("#drawBtn").removeClass("disabledbutton");
        $("#msgRectangle").removeClass("hidden");
        break;

      default:
        break;
    }
  }


  checkLayersForBuffer() {
    gestorMenu.getActiveLayersWithoutBasemap().forEach((layer) => {
      if (layer) {
        $("#msgNoLayer").addClass("hidden");
        $("#msgRectangle").removeClass("hidden");
        //$("#drawRectangleBtn").removeClass("disabledbutton");
        $('label[for="input-equidistancia"]').show();
        document
          .getElementById("input-equidistancia")
          .classList.remove("hidden");
      }
    });
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
      $("#drawRectangleBtn").addClass("disabledbutton");
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
        if (polyline.layer && polyline.layer.includes(this.namePrefix)) {
          this.setSliderForWaterRise(sliderLayer);
          $("#msgNoContour").addClass("hidden");
          break;
        }
      };

      $('label[for="select-capa"]').show();
      document.getElementById("drawRectangleBtn").classList.add("hidden");
      document.getElementById("select-capa").classList.remove("hidden");
      $("#ejec_gp").addClass("disabledbutton");
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
    //console.log(fields);
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
                  if (layer.id.includes(this.namePrefix)) {
                    options.push({ value: layer.id, text: layer.name });
                    sliderLayer = layer;
                  }
                });
              } else if (this.geoprocessId === "buffer") {
                gestorMenu.getActiveLayersWithoutBasemap().forEach((layer) => {
                  if (layer && gestorMenu.layerIsWmts(layer.name) == false) {
                    options.push({
                      value: layer.name,
                      text: gestorMenu.getLayerData(layer.name).title,
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

            //Select element in "Capa"
            const select = this.optionsForm.addElement("select", selectId, {
              title: field.name,
              events: {
                change: (element) => {
                  if (this.geoprocessId === "contour") {
                    if (!element.value) return;
                    const layer = mapa.getEditableLayer(element.value);
                    mapa.centerLayer(layer);
                  } else if (this.geoprocessId === "waterRise") {
                    if (!element.value) {
                      document.getElementById("rangeSlider").classList.add("hidden");
                      document.getElementById("sliderValue").classList.add("hidden");
                      return;
                    }
                    let selectedLayer = "";
                    addedLayers.forEach((lyr) => {
                      lyr.file_name == element.value
                        ? (selectedLayer = lyr)
                        : null;
                    });
                    if (selectedLayer.layer.features.length != 0) {
                      mapa.centerLayer(selectedLayer.layer);
                      sliderLayer = selectedLayer;
                      this.updateSliderForWaterRise(sliderLayer);
                    }
                  } else if (this.geoprocessId === "buffer") {
                    if (!element.value) {
                      $("#drawRectangleBtn").addClass("disabledbutton");
                      $("#ejec_gp").addClass("disabledbutton");
                    } else {
                      $("#drawRectangleBtn").removeClass("disabledbutton");
                    }
                  } else if (this.geoprocessId === "elevationProfile") {
                    if (!element.value) {
                      $("#ejec_gp").addClass("disabledbutton");
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
                      $("#ejec_gp").removeClass("disabledbutton");
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
        $("#ejec_gp").removeClass("disabledbutton");
      } else if (
        $("#input-equidistancia").val() < 10 ||
        $("#input-equidistancia").val() > 10000
      ) {
        $("#ejec_gp").addClass("disabledbutton");
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
        $("#drawRectangleBtn").addClass("disabledbutton");
        drawingRectangle.enable();
        this.checkRectangleArea("add-layer");
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

    $("#ejec_gp").addClass("disabledbutton"); //Execute Button disabled from the start
    this.buildOptionFormMessages(sliderLayer); //Form Messages & Slider
  }


  executeBuffer() {
    let drawnRectangle;
    mapa.editableLayers.rectangle.forEach((lyr) => {
      drawnRectangle = lyr;
    });
    let layerSelected;
    gestorMenu.getActiveLayersWithoutBasemap().forEach((layer) => {
      let selctedLayerName = document.getElementById("select-capa").value;
      layer.name === selctedLayerName
        ? (layerSelected = layer)
        : console.info("Layer not found.");
    });

    let coords = getGeometryCoords(drawnRectangle);

    let distanceBuffer =
      document.getElementById("input-equidistancia").value / 1000;

    this.loadingBtn("on");
    let buffer = getLayerDataByWFS(coords, drawnRectangle.type, layerSelected)
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
        this.loadingBtn("off");
      });

    let lastRectangle = mapa.getEditableLayers().rectangle.length - 1;
    mapa.deleteLayer(mapa.getEditableLayers().rectangle[lastRectangle].name);
  }

  executeGeoprocess(formFields) {
    let values = [];
    let arrayWaterRise = "";
    let valueOfWaterRise;
    contourRectangles = [];
    for (let i = 0; i < formFields.length; i++) {
      if (
        formFields[i].hasAttribute("references") &&
        formFields[i].getAttribute("references") === "drawedLayers"
      ) {
        let layer;
        mapa.editableLayers.rectangle.forEach((lyr) => {
          layer = lyr;
        });

        layer != null ? (this.editableLayer_name = layer.name) : null;

        switch (this.geoprocessId) {
          case "contour": {
            const sw = layer.getBounds().getSouthWest();
            values.push(sw.lng);
            values.push(sw.lat);
            const ne = layer.getBounds().getNorthEast();
            values.push(ne.lng);
            values.push(ne.lat);
            break;
          }
          case "waterRise": {
            addedLayers.forEach((layer) => {
              if (layer.id == document.getElementById("select-capa").value) {
                layer.rectangle._latlngs[0].forEach((coord) => {
                  arrayWaterRise += coord.lng + " " + coord.lat + ",";
                });
                arrayWaterRise +=
                  layer.rectangle._latlngs[0][0].lng +
                  " " +
                  layer.rectangle._latlngs[0][0].lat;
              }
            });

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
    this.loadingBtn("on");
    if (this.geoprocessId === "contour") {
      this.geoprocessing
        .execute(...values)
        .then((result) => {
          this.displayResult(result);
        })
        .catch((error) => {
          new UserMessage(error.message, true, "error");
          this.loadingBtn("off");
        });
    } else if (this.geoprocessId === "waterRise") {
      let waterRise = new GeoserviceFactory.WaterRise(
        this.geoprocessing.host,
        this.geoprocessing.mdeLayerFullname
      );
      waterRise
        .execute(arrayWaterRise, valueOfWaterRise)
        .then((result) => {
          this.displayResult(result);
        })
        .catch((error) => {
          new UserMessage(error.message, true, "error");
          this.loadingBtn("off");
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
            return;
          }
          this.geoprocessId = element.value;

          //Auto show layer for waterRise and buffer
          if (this.geoprocessId == "waterRise") {
            addedLayers.forEach((layer) => {
              if (layer.id.includes(this.namePrefix)) {
                setTimeout(function () {
                  $("#select-capa").val(layer.name).change();
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
            let layerForBuffer = gestorMenu.getActiveLayersWithoutBasemap()[0];
            if (
              layerForBuffer &&
              gestorMenu.layerIsWmts(layerForBuffer.name) == false
            ) {
              setTimeout(function () {
                $("#select-capa").val(layerForBuffer.name).change();
                $("#drawRectangleBtn").removeClass("disabledbutton");
              }, 500);
            }
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

  loadingBtn(status) {
    let btn_ejecutar = document.getElementById("ejec_gp");
    if (status === "on") {
      btn_ejecutar.innerHTML =
        '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i>';
      $("#ejec_gp").addClass("disabledbutton");
    } else if (status === "off") {
      btn_ejecutar.innerHTML = "Ejecutar";
      $("#ejec_gp").removeClass("disabledbutton");
    }
  }

  updateLayerSelect(layerName, addToList) {
    let select = document.getElementById("select-capa"),
      option = document.createElement("option");
    option.value = layerName;
    option.innerHTML = gestorMenu.getLayerData(layerName).title;

    if(layerName.includes('polyline') && select !== null){
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
            $("#drawRectangleBtn").addClass("disabledbutton");
            $("#ejec_gp").addClass("disabledbutton");
          }
        }
      }
    }

    if (select && this.geoprocessId === "buffer") {
      if (addToList && gestorMenu.layerIsWmts(layerName) == false) {
        for (let i = 0; i < select.length; i++) {
          if (select[i].value !== layerName) {
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
            $("#drawRectangleBtn").addClass("disabledbutton");
            $("#ejec_gp").addClass("disabledbutton");
          }
        }
      }
    }
  }
}