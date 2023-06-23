let upload_files = null;
let currentLayers = [];
let addedLayers = [];
let fileLayerGroup = [];
let open = false;
let control_btn_add_layer = false;

class IconModalGeojson {
  // constructor() {
  //   // this.component = `
  //   // <div data-html2canvas-ignore="true" class="center-flex" id="modalgeojson" title="Abrir Archivos">
  //   //     <div class="center-flex" id="iconopenfile-container" onClick=uimodalfs.clickOpenFileIcon()>
  //   //         <span id="spanopenfolder" class="fa fa-folder-open" aria-hidden="true" ></span>
  //   //     </button>
  //   // </div>
  //   // `;
  // }

  createComponent() {
    // const elem = document.createElement("div");
    // elem.innerHTML = this.component;
    // document.getElementById("mapa").appendChild(elem);

    return uimodalfs.clickOpenFileIcon();
  }
}

class UImf {
  createElement(element, id, className) {
    let aux = document.createElement(element);
    if (id) {
      aux.id = id;
    }
    if (className) {
      aux.className = className;
    }
    return aux;
  }

  createModal() {

    let divContainer = document.createElement("div")
    divContainer.id = "modalOpenFile"
    divContainer.className = "modalOpenFile"

    let mainIcons = document.createElement("div")
    mainIcons.className = "icons-modalfile"

    let f_sec = document.createElement("section")
    f_sec.style = "width:95%"

    let s_sec = document.createElement("section")
    s_sec.style = "width:5%"
    let btnclose = document.createElement("a")
    btnclose.id = "btnclose-icon-modalfile"
    btnclose.className = "icon-modalfile"
    btnclose.innerHTML = '<i title="cerrar" class="fa fa-times icon_close_mf" aria-hidden="true"></i>';
    btnclose.onclick = function () {
      document.body.removeChild(modalOpenFile);
      document.getElementById("iconopenfile-container").disabled = false;
      document.getElementById("modalgeojson").style.color = "black";
      open = false;
      currentLayers = [];
    };
    s_sec.append(btnclose);

    mainIcons.append(f_sec)
    mainIcons.append(s_sec)


    let tab_div = document.createElement("div")
    tab_div.className = "tabs_upload"
    tab_div.innerHTML = `
    <span style="font-size:12px;color:#37bbed;margin:0px 10px;text-align:center">Formatos Disponibles: KML,GeoJson, GPX, SHP en formato (.zip), WKT en formato (.txt o .wkt), TopoJSON en formato (.json)</span>`


    let mainContainerFile = document.createElement("div")
    mainContainerFile.id = "file_gestor"
    mainContainerFile.style = "width:80%;margin:0 auto"




    // Add from

    // let mainContainerFile = document.getElementById("file_gestor")

    let logo_upload = document.createElement("div")
    logo_upload.className = "wrapper"

    let divaux = document.createElement("div")
    divaux.id = "logo_upload_container"
    divaux.className = "upload"

    let main_inputfile = document.createElement("input")
    main_inputfile.accept = ".txt,.json,.geojson,.wkt,.kml,.zip,.gpx"
    main_inputfile.id = "input_uploadfile"
    main_inputfile.name = "file"
    main_inputfile.type = "file"
    main_inputfile.className = "file-input"
    main_inputfile.style = "opacity: 0.0;top: 0; left: 0; bottom: 0;right: 0;"
    main_inputfile.addEventListener("change", function (e) {
      // Fix Chrome bug: change event fires on cancel when previous file was uploaded
      if (!e.target.files[0]) return;

      let ui_upload = new UImf();

      //FileReader.onload --->ui_upload.logoAnimation()
      ui_upload.logoAnimation()

      // Initialize File Layer
      let fileLayer = new FileLayer();
      // Give uploaded file to fileLayer
      fileLayer.handleFile(e.target.files[0]).then(() => {
        //active btn add layer
        ui_upload.enabledbtnCapa()
        // Stop load animation
        ui_upload.reload_logo();
        // Show the uploaded file

        // Check if the file was loaded in the current dialog
        let existsInCurrent = currentLayers.filter((e) => {
          return e.file_name == fileLayer.getFileName()
        })
        // Check if the file was load previously
        let existsInAdded = addedLayers.filter((e) => {
          return e.file_name == fileLayer.getFileName()
        })

        // Set the name, short or add number of ocurrencies
        let name;
        if (existsInCurrent.length || existsInAdded.length) {
          let exists = existsInCurrent.length + existsInAdded.length;
          name = stringShortener(fileLayer.getFileName(), 13, false) + `..(${exists})`;
        } else {
          name = stringShortener(fileLayer.getFileName(), 16, true);
        }

        // Add to current layers to add to the layers menu later
        if (fileLayer.layerData.process) {
          currentLayers.push({
            id: fileLayer.getId(),
            layer: fileLayer.getGeoJSON(),
            name: name,
            process: fileLayer.layerData.process,
            file_name: fileLayer.getFileName(),
            kb: fileLayer.getFileSize('kb')
          });
        } else {
          currentLayers.push({
            id: fileLayer.getId(),
            layer: fileLayer.getGeoJSON(),
            name: name,
            file_name: fileLayer.getFileName(),
            kb: fileLayer.getFileSize('kb')
          });
        }

        // Show in the dialog
        ui_upload.addFileItem(fileLayer.getId());


      }).catch((error) => {
        console.warn('Hay error: ', error);
        new UserMessage(error, true, 'error');
        ui_upload.reload_logo();
      })

    });

    let faicon = document.createElement("i")
    faicon.id = "logo_up"
    faicon.className = "fas fa-file-circle-plus"

    let ptitle = document.createElement("p")
    ptitle.innerHTML = "Abrir Archivo"

    divaux.append(main_inputfile)
    divaux.append(faicon)
    divaux.append(ptitle)
    divaux.onclick = function () {
      let aux = document.getElementById("input_uploadfile")
      aux.click();
    }

    logo_upload.append(divaux)

    let section_load = document.createElement("section")
    section_load.className = "uploaded-area"
    section_load.id = "uploaded-area"

    let btnCapa = document.createElement("button")
    btnCapa.id = "btn-upload-agregar-capa"
    btnCapa.className = "btn btn-info disabled"
    btnCapa.style = "width:100%; margin:20px 0px 10px 0px"
    btnCapa.innerHTML = "Agregar Capa"
    btnCapa.onclick = function () {

      if (control_btn_add_layer) {
        addLayersfromFiles();
        new UserMessage(`Capas agregadas exitosamente.`, true, "information");
      }

      // if (control_btn_add_layer) { old version
      //   addLayersfromFiles()
      // }
    }

    // mainIcons
    // tab_div
    // mainContainerFile

    mainContainerFile.append(tab_div)
    mainContainerFile.append(logo_upload)
    mainContainerFile.append(section_load)
    mainContainerFile.append(btnCapa)




    return mainContainerFile;
    // document.body.appendChild(divContainer);


    // $( "#modalOpenFile" ).draggable({
    //   containment: "#mapa"})
  }



  // addForm() {

  //   let contenedor_principal = document.getElementById("file_gestor")

  //   let logo_upload = document.createElement("div")
  //   logo_upload.className = "wrapper"

  //   let divaux = document.createElement("div")
  //   divaux.id = "logo_upload_container"
  //   divaux.className = "upload"

  //   let main_inputfile = document.createElement("input")
  //   main_inputfile.accept = ".txt,.json,.geojson,.wkt,.kml,.zip,.gpx"
  //   main_inputfile.id = "input_uploadfile"
  //   main_inputfile.name = "file"
  //   main_inputfile.type = "file"
  //   main_inputfile.className = "file-input"
  //   main_inputfile.style = "opacity: 0.0;top: 0; left: 0; bottom: 0;right: 0;"
  //   main_inputfile.addEventListener("change", function (e) {
  //     // Fix Chrome bug: change event fires on cancel when previous file was uploaded
  //     if (!e.target.files[0]) return;

  //     let ui_upload = new UImf();

  //     //FileReader.onload --->ui_upload.logoAnimation()
  //     ui_upload.logoAnimation()

  //     // Initialize File Layer
  //     let fileLayer = new FileLayer();
  //     // Give uploaded file to fileLayer
  //     fileLayer.handleFile(e.target.files[0]).then(() => {
  //       //active btn add layer
  //       ui_upload.enabledbtnCapa()
  //       // Stop load animation
  //       ui_upload.reload_logo();
  //       // Show the uploaded file

  //       // Check if the file was loaded in the current dialog
  //       let existsInCurrent = currentLayers.filter((e) => {
  //         return e.file_name == fileLayer.getFileName()
  //       })
  //       // Check if the file was load previously
  //       let existsInAdded = addedLayers.filter((e) => {
  //         return e.file_name == fileLayer.getFileName()
  //       })

  //       // Set the name, short or add number of ocurrencies
  //       let name;
  //       if (existsInCurrent.length || existsInAdded.length) {
  //         let exists = existsInCurrent.length + existsInAdded.length;
  //         name = stringShortener(fileLayer.getFileName(), 13, false) + `..(${exists})`;
  //       } else {
  //         name = stringShortener(fileLayer.getFileName(), 16, true);
  //       }


  //       // Add to current layers to add to the layers menu later
  //       currentLayers.push({
  //         id: fileLayer.getId(),
  //         layer: fileLayer.getGeoJSON(),
  //         name: name,
  //         file_name: fileLayer.getFileName(),
  //         kb: fileLayer.getFileSize('kb')
  //       });

  //       // Show in the dialog
  //       ui_upload.addFileItem(fileLayer.getId());


  //     }).catch((error) => {
  //       console.warn('Hay error: ', error);
  //       new UserMessage(error, true, 'error');
  //       ui_upload.reload_logo();
  //     })

  //   });

  //   let faicon = document.createElement("i")
  //   faicon.id = "logo_up"
  //   faicon.className = "fas fa-arrow-circle-up"

  //   let ptitle = document.createElement("p")
  //   ptitle.innerHTML = "Abrir Archivo"

  //   divaux.append(main_inputfile)
  //   divaux.append(faicon)
  //   divaux.append(ptitle)
  //   divaux.onclick = function () {
  //     let aux = document.getElementById("input_uploadfile")
  //     aux.click();
  //   }

  //   logo_upload.append(divaux)

  //   let section_load = document.createElement("section")
  //   section_load.className = "uploaded-area"
  //   section_load.id = "uploaded-area"

  //   let btnCapa = document.createElement("button")
  //   btnCapa.id = "btn-upload-agregar-capa"
  //   btnCapa.className = "btn btn-info disabled"
  //   btnCapa.style = "width:100%; margin:20px 0px 10px 0px"
  //   btnCapa.innerHTML = "Agregar Capa"
  //   btnCapa.onclick = function () {
  //     if (control_btn_add_layer) addLayersfromFiles()
  //   }

  //   contenedor_principal.append(logo_upload)
  //   contenedor_principal.append(section_load)
  //   contenedor_principal.append(btnCapa)

  // }

  logoAnimation() {
    let logo = document.getElementById("logo_up")
    logo.className = "fas fa-circle-notch fa-spin"
  }

  reload_logo() {
    let logo = document.getElementById("logo_up")
    logo.className = "fas fa-file-circle-check"
  }

  addFileItem(id) {
    let i_id = getIndexCurrentFileLayerbyID(id)
    let kb = currentLayers[i_id].kb
    let del_index = i_id

    let id_item = "item_uf_" + id
    let contenedor = document.getElementById("uploaded-area")
    let file_item = document.createElement("li")
    file_item.id = id_item
    file_item.className = "row"

    let content_upload = document.createElement("div")
    content_upload.className = "content upload"

    let i_file_alt = document.createElement("i")
    i_file_alt.style = "width: 20%;"
    i_file_alt.className = "fas fa-file-alt"

    let div_details = document.createElement("div")
    div_details.className = "details"
    div_details.style = "width: 70%;"

    let span_name = document.createElement("span")
    span_name.className = "name"
    span_name.title = "Editar Nombre de Capa"
    span_name.innerHTML = currentLayers[i_id].name
    span_name.onclick = function () {
      span_name.style = "display:none;"
      finput_name.value = currentLayers[i_id].name
      finput_name.style = "display:block"
      finput_name.focus()
    }

    let finput_name = document.createElement("input")
    finput_name.className = "form-control"
    finput_name.style = "display:none"
    finput_name.onkeyup = function (e) {
      if (e.key === 'Enter' || e.keyCode === 13) {
        currentLayers[i_id].name = finput_name.value
        finput_name.style = "display:none"
        span_name.innerHTML = currentLayers[i_id].name
        span_name.style = "display:block;"
      }
    }
    finput_name.onblur = function () {
      finput_name.style = "display:none"
      span_name.innerHTML = currentLayers[i_id].name
      span_name.style = "display:block;"
    }

    let span_size = document.createElement("span")
    span_size.className = "size"
    span_size.innerHTML = kb + " KB"

    div_details.append(span_name)
    div_details.append(finput_name)
    div_details.append(span_size)
    content_upload.append(i_file_alt)
    content_upload.append(div_details)

    let icon_file = document.createElement("div")
    icon_file.innerHTML = '<i style="width: 10%;" title="eliminar archivo" class="fa fa-times-circle"></i>'
    icon_file.onclick = function () {
      $("#" + id_item).remove()
      currentLayers.splice(del_index, 1)
    }

    content_upload.append(icon_file)
    file_item.append(content_upload)

    contenedor.append(file_item)

  }


  clickOpenFileIcon() {
    // let component = uimodalfs.createModal();
    // uimodalfs.addForm();
    // console.log(component);
    return uimodalfs.createModal();
    // if (!open) {
    //   open = true;
    //   // document.getElementById("iconopenfile-container").disabled = true;
    //   // document.getElementById("modalgeojson").style.color = "grey";
    //   let component = uimodalfs.createModal();
    //   // uimodalfs.addForm();
    //   console.log(component);
    //   return component;
    // }
  }

  enabledbtnCapa() {
    control_btn_add_layer = true
    let btn = document.getElementById("btn-upload-agregar-capa")
    btn.className = "btn btn-info"

    $('#uploaded-area').bind('DOMSubtreeModified', function () {

      let cont = document.getElementById("uploaded-area")
      let txt = document.getElementById("btn-upload-agregar-capa")
      if (cont.children.length > 1) {
        txt.innerHTML = "Agregar Capas"
      } else {
        txt.innerHTML = "Agregar Capa"
      }

      if ($('#uploaded-area')[0].childElementCount == 0) {
        control_btn_add_layer = false;
        let btn = document.getElementById("btn-upload-agregar-capa")
        btn.className = "btn btn-info disabled"
      }
    });
  }

}

let uimodalfs = new UImf();

function addProcessfromFiles(e, sectionName, typeName, counter) {
  switch (e.process) {
    case geoProcessingManager.GEOPROCESS.contour:
      counter = counterContour;
      counterContour++;
      break;
    case geoProcessingManager.GEOPROCESS.waterRise:
      counter = counterHeight;
      counterHeight++;
      break;
    case geoProcessingManager.GEOPROCESS.buffer:
      counter = counterBuffer;
      counterBuffer++;
      break;
    case geoProcessingManager.GEOPROCESS.elevationProfile:
      counter = counterElevProfile;
      counterElevProfile++;
      break;
    default:
      break;
  }

  sectionName = "Geoprocesos",
    typeName = "geoprocess";
  let nameId = e.process + counter;
  addedLayers.push({
    id: nameId,
    layer: e.layer,
    name: nameId,
    file_name: nameId,
    process: e.process,
    kb: e.kb,
    isActive: true,
    type: typeName,
    section: sectionName
  });
  mapa.addGeoJsonLayerToDrawedLayers(e.layer, nameId, true, true);

  if (e.process == geoProcessingManager.GEOPROCESS.contour) {
    let selectedRectangle = mapa.editableLayers.rectangle.at(-1);
    selectedRectangle._uneditable = true; //aux to disallow editing the layer
    selectedRectangle.process = nameId; //aux to relate contour with waterRise
  } else if (e.process == geoProcessingManager.GEOPROCESS.buffer) {
    mapa.editableLayers.polygon.forEach(lyr => {
      if (lyr.id === nameId) {
        lyr._uneditable = true; //aux to disallow editing the layer
      }
    })
  }
  // else if (e.process == geoProcessingManager.GEOPROCESS.waterRise) {
  //   mapa.editableLayers.cota.forEach(lyr => {
  //     if (lyr.id === nameId) {
  //       lyr._uneditable = true; //aux to disallow editing the layer
  //     }
  //   })
  // }

  menu_ui.addFileLayer(sectionName, typeName, nameId, nameId, nameId, true);
  updateNumberofLayers(sectionName);
  $("#item_uf_" + nameId).remove();
}

function addLayersfromFiles() {
  let sectionName, typeName, counter;

  currentLayers.forEach((e) => {
    if (e.process) {
      addProcessfromFiles(e, sectionName, typeName, counter);
    } else {
      sectionName = "Archivos",
        typeName = "file";

      addedLayers.push({
        id: e.id,
        layer: e.layer,
        name: e.name,
        file_name: e.file_name,
        kb: e.kb,
        isActive: true,
        type: typeName,
        section: sectionName
      });
      mapa.addGeoJsonLayerToDrawedLayers(e.layer, e.id, true, true);
      menu_ui.addFileLayer(sectionName, typeName, e.name, e.id, e.file_name, true);
      updateNumberofLayers(sectionName);
      $("#item_uf_" + e.id).remove();
    }
  });
  currentLayers = [];
  showTotalNumberofLayers();
}

/**
 * Removes an item from the `addedLayers` array based on its ID.
 *
 * @param {string} id - The ID of the item to be removed.
 */
 function delFileItembyID(id) {
  // Find the index of the item to be removed in the `addedLayers` array
  const indexToDelete = addedLayers.findIndex(e => e.id === id);
  
  // If the item is found, remove it from the array
  if (indexToDelete !== -1) {
    addedLayers.splice(indexToDelete, 1); // Remove the item from the array using splice
  }
}

function editDomNameofFileLayerbyID(id, name) {
  let edit_index = null
  addedLayers.forEach((e, i) => {
    if (e.id === id) edit_index = i
  });
  addedLayers[edit_index].name = name
}

function getIndexFileLayerbyID(id) {
  let edit_index = null
  addedLayers.forEach((e, i) => {
    if (e.id === id) edit_index = i
  });
  return edit_index
}

function getIndexCurrentFileLayerbyID(id) {
  let index = null
  currentLayers.forEach((e, i) => {
    if (e.id === id) index = i
  });
  return index
}