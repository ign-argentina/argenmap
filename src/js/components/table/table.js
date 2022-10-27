let datatable = [];
let tableData = [];//Contains the last geojson entered from map.js
let tableArray = [];//Contains all entered geojson from map.js.
let eventGeojson=[];//Contains the element with the necessary id to find the geojson in tableArray
let activeGeojson = 1;//Position of actual geojson
let table;
let activedata = 0;
let ui = new UI
let ISlandscape = window.matchMedia("(orientation: landscape)").matches
let ISportrait =  window.matchMedia("(orientation: portrait)").matches
let ISmaxwidth = window.matchMedia("(max-width: 415px)").matches
let ISmaxheight = window.matchMedia("(max-height: 415px)").matches
let ISCelular = (ISportrait &&ISmaxwidth) || (ISlandscape && ISmaxheight)

function createTabulator(tableD, layername){
    if (tableD.data.features.length != 0){
      
        tableData = tableD.data;
        tableArray.push(tableData)
        let datos = tableD.getDataForTabulator();
        datatable[datatable.length]=datos

        if (document.getElementById("ContainerTable") !== null)
        { 
          ui.addTabs(layername)
        }

        else{
          

          ui.createModal()
          ui.createTable(datos)
          ui.createFilters(datos)
          ui.addTabs(layername)

          if ( !ISCelular){
              $( "#ContainerTable" ).draggable({
              containment: "body",
              scroll: false}
            );
            
            $( "#ContainerTable" ).resizable({
              containment: "body",
              minHeight: 65,
              maxHeight: 475,
              minWidth: 450,
              scroll: true,
            });
          }
          
        }
    }
}

function newTable(data){
ui.cleanTable()
ui.createTable(data)
ui.createFilters(data)
}


