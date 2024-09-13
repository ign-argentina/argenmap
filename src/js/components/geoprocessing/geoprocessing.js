let g_modal_close = true;
let btn_modal_loading = false;
let process = {};
let contourRectangles = [];
let isValidRectangle = false;
let isSelectionDrawingActive = false;
let counterContour = 0,
  counterHeight = 0,
  counterBuffer = 0,
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
    elevationProfile: "perfil_de_elevacion_",
  };

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
    const btnElement = document.createElement("button");
    btnElement.classList = "ag-btn ag-btn-primary menu-section-btn";
    btnElement.id = "geoprocesos-btn";
    //btnElement.ariaLabel = "Geoprocesos";
    btnElement.title = "Geoprocesos";

    // Icon options: fa-microchip, fa-screwdriver-wrench, fa-toolbox, fa-wand-magic-sparkles
    // btnElement.innerHTML = `<i class="fa-solid fa-wrench"></i>`;
    btnElement.innerHTML = `<svg width="24" height="23" viewBox="0 0 74 73" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M44.2008 19.9065L47.2008 25.0965C47.3999 25.4408 47.7277 25.6918 48.1119 25.7945C48.4961 25.8972 48.9054 25.843 49.2498 25.644L51.3438 24.435C52.2138 25.1205 53.1753 25.683 54.1863 26.103V28.5C54.1863 28.8978 54.3443 29.2794 54.6256 29.5607C54.9069 29.842 55.2884 30 55.6863 30H61.6863C62.0841 30 62.4656 29.842 62.7469 29.5607C63.0282 29.2794 63.1863 28.8978 63.1863 28.5V26.103C64.2052 25.6788 65.1615 25.1176 66.0288 24.435L68.1228 25.644C68.8383 26.0565 69.7593 25.809 70.1718 25.0965L73.1718 19.9065C73.3692 19.5618 73.4224 19.1531 73.3199 18.7693C73.2173 18.3855 72.9673 18.0578 72.6243 17.8575L70.5663 16.668C70.7271 15.5617 70.7261 14.438 70.5633 13.332L72.6213 12.1425C73.3353 11.73 73.5828 10.8075 73.1688 10.0935L70.1688 4.9035C69.9696 4.55925 69.6419 4.30818 69.2576 4.20551C68.8734 4.10284 68.4641 4.15697 68.1198 4.356L66.0258 5.565C65.1596 4.88157 64.2037 4.32032 63.1848 3.897V1.5C63.1848 1.10218 63.0267 0.720644 62.7454 0.43934C62.4641 0.158035 62.0826 0 61.6848 0H55.6848C55.2869 0 54.9054 0.158035 54.6241 0.43934C54.3428 0.720644 54.1848 1.10218 54.1848 1.5V3.897C53.1658 4.32121 52.2095 4.88238 51.3423 5.565L49.2498 4.356C49.0793 4.25725 48.8911 4.19308 48.6958 4.16715C48.5005 4.14123 48.302 4.15406 48.1117 4.20491C47.9214 4.25576 47.743 4.34364 47.5867 4.46351C47.4304 4.58338 47.2992 4.73289 47.2008 4.9035L44.2008 10.0935C44.0033 10.4382 43.9501 10.8469 44.0527 11.2307C44.1552 11.6145 44.4052 11.9422 44.7483 12.1425L46.8063 13.332C46.6445 14.4381 46.6445 15.5619 46.8063 16.668L44.7483 17.8575C44.0343 18.27 43.7868 19.1925 44.2008 19.9065ZM58.6848 9C61.9938 9 64.6848 11.691 64.6848 15C64.6848 18.309 61.9938 21 58.6848 21C55.3758 21 52.6848 18.309 52.6848 15C52.6848 11.691 55.3758 9 58.6848 9Z" fill="#fff" />
      <path d="M25 23C20.7853 23.0096 16.6413 24.0848 12.9533 26.1252L16.0248 28.2859L20.4927 26.7576L23.2363 27.3848L24.2162 32.95L25.9015 31.6567L30.4871 30.0891L32.525 33.1853L28.5272 35.3017L26.0191 37.1044L25.7448 39.6127L22.9622 41.9643L22.1783 45.7661L20.6106 45.8836L21.3944 41.5722L15.4762 41.2589L14.0655 43.3359L14.0544 43.3348V46.3085L16.9365 46.5301L19.597 48.4146L19.3753 51.2414L23.1443 51.9066L23.1041 51.9914L29.0198 48.5809L39.1626 55.1767L36.8735 60.595L33.2257 62.8445L26.4017 71.546L24.8952 71.1169L25.6938 60.1652L20.9825 55.4539L21.8589 53.907L18.9871 52.8488L16.1605 49.4124L13.7215 48.858L9.4221 42.6429H8.92857L8.35748 45.6279L7.95123 41.2589L8.53906 38.0059L8.46094 35.4191L7.28203 30.3884C2.62455 35.067 0.00669643 41.3981 0 48C0 61.8071 11.1929 73 25 73C34.1979 72.9969 42.6512 67.9433 47.0084 59.843L45.8504 52.7031L45.2232 48.6663L41.4219 45.6092L42.1663 41.3763L43.93 39.1032L48.1214 38.5396C44.2819 29.148 35.1465 23.008 25 23ZM34.9383 28.3571H37.5V33.7143L33.9286 35.5V32.8397L34.9383 28.3571ZM21.2374 46.9417L24.5689 47.4906L24.0987 48.196L21.3944 47.6473L21.2374 46.9417Z" fill="#fff" />
    </svg>
    `;

    btnElement.onclick = () => {
      if (g_modal_close) {
        geoProcessingManager.createModal();
        g_modal_close = false;
      } else {
        //Close geoprocess window and clear
        this.closeModal();
      }
    };
    document.querySelector("#botonera").append(btnElement);
  }

  closeModal() {
    document.getElementsByClassName("leaflet-draw-draw-rectangle")[0].style =
      "";
    document.getElementsByClassName("leaflet-draw-draw-polyline")[0].style = "";
    document.getElementById("select-process").selectedIndex = 0;
    document.getElementsByClassName("form")[1].innerHTML = "";
    document.getElementById("mr").remove();
    g_modal_close = true;
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
    this.getProcesses().forEach((process) => {
      if (process.namePrefix) {
        this.GEOPROCESS[process.geoprocess] = process.namePrefix;
      }
    });
  }

  set namePrefix(processId) {
    this._namePrefix = this.GEOPROCESS[processId];
  }

  get namePrefix() {
    return this._namePrefix;
  }

  displayResult(result, chosenRectangle) {
    let layerType = "geoprocess",
      sectionName = "Geoprocesos";

    switch (this.geoprocessId) {
      case "contour": {
        btn_modal_loading = false;
        this.contour_result_active = true;
        let style_fix_textpath = document.createElement("style");
        style_fix_textpath.id = "fix-textpath";
        style_fix_textpath.innerHTML = `.leaflet - pane svg text { font - size: 0.8em; } `;

        document.head.appendChild(style_fix_textpath);
        let layername = this.namePrefix + counterContour;
        counterContour++;

        mapa
          .getEditableLayer(this.editableLayer_name)
          .setStyle({ fillOpacity: 0 });
        let resultGeoJson = mapa.createLayerFromGeoJSON(result, layername);
        addLayerToAllGroups(resultGeoJson, layername);

        let selectedRectangle = mapa.editableLayers.rectangle.at(-1);
        selectedRectangle._uneditable = true; //aux to disallow editing the layer
        selectedRectangle.process = layername; //aux to relate contour with waterRise
        mapa.groupLayers[layername].push(selectedRectangle.name); // hack for including rectangle in contour lines layer

        result.features.push(selectedRectangle.getGeoJSON()); //include rectangle in contour lines addedLayers

        addedLayers.push({
          id: layername,
          layer: result,
          name: layername,
          file_name: layername,
          rectangle: selectedRectangle,
          type: layerType,
          isActive: true,
          section: sectionName,
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

        menu_ui.addFileLayer(
          sectionName,
          layerType,
          layername,
          layername,
          layername,
          true,
        );
        updateNumberofLayers(sectionName);
        break;
      }
      case "waterRise": {
        btn_modal_loading = true;
        const height = this.lastHeightProcessed;
        let layername = `${this.namePrefix + counterHeight}_${height} m`;
        counterHeight++;

        let selectedRectangle;
        mapa.editableLayers.rectangle.forEach((rect) => {
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
        const options = { opacity: 0.3, pane: "heightPane" };

        let imageLayer = L.imageOverlay(imageUrl, imageBounds, options); // makes leaflet image overlay from received blob
        imageLayer.title = layername;
        imageLayer.name = layername;
        imageLayer._uneditable = true;

        mapa.addLayerToGroup(imageLayer, layername, layername); // adds imageLayer to mapa.groupLayers

        const type = layername.split("_")[0]; // gets gruop name without count number

        if (!mapa.editableLayers[type]) {
          mapa.editableLayers[type] = [];
        }
        mapa.editableLayers[type].push(imageLayer); // adds new custom type into editableLayers for show/hideLayer functions legacy
        drawnItems.addLayer(imageLayer); // makes imageLayer into the map

        const title = `${imageLayer.name} `;
        const download = () => {
          const latlngs = selectedRectangle.getLatLngs()[0];
          const coords = `${latlngs[0].lng} ${latlngs[0].lat}, ${latlngs[1].lng} ${latlngs[1].lat},${latlngs[2].lng} ${latlngs[2].lat},${latlngs[3].lng} ${latlngs[3].lat},${latlngs[0].lng} ${latlngs[0].lat} `;

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
          section: sectionName,
        });

        menu_ui.addFileLayer(
          sectionName,
          layerType,
          layername,
          layername,
          layername,
          true,
        );
        updateNumberofLayers(sectionName);

        break;
      }
      case "buffer": {
        btn_modal_loading = false;
        let layername = this.namePrefix + counterBuffer;
        counterBuffer++;

        let resultGeoJson = mapa.createLayerFromGeoJSON(result, layername);
        addLayerToAllGroups(resultGeoJson, layername);

        mapa.editableLayers.polygon.forEach((lyr) => {
          if (lyr.id === layername) {
            lyr._uneditable = true; //aux to disallow editing the layer
          }
        });

        addedLayers.push({
          id: layername,
          layer: result,
          name: layername,
          file_name: layername,
          type: layerType,
          isActive: true,
          section: sectionName,
        });
        menu_ui.addFileLayer(
          sectionName,
          layerType,
          layername,
          layername,
          layername,
          true,
        );
        updateNumberofLayers(sectionName);

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
      if (
        !arraySlider.includes(element.properties.value) &&
        element.geometry.type == "LineString"
      ) {
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
    $("#ejec_gp").removeClass("ag-btn-disabled");

    //Contains all unique values
    let arraySlider = []; //Array that contains all unique values

    sliderLayer.layer.features.forEach((element) => {
      if (
        !arraySlider.includes(element.properties.value) &&
        element.geometry.type == "LineString"
      ) {
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
        $("#ejec_gp").addClass("ag-btn-disabled");
        rectPos = mapa.editableLayers.rectangle;
        formattedArea = L.GeometryUtil.formattedNumber(area / 1000000, 2);
        _area = formattedArea + " km²";

        if (formattedArea > maxSize) {
          isValidRectangle = false;
          $("#ejec_gp").addClass("ag-btn-disabled");
          $("#invalidRect").removeClass("hidden");
        } else if (formattedArea < maxSize) {
          isValidRectangle = true;
          $("#msgRectangle").addClass("hidden");
          $("#invalidRect").addClass("hidden");
          if (
            $("#input-equidistancia").val() >= 10 &&
            $("#input-equidistancia").val() <= 10000
          ) {
            $("#ejec_gp").removeClass("ag-btn-disabled");
          }
        }
        contourRectangles = [];
        return _area;
      };
    } else if (event === "edit-layer") {
      $("#ejec_gp").addClass("ag-btn-disabled");
      rectPos = mapa.editableLayers.rectangle;

      contourRectangles.push(rectPos[rectPos.length - 1]);
      rectangleArea = L.GeometryUtil.geodesicArea(
        contourRectangles[contourRectangles.length - 1].getLatLngs()[0],
      );
      formattedArea = L.GeometryUtil.formattedNumber(
        rectangleArea / 1000000,
        2,
      );

      if (formattedArea > maxSize) {
        isValidRectangle = false;
        $("#ejec_gp").addClass("ag-btn-disabled");
        $("#invalidRect").removeClass("hidden");
      } else if (formattedArea < maxSize) {
        isValidRectangle = true;
        $("#msgRectangle").addClass("hidden");
        $("#invalidRect").addClass("hidden");
        if (
          $("#input-equidistancia").val() >= 10 &&
          $("#input-equidistancia").val() <= 10000
        ) {
          $("#ejec_gp").removeClass("ag-btn-disabled");
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
        $("#ejec_gp").addClass("ag-btn-disabled");
        $("#drawRectangleBtn").removeClass("ag-btn-disabled");
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
              $("#ejec_gp").removeClass("ag-btn-disabled");
            }, 500);
          }
        });
        break;

      case "delete-layer":
        document.getElementById("select-capa").selectedIndex = 0;
        $("#ejec_gp").addClass("ag-btn-disabled");
        $("#drawBtn").removeClass("ag-btn-disabled");
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
    addedLayers.forEach((lyr) => {
      if (lyr.type === "WMS") {
        isBuffer = true;
      }
    });
    if (isBuffer) {
      $("#msgNoLayer").addClass("hidden");
      $("#msgRectangle").removeClass("hidden");
      //$("#drawRectangleBtn").removeClass("disabledbutton");
      $('label[for="input-equidistancia"]').show();
      document.getElementById("input-equidistancia").classList.remove("hidden");
    }
  }

  buildOptionFormMessages(sliderLayer) {
    //Contour & Buffer Rectangle Message
    let rectSizeMsg = document.createElement("div");
    rectSizeMsg.innerHTML =
      "Se superó el limite. <br> Edite o elimine el rectángulo.";
    rectSizeMsg.id = "invalidRect";
    document.getElementsByClassName("form")[1].appendChild(rectSizeMsg);
    $("#invalidRect").addClass("hidden");

    let layerMessage = document.createElement("div");
    layerMessage.id = "msgRectangle";

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
      $("#drawRectangleBtn").addClass("ag-btn-disabled");
      document.getElementById("input-equidistancia").classList.add("hidden");
      document.getElementById("select-capa").classList.remove("hidden");

      this.checkLayersForBuffer();
    }

    //Cota Messages & Slider
    else if (this.geoprocessId === "waterRise") {
      let message = document.createElement("div");
      message.innerHTML = "No hay Curvas de Nivel";
      message.id = "msgNoContour";
      document.getElementsByClassName("form")[1].appendChild(message);
      $("#msgRectangle").addClass("hidden");

      for (let polyline of mapa.editableLayers.polyline) {
        if (
          polyline.layer &&
          polyline.layer.includes(this.GEOPROCESS.contour)
        ) {
          this.setSliderHeight(sliderLayer);
          $("#msgNoContour").addClass("hidden");
          break;
        }
      }

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
            const selectId = `select - ${id} `;

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
                    gestorMenu.getLayerData(layer.name).title
                      ? (layerTitle = gestorMenu.getLayerData(layer.name).title)
                      : (layerTitle = layer.name);
                    options.push({
                      value: layer.name,
                      text: layerTitle,
                    });
                  }
                });
                addedLayers.forEach((lyr) => {
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
                      document
                        .getElementById("rangeSlider")
                        .classList.add("hidden");
                      document
                        .getElementById("sliderValue")
                        .classList.add("hidden");
                      $("#ejec_gp").addClass("ag-btn-disabled");
                      return;
                    }
                    addedLayers.forEach((lyr) => {
                      lyr.id == element.value ? (selectedLayer = lyr) : null;
                    });
                    if (selectedLayer.layer.features.length != 0) {
                      this.resetHeightLayerColor();
                      mapa.centerLayer(selectedLayer.layer);

                      sliderLayer = selectedLayer;
                      this.updateSliderHeight(sliderLayer);
                      $("#ejec_gp").removeClass("ag-btn-disabled");
                    }
                  } else if (this.geoprocessId === "buffer") {
                    if (!element.value) {
                      $("#drawRectangleBtn").addClass("ag-btn-disabled");
                      $("#ejec_gp").addClass("ag-btn-disabled");
                    } else {
                      this.checkLayersForBuffer();
                      $("#drawRectangleBtn").removeClass("ag-btn-disabled");
                    }
                  } else if (this.geoprocessId === "elevationProfile") {
                    if (!element.value) {
                      $("#ejec_gp").addClass("ag-btn-disabled");
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
                      $("#ejec_gp").removeClass("ag-btn-disabled");
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
            const inputId = `input - ${id} `;
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
        $("#ejec_gp").removeClass("ag-btn-disabled");
      } else if (
        $("#input-equidistancia").val() < 10 ||
        $("#input-equidistancia").val() > 10000
      ) {
        $("#ejec_gp").addClass("ag-btn-disabled");
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
        $("#drawRectangleBtn").addClass("ag-btn-disabled");
        drawingRectangle.enable();
        this.checkRectangleArea("add-layer");
        isSelectionDrawingActive = true;
      },
      "drawRectangleBtn",
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
      "ejec_gp",
    );

    $("#ejec_gp").addClass("ag-btn-disabled"); //Execute Button disabled from the start
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

    allLayers.forEach((lyr) => {
      if (lyr.name === selctedLayerName) {
        layerSelected = lyr.layer;
      }
    });

    let coords = getGeometryCoords(drawnRectangle);

    let distanceBuffer =
      document.getElementById("input-equidistancia").value / 1000;

    loadingBtn("on", "ejec_gp");

    let buffer;
    if (!layerSelected.host) {
      try {
        let arrayForBuffer = [],
          selecCoords = drawnRectangle.getGeoJSON(),
          within;

        turf.featureEach(layerSelected, function (feature) {
          within = turf.booleanIntersects(feature, selecCoords);
          if (within) {
            arrayForBuffer.push(feature);
          }
        });
        let bufferFeature = turf.featureCollection(arrayForBuffer);
        buffer = turf.buffer(bufferFeature, distanceBuffer);
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

        drawnRectangle != null
          ? (this.editableLayer_name = drawnRectangle.name)
          : null;

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
            mapa.editableLayers.rectangle.forEach((rect) => {
              if (
                rect.process === document.getElementById("select-capa").value
              ) {
                selectedRectangle = rect;
                rect._latlngs[0].forEach((coord) => {
                  arrayWaterRise += coord.lng + " " + coord.lat + ",";
                });
                arrayWaterRise +=
                  rect._latlngs[0][0].lng + " " + rect._latlngs[0][0].lat;
              }
            });

            let waterRiseValue =
              document.getElementById("sliderValue").innerHTML;
            waterRiseValue = waterRiseValue.substring(
              0,
              waterRiseValue.length - 4,
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
        this.geoprocessing.mdeLayerFullname,
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
            let layerForBuffer = getAllActiveLayers()[0];

            if (
              layerForBuffer &&
              gestorMenu.layerIsWmts(layerForBuffer.name) == false
            ) {
              setTimeout(function () {
                $("#select-capa").val(layerForBuffer.name).change();
                $("#drawRectangleBtn").removeClass("ag-btn-disabled");
              }, 500);
            }
          }
          if (this.geoprocessId !== "waterRise") {
            this.resetHeightLayerColor();
          }

          const item = this.geoprocessingConfig.availableProcesses.find(
            (e) => e.geoprocess === this.geoprocessId,
          );

          this.process = {
            contour: GeoserviceFactory.Contour,
            elevationProfile: IElevationProfile,
            waterRise: GeoserviceFactory.WaterRise,
            buffer: GeoserviceFactory.Contour,
          };

          this.geoprocessing = new this.process[this.geoprocessId](
            item.baseUrl,
            item.layer,
          );
          this.buildOptionForm(this.geoprocessing.getFields());
          //this.namePrefix = item.namePrefix;
        },
      },
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
        "add-layer",
      );
      mapa.addMethodToEvent(
        this.updateReferencedDrawedLayers.bind(this, "delete-layer"),
        "delete-layer",
      );
      mapa.addMethodToEvent(
        this.updateReferencedDrawedLayers.bind(this, "edit-layer"),
        "edit-layer",
      );
    }
    return this.formContainer;
  }

  updateLayerSelect(layerName, addToList) {
    //updates elvePorfile polylines & buffer
    let select = document.getElementById("select-capa"),
      option = document.createElement("option");
    option.value = layerName;
    option.innerHTML = gestorMenu.getLayerData(layerName).title;

    if (layerName.includes("polyline") && select !== null) {
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
            $("#drawRectangleBtn").addClass("ag-btn-disabled");
            $("#ejec_gp").addClass("ag-btn-disabled");
          }
        }
      }
    }

    if (select && this.geoprocessId === "buffer") {
      if (addToList && gestorMenu.layerIsWmts(layerName) == false) {
        for (let i = 0; i < select.length; i++) {
          if (
            select[i].value !== layerName &&
            option.innerHTML !== "undefined"
          ) {
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
            $("#drawRectangleBtn").addClass("ag-btn-disabled");
            $("#ejec_gp").addClass("ag-btn-disabled");
          }
        }
      }
    }
  }
}
