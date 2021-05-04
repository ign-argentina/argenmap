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
    let tabcontainer = this.createElement("div","tabscontainer")
    let tabstable = this.createElement("div","tabs-table")
    let buttonl = this.createElement("button","btn-left-tabtable")
    buttonl.innerHTML='<i class="fa fa-arrow-left" style="color: grey !important; aria-hidden="true"></i>'
    buttonl.onclick = function(){
      let container =  document.getElementById("indextabulator")
      let ht = window.getComputedStyle(container, null).getPropertyValue("height").match(/\d+/)[0]
      container.scrollBy(0, -ht)
    }
    let buttonr = this.createElement("button","btn-right-tabtable")
    buttonr.innerHTML='<i class="fa fa-arrow-right" style="color: grey !important; aria-hidden="true"></i>'
    buttonr.onclick = function(){
      let container =  document.getElementById("indextabulator")
      let ht = window.getComputedStyle(container, null).getPropertyValue("height").match(/\d+/)[0]
      container.scrollBy(0, ht)
    }
    tabstable.appendChild(ul)
    tabcontainer.append(buttonl)
    tabcontainer.append(tabstable)
    tabcontainer.append(buttonr)
    divContainer.append(tabcontainer)
    divContainer.appendChild(this.createElement("div","search-table"))
    divContainer.appendChild(this.createElement("div","example-table"))
    document.body.appendChild(divContainer)
    this.addButtons()
  }

  addButtons(){
    let btnmax = this.createElement("a","btnmax","icon-table")
    btnmax.hidden= true
    btnmax.innerHTML = '<span id="resize-full" class="glyphicon glyphicon-resize-full" aria-hidden="true"></span>';
    btnmax.onclick = function(){
        document.getElementById("ContainerTable").style.height=""
        document.getElementById("ContainerTable").style.width="450px"
        document.getElementById("btnmax").hidden= true; 
        document.getElementById("btnmin").hidden= false;
        };

        let btnmin = this.createElement("a","btnmin","icon-table")
        btnmin.innerHTML = '<span id="minus" class="glyphicon glyphicon-minus" aria-hidden="true"></span>'
        btnmin.onclick = function(){
            document.getElementById("ContainerTable").style.height="25px"
            document.getElementById("ContainerTable").style.width="270px"
            document.getElementById("btnmin").hidden= true;
            document.getElementById("btnmax").hidden= false;
        };

        let btnclose = this.createElement("a","btnclose","icon-table")
        btnclose.innerHTML = '<span id="remove" class="glyphicon glyphicon-remove" aria-hidden="true"></span>'
        btnclose.onclick = function(){
          document.body.removeChild(ContainerTable)
          datatable=[];
        };

        let btnsave= this.createElement("a","btnsave","icon-table")
        btnsave.innerHTML = '<span id="save" class="glyphicon glyphicon-download-alt" aria-hidden="true" title="Guardar como CSV"></span>';
        btnsave.onclick = function(){
          table.download("csv", "data.csv", {bom:true});
        };

        //if charts is avaible in menu.json
        if(loadCharts) {
          let btntd= this.createElement("a","btngraphics","icon-table")
          btntd.innerHTML = '<span id="stats" class="glyphicon glyphicon-stats" aria-hidden="true" title="Gráficos"></span>';
          btntd.onclick = function(){
            let data = datatable[activedata]
            created3(data)
          };
          document.getElementById("icons-table").append(btntd)
       }
        
        document.getElementById("icons-table").append(btnsave)
        document.getElementById("icons-table").append(btnmax)
        document.getElementById("icons-table").append(btnmin)
        document.getElementById("icons-table").append(btnclose)

  }

  addSearchBar(){
        let select = this.createElement("select","filter-field","filteritems")

        let inputsearch = this.createElement("input","filter-value","filteritems")
        inputsearch.type="text"
        inputsearch.placeholder="Buscar"

        let filterclear = this.createElement("a","filter-clear","filteritems")
        filterclear.innerHTML='<i style="padding-left: 5px; color: grey !important;" class="fas fa-times"></i>'
        filterclear.onclick = function(){
          document.getElementById("filter-value").value= "";
          document.getElementById("filter-field").selectedIndex = "0";
          table.clearFilter();
        }

        document.getElementById("search-table").append(select)
        document.getElementById("search-table").append(inputsearch)
        document.getElementById("search-table").append(filterclear)
  }

  addTabs(layername){
    let aux 
    if(datatable.length==1){aux = this.createElement("li",datatable.length,"active")}
    else{aux = this.createElement("li",datatable.length)}
    aux.style = "border: 1px solid silver;border-top-right-radius: 8px;border-top-left-radius: 8px;"
    
    aux.innerHTML='<a style="height:38px; padding:10px !important; overflow:hidden; white-space: nowrap; direction: rtl;text-overflow: ellipsis;" data-toggle="tab" istabletab="true" aria-expanded="true" id ='+datatable.length+'>'+layername+' '+datatable.length+'</a>'
    aux.onclick =function(){
            activedata=this.id-1
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
        if(row._row.data.Longitud){
          let lon = row._row.data.Longitud
          let lat = row._row.data.Latitud
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
        },
        "es-ar":{
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
          }
      }
    },
     });
     if(table.columnManager.columnsByField["bbox"]){table.deleteColumn("bbox");}
     
  }
  
  createFilters(data){
    
    this.addSearchBar()
    document.getElementById("filter-value").addEventListener("keyup", updateFilter);

    let headers = Object.keys(data[0])
    let aux = `<option style="color: grey !important;" value="no">Selecciona una opción</option>`
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

