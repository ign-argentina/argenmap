let upload_files = null;
let currentLayers = [];
let addedLayers = [];
let open = false;
let control_btn_add_layer = false;

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
    btnclose.innerHTML ='<i title="cerrar" class="fa fa-times icon_close_mf" aria-hidden="true"></i>';
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
 
    //<li class="active-tab-upload">Archivo</li>
    // <li class="disabled-tab-upload">+ Nuevo</li>

    let mainContainerFile = document.createElement("div")
    mainContainerFile.id = "file_gestor"
    mainContainerFile.style = "width:80%"

    divContainer.append(mainIcons);
    divContainer.append(tab_div);
    divContainer.append(mainContainerFile);
    document.body.appendChild(divContainer);


    $( "#modalOpenFile" ).draggable({
      containment: "#mapa"})
  }



  addForm(){

    let contenedor_principal = document.getElementById("file_gestor")

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
    main_inputfile.className="file-input"
    main_inputfile.style="opacity: 0.0;top: 0; left: 0; bottom: 0;right: 0;"
    main_inputfile .addEventListener("change", function (e) {
      let ui_upload = new UImf();

      //FileReader.onload --->ui_upload.logoAnimation()
      ui_upload.logoAnimation()

      // Initialize File Layer
      let fileLayer = new FileLayer();
      // Give uploaded file to fileLayer
      fileLayer.handleFile(e.target.files[0]).then(()=>{
        //active btn add layer
        ui_upload.enabledbtnCapa()
        // Stop load animation
        ui_upload.reload_logo();
        // Show the uploaded file

        // Check if the file was loaded
        let existsInCurrent = currentLayers.filter((e)=>{
          return e.file_name == fileLayer.getFileName()
        })

        let existsInAdded = addedLayers.filter((e)=>{
          return e.file_name == fileLayer.getFileName()
        })

        let name;
        if(existsInCurrent.length  || existsInAdded.length){
          let exists = existsInCurrent.length + existsInAdded.length;
          name = stringShortener(normalize(fileLayer.getFileName()),13,false)+`(${exists})..`;
        }else {
          name = stringShortener(normalize(fileLayer.getFileName()),16,true);
        }

        ui_upload.addFileItem(name,fileLayer.getFileSize('kb'));
        // add the layer obtained
        
        currentLayers.push({
          layer:fileLayer.getGeoJSON(), 
          name:name,
          file_name:fileLayer.getFileName()
        });

      }).catch((error)=>{
        console.warn('Hay error: ',error);
        new UserMessage(error, true, 'error');
        ui_upload.reload_logo();
      })

    });

    let faicon = document.createElement("i")
    faicon.id = "logo_up"
    faicon.className = "fas fa-arrow-circle-up"

    let ptitle = document.createElement("p")
    ptitle.innerHTML="Abrir Archivo"

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
    btnCapa.id = "btn-upload-agregar-capa"
    btnCapa.className = "btn btn-info disabled"
    btnCapa.style = "width:100%; margin:20px 0px 10px 0px"
    btnCapa.innerHTML = "Agregar Capa"
    btnCapa.onclick = function () {
      if(control_btn_add_layer)addLayersfromFiles()
    }

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
    let id_item = "item_uf_"+fileName
    let contenedor = document.getElementById("uploaded-area")
    let file_item = document.createElement("li")
    file_item.id=id_item
    file_item.className = "row"

    let content_upload = document.createElement("div")
    content_upload.className = "content upload"
    content_upload.innerHTML= `
        <i style="width: 20%;" class="fas fa-file-alt"></i>
         <div style="width: 70%;" class="details">
            <span class="name" title="${fileName}">${fileName}</span>
            <span class="size">${kb} KB</span>
          </div>
    `
    let icon_file = document.createElement("div")
    icon_file.innerHTML = '<i style="width: 10%;" title="eliminar archivo" class="fa fa-times-circle"></i>'
    icon_file.onclick = function(){
      $("#"+id_item).remove()
      //TODO Eliminar archivo de array
      console.log("TODO eliminar archivo de array")
    }

    content_upload.append(icon_file)
    file_item.append(content_upload)

    contenedor.append(file_item)
    
  }


  clickOpenFileIcon() {
    if(!open){
      open=true;
      document.getElementById("iconopenfile-container").disabled = true;
      document.getElementById("modalgeojson").style.color = "grey";
      uimodalfs.createModal();
      uimodalfs.addForm();
    }
  }

  enabledbtnCapa(){
    control_btn_add_layer =true
    let btn = document.getElementById("btn-upload-agregar-capa")
    btn.className = "btn btn-info"

    $('#uploaded-area').bind('DOMSubtreeModified', function(){

      let cont = document.getElementById("uploaded-area")
      let txt = document.getElementById("btn-upload-agregar-capa")
        if (cont.children.length>1){
          txt.innerHTML = "Agregar Capas"
        }else{
          txt.innerHTML = "Agregar Capa"
        }

      if($('#uploaded-area')[0].childElementCount==0){
        control_btn_add_layer = false;
        let btn = document.getElementById("btn-upload-agregar-capa")
        btn.className = "btn btn-info disabled"
      }
   });
  }
  
}

let uimodalfs = new UImf();

function addLayersfromFiles() {
  //TODO Animacion de carga a boton "Agregar capa"
  currentLayers.forEach((e)=>{
    // Normalize the name to work correctly with Leaflet
    let layer_name = e.name
    // Add the geoJSON layer
    mapa.addGeoJsonLayerToDrawedLayers(e.layer,layer_name, false);
    // Add the layer to the Menu
    menu_ui.addFileLayer("Archivos", layer_name)
    addedLayers.push(e);
  });

  let close = document.getElementById("modalOpenFile")
  document.getElementById("modalgeojson").style.color = "black";
  document.body.removeChild(close);
  currentLayers = [];
  open=false;
}