let datatable = [];
let tableData = [];//-----------
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
      
        tableData = tableD.data;//Contiene el geojson.
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
              containment: "#mapa",
              scroll: false}
            );
            
            $( "#ContainerTable" ).resizable({
              containment: "#mapa",
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


