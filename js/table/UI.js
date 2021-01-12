class UI{

  createElement(element,id,className){
    let aux= document.createElement(element)
        if(id){aux.id=id}
        if(className){aux.className=className}
    return aux
  }

  createModal(){
    let divContainer= this.createElement("div","ContainerTable", "ContainerTable")
    divContainer.appendChild(this.createElement("div","icons-table"))
    let ul= this.createElement("ul","indextabulator", "nav nav-pills")
    divContainer.appendChild(this.createElement("div","tabs-table").appendChild(ul))
    divContainer.appendChild(this.createElement("div","search-table"))
    divContainer.appendChild(this.createElement("div","example-table"))
    document.body.appendChild(divContainer)
    this.addButtons()
  }

  addButtons(){
    let btnmax = this.createElement("button","btnmax")
    btnmax.hidden= true
    btnmax.innerHTML = '<span class="glyphicon glyphicon-resize-full" aria-hidden="true"></span>';
    btnmax.onclick = function(){
        document.getElementById("ContainerTable").style.height=""
        document.getElementById("ContainerTable").style.width="450px"
        document.getElementById("btnmax").hidden= true; 
        document.getElementById("btnmin").hidden= false;
        };

        let btnmin = this.createElement("button","btnmin")
        btnmin.innerHTML = '<span class="glyphicon glyphicon-minus" aria-hidden="true"></span>'
        btnmin.onclick = function(){
            document.getElementById("ContainerTable").style.height="32px"
            document.getElementById("ContainerTable").style.width="270px"
            document.getElementById("btnmin").hidden= true;
            document.getElementById("btnmax").hidden= false;
        };

        let btnclose = this.createElement("button","btnclose")
        btnclose.innerHTML = '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>'
        btnclose.onclick = function(){
          document.body.removeChild(ContainerTable)
          datatable=[];
        };

        let btnsave= this.createElement("button","btnsave")
        btnsave.innerHTML = '<span class="glyphicon glyphicon-floppy-disk" aria-hidden="true" title="Guardar como CSV"></span>';
        btnsave.onclick = function(){
          table.download("csv", "data.csv", {bom:true});
        };

        document.getElementById("icons-table").append(btnsave)
        document.getElementById("icons-table").append(btnmax)
        document.getElementById("icons-table").append(btnmin)
        document.getElementById("icons-table").append(btnclose)

  }

  addSearchBar(){
        let select = this.createElement("select","filter-field")

        let inputsearch = this.createElement("input","filter-value")
        inputsearch.type="text"
        inputsearch.placeholder="Buscar"

        let filterclear = this.createElement("button","filter-clear")
        filterclear.innerHTML="Borrar"
        filterclear.onclick = function(){
          document.getElementById("filter-value").value= "";
          document.getElementById("filter-field").selectedIndex = "0";
          table.clearFilter();
        }

        document.getElementById("search-table").append(select)
        document.getElementById("search-table").append(inputsearch)
        document.getElementById("search-table").append(filterclear)
  }

  addTabs(){
    let aux = this.createElement("li",datatable.length)
    aux.innerHTML='<a data-toggle="tab" aria-expanded="true" id ='+datatable.length+' >Tabla '+datatable.length+'</a>'
    aux.onclick =function(){
            let data = datatable[this.id-1]
            newTable(data)}
    document.getElementById("indextabulator").appendChild(aux)
  }

  cleanTable(){
    document.getElementById("example-table").innerHTML = ""; 
    document.getElementById("search-table").innerHTML=""
  }  
  
  createTable(data){
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
  }
  
  createFilters(data){
    
    this.addSearchBar()
    document.getElementById("filter-value").addEventListener("keyup", updateFilter);

    let headers = Object.keys(data[0])
    let aux = `<option value="no">Selecciona una opción</option>`
    headers.forEach( function(valor) {
      if(valor!='bbox'){
        aux +=`<option value="${valor}">${valor}</option>`
      } });
  document.getElementById("filter-field").innerHTML = aux

  let valueEl = document.getElementById("filter-value");
  let fieldEl = document.getElementById("filter-field");

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
   
}