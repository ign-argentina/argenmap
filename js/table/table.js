let datatable = [];
let table;
let activedata = 0;
let ui = new UI

function createTabulator(tableD){
    if (tableD.data.features.length != 0){
        let datos = tableD.getDataForTabulator();
        datatable[datatable.length]=datos

        if (document.getElementById("ContainerTable") !== null)
        { 
          ui.addTabs()
        }

        else{
          ui.createModal()
          ui.createTable(datos)
          ui.createFilters(datos)
          ui.addTabs()
          //working on: disable jquery draggable and resizable
          //dragElement(document.getElementById("ContainerTable"));
          //ro.observe(ContainerTable);
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

function newTable(data){
ui.cleanTable()
ui.createTable(data)
ui.createFilters(data)
}


