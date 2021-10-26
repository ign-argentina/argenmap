let upload_files = null;
let file_name = "archivo1.geojson"
let data_file = `{"type":"Feature","properties":{"styles":{"stroke":true,"color":"#ff33ee","weight":4,"opacity":0.5,"fill":true,"fillColor":"#ff0d00","fillOpacity":0.2,"clickable":true,"_dashArray":null},"type":"rectangle"},"geometry":{"type":"Polygon","coordinates":[[[-63.632813,-36.031332],[-63.632813,-33.28462],[-58.535156,-33.28462],[-58.535156,-36.031332],[-63.632813,-36.031332]]]}}`
let kb_example = 8
let geojsonfile = JSON.parse(data_file);

let addedLayers = [];
let open = false;


let divalert = document.createElement("div");
divalert.className = "alert alert-danger";
divalert.role = "alert";
divalert.style = "padding:8px !important; margin:0px";

class IconModalGeojson {
  constructor() {
    this.component = `
    <div data-html2canvas-ignore="true" class="center-flex" id="modalgeojson" title="Abrir Archivos">
        <div class="center-flex" id="iconopenfile-container" onClick=uimodalfs.clickOpenFileIcon()>
            <span id="spanopenfolder" class="fa fa-folder-open" aria-hidden="true" ></span>
        </button>
    </div>
    `;
  }

  createComponent() {
    const elem = document.createElement("div");
    elem.innerHTML = this.component;
    document.getElementById("mapa").appendChild(elem);
  }
}

//modal
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
    f_sec.style = "width:90%"

    let s_sec = document.createElement("section")
    s_sec.style = "width:10%"
    let btnclose = document.createElement("a")
    btnclose.style = "color:#37bbed;"
    btnclose.id = "btnclose-icon-modalfile"
    btnclose.className = "icon-modalfile"
    btnclose.innerHTML =
      '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>';
    btnclose.onclick = function () {
      document.body.removeChild(modalOpenFile);
      document.getElementById("iconopenfile-container").disabled = false;
      document.getElementById("modalgeojson").style.color = "black";
    };
    s_sec.append(btnclose);

    mainIcons.append(f_sec)
    mainIcons.append(s_sec)

    

    let mainContainerFile = document.createElement("div")
    mainContainerFile.id = "file_gestor"
    mainContainerFile.style = "width:80%"

    divContainer.appendChild(mainIcons);
    divContainer.append(mainContainerFile);
    document.body.appendChild(divContainer);


    $( "#modalOpenFile" ).draggable({
      containment: "#mapa",
      scroll: false})
  }



  addForm2(){

    let contenedor_principal = document.getElementById("file_gestor")

    //logo
    let logo_upload = document.createElement("div")
    logo_upload.className = "wrapper"

    let divaux = document.createElement("div")
    divaux.id = "logo_upload_container"
    divaux.className = "upload"
    
    let main_inputfile = document.createElement("input")
    main_inputfile.id = "input_uploadfile"
    main_inputfile.name = "file"
    main_inputfile.type = "file"
    main_inputfile.className="file-input"
    main_inputfile.style="opacity: 0.0;top: 0; left: 0; bottom: 0;right: 0;"
    main_inputfile .addEventListener("change", function (e) {
      let ui_upload = new UImf();

      //FileReader.onload --->ui_upload.logoAnimation()
      ui_upload.logoAnimation()

      //FileReader.onloadend --->ui_upload.reload_logo() & ui_upload.addFileItem(file_name, kb_example)
      // setTimeout(function(){ 
      //   ui_upload.reload_logo() 
      //   let normalize_forleaflet = normalize(file_name)
      //   ui_upload.addFileItem(normalize_forleaflet,kb_example)
      // }, 1000);

      // Initialize File Layer
      let fileLayer = new FileLayer();
      // Give uploaded file to fileLayer
      fileLayer.handleFile(e.target.files[0]).then((lyr)=>{
        // Stop load animation
        ui_upload.reload_logo();
        // Show the uploaded file
        ui_upload.addFileItem(normalize(fileLayer.getFileName()),fileLayer.getFileSize('kb'));
        // add the layer obtained
        addedLayers.push({layer:lyr, name:fileLayer.getFileName()});
      }).catch((error)=>{
        // TODO Manejar el error
        console.warn('Hay error: ',error);
        new UserMessage(error, true, 'error');
        ui_upload.reload_logo();
      })

    });

    let faicon = document.createElement("i")
    faicon.id = "logo_up"
    faicon.className = "fas fa-arrow-circle-up"

    let ptitle = document.createElement("p")
    ptitle.innerHTML="Subir Archivo"

    divaux.append(main_inputfile)
    divaux.append(faicon)
    divaux.append(ptitle)
    divaux.onclick = function(){
      let aux = document.getElementById("input_uploadfile")
      aux.click();
    }

   logo_upload.append(divaux)
   
   let section_load = document.createElement("section")
   section_load.className = "uploaded-area"
   section_load.id="uploaded-area"

   let btnCapa = document.createElement("button")
   btnCapa.className = "btn btn-info"
   btnCapa.style = "width:100%; margin:5px"

   btnCapa.innerHTML = "Agregar Capa"
   btnCapa.onclick = function () {
     addLayersfromFiles();
   };

   contenedor_principal.append(logo_upload)
   contenedor_principal.append(section_load)
   contenedor_principal.append(btnCapa)
  }

  logoAnimation(){
    let logo = document.getElementById("logo_up")
    logo.className = "fas fa-circle-notch fa-spin"
  }

  reload_logo(){
    let logo = document.getElementById("logo_up")
    logo.className = "fas fa-arrow-circle-up"
  }

  addFileItem(fileName, kb){
    let contenedor = document.getElementById("uploaded-area")
    let file_item = document.createElement("li")
    file_item.className = "row"
    file_item.innerHTML = `
    <div class="content upload">
        <i class="fas fa-file-alt"></i>
         <div class="details">
            <span class="name">${fileName}</span>
            <span class="size">${kb} KB</span>
          </div>
    </div>
    `
    contenedor.append(file_item)
  }


  clickOpenFileIcon() {
    if(!open){
      open=true;
      document.getElementById("iconopenfile-container").disabled = true;
      document.getElementById("modalgeojson").style.color = "grey";
      uimodalfs.createModal();
      uimodalfs.addForm2();
    }
  }

}

let uimodalfs = new UImf();

function addLayersfromFiles() {
  // recorrer capas agregadas
  addedLayers.forEach((e)=>{
    //add layer in map 
    mapa.addGeoJsonLayerToDrawedLayers(e.layer.toGeoJSON(),normalize(e.name), false);

    //add layer in menu  
    menu_ui.addLayer("Archivos", normalize(e.name))
  });

  addedLayers = [];
  let close = document.getElementById("modalOpenFile")
  document.getElementById("modalgeojson").style.color = "black";
  document.body.removeChild(close);
  open=false;
}