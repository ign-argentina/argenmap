let geojsonfile = ""

const modalicon =  `
<div class="center-flex" id="modalgeojson" title="Abrir Archivo">
    <button class="center-flex" id="iconopenfile-container" onClick=uimodalfs.clickOpenFileIcon()>
        <span id="spanopenfolder" class="fa fa-folder-open" aria-hidden="true" ></span>
    </button>
</div>
`;

const bootstraptabs = `
<ul class="nav nav-tabs" id="ul-modalfies" style="background-color: white">
  <li class="active"><a style="background-color: white !important; color:black !important" data-toggle="tab" href="#geoJSON-openfile">geoJSON</a></li>
  <li class="disabled"><a style="background-color: white !important; color:grey !important"  href="#KML-openfile">KML</a></li>
  <li class="disabled"><a style="background-color: white !important; color:grey !important"  href="#Shapefile-openfile">Shapefile</a></li>
  <li class="disabled"><a style="background-color: white !important; color:grey !important"  href="#CSV-openfile">CSV</a></li>
  </ul>
  <div class="tab-content" style="border:white" >
      <form id="geoJSON-openfile" class="tab-pane fade in active" style="background-color: white !important">
      </form>
      <div id="KML-openfile" class="tab-pane fade" style="background-color: white !important">
        <h3>kml</h3>
      </div>
      <div id="Shapefile-openfile" class="tab-pane fade" style="background-color: white !important">
        <h3>Shapefile</h3>
      </div>
      <div id="CSV-openfile" class="tab-pane fade" style="background-color: white !important">
      <h3>CSV</h3>
    </div>
  </div>
`;

const htmlopenfile =  `
<input type="file" id="files" name="file" />
<button onclick="abortRead();">Cancel read</button>
<div id="progress_bar"><div class="percent">0%</div></div>
`;

let divalert = document.createElement('div');
divalert.className="alert alert-danger"
divalert.role="alert"
divalert.style="padding:8px !important; margin:0px"


class IconModalGeojson {
  constructor() {
    this.component = modalicon
  }

  createComponent(){
    const elem = document.createElement('div');
    elem.innerHTML = this.component;
    document.getElementById('mapa').appendChild(elem);
  }
}

//modal
class UImf{

  createElement(element,id,className){
    let aux= document.createElement(element)
        if(id){aux.id=id}
        if(className){aux.className=className}
    return aux
  }

  createModal(){
    let divContainer= this.createElement("div","modalOpenFile", "modalOpenFile")
    divContainer.appendChild(this.createElement("div","icons-modalfile"))
    let divtabs= this.createElement("div","tabsfile", "tabsfile")
    //for disabled remove: data-toggle="tab" 
    divtabs.innerHTML= bootstraptabs
    divContainer.append(divtabs)
    document.body.appendChild(divContainer)

    let btnclose = this.createElement("a","btnclose-icon-modalfile","icon-modalfile")
        btnclose.innerHTML = '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>'
        btnclose.onclick = function(){
          document.body.removeChild(modalOpenFile)
          document.getElementById("iconopenfile-container").disabled = false;
          document.getElementById("modalgeojson").style.color = "black";
          geojsonfile = ""
        };

      let spantitle = this.createElement("span","title-icon-modalfile","icon-modalfile")
      spantitle.innerHTML="Abrir Archivo"
      document.getElementById("icons-modalfile").append(spantitle)
      document.getElementById("icons-modalfile").append(btnclose)

      let alerts = this.createElement("div","alert-message-modalfile")
      document.getElementById("modalOpenFile").append(alerts)
  }

  addForm(){
      let name = this.createElement("input","capaname","form-control")
      name.type="text"
      name.placeholder ="Nombre de capa"
      name.style="margin-bottom:10px; margin-top:10px"

      document.getElementById("geoJSON-openfile").append(name)

      let divdialog = this.createElement("div")
      let firsinput = this.createElement("input","inputfile","form-control form-control-sm")
      firsinput.type="file"
      firsinput.name="inputfile"
      firsinput.accept = ".geojson"
      let out = this.createElement("pre","output","preoutputfile")
      divdialog.append(firsinput)
      divdialog.append(out)
      document.getElementById("geoJSON-openfile").append(divdialog)
     //agrego archivo
    document.getElementById('inputfile') 
            .addEventListener('change', function() { 
            var fr=new FileReader(); 
            fr.onload=function(){ 
                document.getElementById('output') 
                        .textContent=fr.result; 
                        geojsonfile = JSON.parse(fr.result);
            } 
            fr.readAsText(this.files[0]); 
        }) 
    uimodalfs.submitbtn()   

  }

  submitbtn(){
    let sub = this.createElement("button","submitfile","btn btn-lg btn-primary btn-block")
    sub.type="button"
    sub.style="margin-top:15px"
    sub.innerHTML="agregar capa"
    sub.onclick= function(){
        
        }
    document.getElementById("geoJSON-openfile").append(sub)
    document.getElementById("submitfile").addEventListener("click", controlFormLoadFile);
  }

  addmenu(layername){
    let menuitem = `
    <div id="sidebar"
    <div id="geoJSON" class="nav nav-sidebar">
    <li id="li${layername}" class="capa list-group-item"><span>geoJSON: ${layername}</span>
    <button aria-hidden="true" onClick=uimodalfs.removegeojsonfile("${layername}")>X</button>
    </li>
    </div>
   </div>
    `;
    let divmenu = document.createElement('div')
    divmenu.innerHTML= menuitem
    document.getElementById("sidebar").append(divmenu)
  }

  clickOpenFileIcon(){
  document.getElementById("iconopenfile-container").disabled = true;
  document.getElementById("modalgeojson").style.color = "grey";
  uimodalfs.createModal()
  uimodalfs.addForm()
  }

  removegeojsonfile(value){
      mapa.eachLayer( function(layer) {
        if ( layer.myTag &&  layer.myTag === value) {
          mapa.removeLayer(layer)
            }
        });
        let auxname = "li"+value
        $('#'+auxname+'').remove()
  }
}

let uimodalfs = new UImf

function controlFormLoadFile() {
  let val = document.getElementById("capaname").value
  if(val && geojsonfile != ""){
    //control for name of layer
      function onEachFeature(feature, layer) {
        layer.feature.properties.highlight = true;
        layer.myTag = val
        if (feature.properties && feature.properties.popupContent) {
            layer.bindPopup(feature.properties.popupContent);
        }
       }

      // Define your style object
      var myStyle = { 
        "color": "#ff0000"
      };

    //add layer to map
    let aux = L.geoJSON(geojsonfile, {
        style: myStyle,
        onEachFeature: onEachFeature
      }).addTo(mapa);
    
     //add layer in menu
      uimodalfs.addmenu(val)

     //finish and close modal
      document.body.removeChild(modalOpenFile)
      document.getElementById("iconopenfile-container").disabled = false;
      document.getElementById("modalgeojson").style.color = "black";
      geojsonfile = ""
    }
    else{
      document.getElementById("alert-message-modalfile").innerHTML=""
      divalert.innerHTML="formulario incompleto"
      document.getElementById("alert-message-modalfile").append(divalert)
    }
}
