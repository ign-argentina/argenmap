var datatable = [];
var table;

class Datatable {
  constructor (data,latlng) {
  this.latlng = latlng;
  this.data = data;
  }

  getDataForTabulator(){
    let dataaux = []
      for (let i =0; i<this.data.features.length;i++ ){
        let aux = this.data.features[i].properties
        dataaux.push(aux)
      }

      let names = Object.keys(dataaux[0])
      for (let i =0; i<names.length; i++ ){
        let col = names[i]
        let nulscolum = 0

        for (let j =0; j<dataaux.length; j++ ){
            if (dataaux[j][col]== null || dataaux[j][col]== undefined){
              nulscolum+=1;
            }
          }

          if (nulscolum==dataaux.length){
            for (let j =0; j<dataaux.length; j++ ){
              delete dataaux[j][col]
            }
          }
      }
    return dataaux
    }
}


function loadTabulator(data){
  document.getElementById("example-table").innerHTML = ""; 
  document.getElementById("filter-field").innerHTML = ""; 

  table = new Tabulator("#example-table", {

    data: data, //assign data to table
    autoColumns:true, //create columns from data field names
    tooltips:true,            //show tool tips on cells
    pagination:"local",       //paginate the data
    paginationSize:10,         //allow 7 rows per page of data
    movableColumns:true,      //allow column order to be changed
    locale:true,
    rowDblClick:function(e, row){
      if(row._row.data.lon){
        let lon = row._row.data.lon
        let lat = row._row.data.lat
        //let marker = L.marker([lat, lon], {clickable: true})
        //mapa.addLayer(marker);
        mapa.flyTo([lat, lon],10)}
    },

    langs:{
      "es-es":{
          "pagination":{
              "first":"Primera", //text for the first page button
              "first_title":"Primera", //tooltip text for the first page button
              "last":"Ultima",
              "last_title":"Ultima",
              "prev":"Anterior",
              "prev_title":"Anterior",
              "next":"Siguiente",
              "next_title":"Siguiente",
              "all":"Todo",
          },
      }
  },
   });
   table.deleteColumn("bbox");

   
    document.getElementById("filter-value").addEventListener("keyup", updateFilter);

    let headers = Object.keys(data[0])
    let aux = `<option value="no">Selecciona una opción</option>`
    headers.forEach( function(valor) {
      if(valor!='bbox'){
        aux +=`<option value="${valor}">${valor}</option>`
      }
  });
  document.getElementById("filter-field").innerHTML = aux

  var valueEl = document.getElementById("filter-value");
  var fieldEl = document.getElementById("filter-field");

   function customFilter(data){

    return data.car && data.rating < 3;
    }
    //Trigger setFilter function with correct parameters
    function updateFilter(){
      var filterVal = fieldEl.options[fieldEl.selectedIndex].value;
      var filter = filterVal == "function" ? customFilter : filterVal;
      if(filterVal!="no"){
          table.setFilter(filter,"like", valueEl.value);
        }
    }
}

function createTabulator(tableD){
    if (tableD.data.features.length != 0){
        var datos = tableD.getDataForTabulator();
        datatable[datatable.length]=datos
        let indextabs = datatable.length
        //primer div//
        let div = document.createElement("div")
        div.id="contenedorPrincipal"

        var head = document.createElement("header");
        head.id= "header-tabletabulator"

        var btn = document.createElement("BUTTON");
        btn.id='btnmax'
        btn.hidden= true
        btn.innerHTML = '<span class="glyphicon glyphicon-resize-full" aria-hidden="true"></span>';
        btn.onclick = function(){
        secdiv.style.display = "block"
        div.style.height=""
        div.style.width="450px"
        document.getElementById("btnmax").hidden= true; 
        document.getElementById("btnmin").hidden= false;
        document.getElementById("filter-tabletabulator").hidden= false;
        document.getElementById("tab-content").hidden= false;
        };

        var btnmin= document.createElement("BUTTON");
        btnmin.id="btnmin"
        btnmin.innerHTML = '<span class="glyphicon glyphicon-minus" aria-hidden="true"></span>'
        btnmin.onclick = function(){
            secdiv.style.display = "none";
            div.style.height="35px"
            div.style.width="270px"
            document.getElementById("btnmin").hidden= true;
            document.getElementById("btnmax").hidden= false; 
            document.getElementById("filter-tabletabulator").hidden= true;
            document.getElementById("tab-content").hidden= true;
        };

        var btnclose = document.createElement("BUTTON");
        btnclose.innerHTML = '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>'
        btnclose.onclick = function(){
          document.body.removeChild(contenedorPrincipal)
          datatable=[];
        };

        var btnsave= document.createElement("BUTTON");
        btnsave.innerHTML = '<span class="glyphicon glyphicon-floppy-disk" aria-hidden="true" title="Guardar como CSV"></span>';
        btnsave.onclick = function(){
          table.download("csv", "data.csv", {bom:true});
        };
        
        head.appendChild(btnsave);
        head.appendChild(btnmin);
        head.appendChild(btn);
        head.appendChild(btnclose);
        div.appendChild(head)

        var nav = document.createElement("nav");
        nav.id="nav-tabletabulator"

        let secdiv = document.createElement("div")
        secdiv.id='containerTables'
        
        let iniciaul = document.createElement("ul")
        iniciaul.className='nav nav-pills'
        iniciaul.id='indextabulator'

        let primerli = document.createElement("li")
        primerli.className="active"
        primerli.id=indextabs
        primerli.onclick =function(){
            let data = datatable[this.id-1]
            loadTabulator(data)
        }
        primerli.innerHTML='<a data-toggle="tab" id="1" href="#example-table">Tabla 1</a>'
        iniciaul.appendChild(primerli)
        secdiv.appendChild(iniciaul);

        let divtabs = document.createElement("div")
        divtabs.className= "tab-content"
        divtabs.id="tab-content"

        let select = document.createElement("select")
        select.id="filter-field"

        let inputsearch = document.createElement("input")
        inputsearch.id="filter-value"
        inputsearch.type="text"
        inputsearch.placeholder="Buscar"

        let filterclear = document.createElement("button")
        filterclear.id="filter-clear"
        filterclear.innerHTML="Borrar"
        filterclear.onclick = function(){
          document.getElementById("filter-value").value= "";
          document.getElementById("filter-field").selectedIndex = "0";

          table.clearFilter();
        }

        //tercer div//
        let div3 = document.createElement("div")
        div3.style.display="inline"
        div3.className= "tab-pane fade in active"
        div3.id='example-table'
        
        divtabs.appendChild(div3);

        nav.appendChild(divtabs);

        let filter = document.createElement("div")
        filter.id= "filter-tabletabulator"

        div.appendChild(secdiv); //example-table
        div.appendChild(filter) //filter tools
        filter.appendChild(select);
        filter.appendChild(inputsearch);
        filter.appendChild(filterclear);
        div.appendChild(nav); //tabs

        if (document.getElementById("contenedorPrincipal") !== null)
        { 
          let linuevo = document.createElement("li")
          linuevo.id=indextabs

          linuevo.onclick =function(){
            let data = datatable[this.id-1]
            loadTabulator(data)
          }
          linuevo.innerHTML='<a data-toggle="tab" id ='+indextabs+' href="#example-table">Tabla '+indextabs+'</a>'
          document.getElementById("indextabulator").appendChild(linuevo)
        }
        else{
          document.body.appendChild(div)
          loadTabulator(datos)
        }
        
        $( "#contenedorPrincipal" ).draggable({
          containment: "#mapa",
          scroll: false}
        );
        
        $( "#contenedorPrincipal" ).resizable({
          containment: "#mapa",
          minHeight: 65,
          maxHeight: 475,
          minWidth: 450,
          scroll: true,
        });
      }
}