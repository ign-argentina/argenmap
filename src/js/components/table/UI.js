class UI {

  createElement(element, id, className) {
    let aux = document.createElement(element)
    if (id) { aux.id = id }
    if (className) { aux.className = className }
    return aux
  }

  createModal(boolean) {
    let divContainer = this.createElement("div", "ContainerTable", "ContainerTable")
    divContainer.appendChild(this.createElement("div", "icons-table"))
    let ul = this.createElement("ul", "indextabulator", "nav nav-pills")
    let tabcontainer = this.createElement("div", "tabscontainer")
    let tabstable = this.createElement("div", "tabs-table")
    let buttonl = this.createElement("button", "btn-left-tabtable")
    buttonl.innerHTML = '<i class="fa fa-arrow-left" style="color: grey !important; aria-hidden="true"></i>';
    buttonl.onclick = function () {
      let container = document.getElementById("indextabulator")
      let ht = window.getComputedStyle(container, null).getPropertyValue("height").match(/\d+/)[0];
      container.scrollBy(0, -ht);
    }
    let buttonr = this.createElement("button", "btn-right-tabtable")
    buttonr.innerHTML = '<i class="fa fa-arrow-right" style="color: grey !important; aria-hidden="true"></i>';
    buttonr.onclick = function () {
      let container = document.getElementById("indextabulator")
      let ht = window.getComputedStyle(container, null).getPropertyValue("height").match(/\d+/)[0];
      container.scrollBy(0, ht);
    }
    tabstable.appendChild(ul);
    tabcontainer.append(buttonl, tabstable, buttonr);
    divContainer.append(tabcontainer);
    divContainer.appendChild(this.createElement("div", "search-table"));
    divContainer.appendChild(this.createElement("div", "example-table"));
    document.body.appendChild(divContainer);
    this.addButtons(boolean);
  }

  addButtons(boolean) {
    let _containerTable = document.getElementById("ContainerTable");
    let btnmax = this.createElement("a", "btnmax", "icon-table")
    btnmax.hidden = true
    btnmax.innerHTML = '<span id="resize-full" class="glyphicon glyphicon-resize-full" aria-hidden="true"></span>';
    btnmax.onclick = function () {
      _containerTable.style.height = ""
      _containerTable.style.width = "450px"
      document.getElementById("btnmax").hidden = true;
      document.getElementById("btnmin").hidden = false;
    };

    let btnmin = this.createElement("a", "btnmin", "icon-table")
    btnmin.innerHTML = '<span id="minus" class="glyphicon glyphicon-minus" aria-hidden="true"></span>'
    btnmin.onclick = function () {
      _containerTable.style.height = "40px"
      _containerTable.style.width = "270px"
      document.getElementById("btnmin").hidden = true;
      document.getElementById("btnmax").hidden = false;
    };

    let btnclose = this.createElement("a", "btnclose", "icon-table")
    btnclose.innerHTML = '<span id="remove" class="glyphicon glyphicon-remove" aria-hidden="true"></span>'
    btnclose.onclick = function () {
      activeGeojson = 1;
      eventGeojson = [];
      document.body.removeChild(ContainerTable)
      datatable = [];
      tableArray = []
    };

    let btnsaveGJSON = this.createElement("a", "btnsaveGJSON", "icon-table")
    btnsaveGJSON.innerHTML = '<span id="savegjson" class="icon-geo" aria-hidden="true" title="Guardar como geojson"></span>';
    btnsaveGJSON.onclick = function () {

      if (datatable.length > 1) {
        const a = document.createElement("a");
        activeGeojson = activeGeojson - 1;
        const file = new Blob([JSON.stringify(tableArray[activeGeojson])], { type: "text/plain" });
        a.href = URL.createObjectURL(file);
        a.download = "data.geojson";
        a.click();
      }
      else {
        const a = document.createElement("a");
        const file = new Blob([JSON.stringify(tableData)], { type: "text/plain" });
        a.href = URL.createObjectURL(file);
        a.download = "data.geojson";
        a.click();
      }

    };

    let btnsaveCSV = this.createElement("a", "btnsaveCSV", "icon-table")
    btnsaveCSV.innerHTML = '<span id="savecsv" class="icon-csv" aria-hidden="true" title="Guardar como CSV"></span>';
    btnsaveCSV.onclick = function () {
      table.download("csv", "data.csv", { bom: true });
    };

    if (boolean) { this.addEditTableDataBtn(); }

    let iconsTable = document.getElementById("icons-table");

    //if charts is avaible in menu.json
    if (loadCharts) {
      let btntd = this.createElement("a", "btngraphics", "icon-table")
      btntd.innerHTML = '<span id="stats" class="glyphicon glyphicon-stats" aria-hidden="true" title="Gráficos"></span>';
      btntd.onclick = function () {
        let data = datatable[activedata]
        created3(data)
      };
      iconsTable.append(btntd)
    }

    iconsTable.append(btnsaveGJSON, btnsaveCSV, btnmax, btnmin, btnclose);
  }

  addEditTableDataBtn() {
    const editBar = this.createElement("div", "editBar", "");
    const editBtn = this.createElement("button", "editBtn", "icon-table btn btn-primary");
    editBtn.type = "button";
    editBtn.style = "margin: 5px 5px 5px 0; float: left;";
    editBtn.id = "editTableData";
    editBtn.innerHTML = 'Editar';
    editBtn.onclick = () => this.toggleEditTableData();
    editBar.append(editBtn);
    document.getElementById("icons-table").append(editBar);
  }

  addUndoRedoBtn() {
    const undoBtn = this.createElement("button", "undoBtn", "icon-table btn btn-primary");
    undoBtn.style.float = "left";
    undoBtn.type = "button";
    undoBtn.id = "undoBtn";
    undoBtn.innerHTML = '<span id="undo" class="fa-solid fa-rotate-left" aria-hidden="true"></span>';
    undoBtn.addEventListener("click", () => {
      table.undo();
    });
    editBar.appendChild(undoBtn);

    const redoBtn = this.createElement("button", "redoBtn", "icon-table btn btn-primary");
    redoBtn.style.float = "left";
    redoBtn.type = "button";
    redoBtn.id = "redoBtn";
    redoBtn.innerHTML = '<span id="redo" class="fa-solid fa-rotate-right" aria-hidden="true"></span>';
    redoBtn.addEventListener("click", () => {
      table.redo();
    });
    editBar.appendChild(redoBtn);
  }

  addColumnBtn() {
    const addColumnBtn = this.createElement("button", "addColumnBtn", "icon-table btn btn-primary");
    addColumnBtn.style.float = 'left';
    addColumnBtn.id = "addColumnBtn";
    addColumnBtn.innerHTML = '+ Columna';
    addColumnBtn.onclick = () => {
      document.getElementById("addColumnBtn").classList.toggle("hidden");
      document.getElementById("removeColumnBtn").classList.toggle("hidden");
      document.getElementById("undoBtn").classList.toggle("hidden");
      document.getElementById("redoBtn").classList.toggle("hidden");
      document.getElementById("editTableData").classList.toggle("hidden");

      this.addInput("add");
    }
    editBar.append(addColumnBtn);
  }

  removeColumnBtn() {
    const removeColumnBtn = this.createElement("button", "removeColumnBtn", "icon-table btn btn-primary");
    removeColumnBtn.style.float = 'left';
    removeColumnBtn.id = "removeColumnBtn";
    removeColumnBtn.innerHTML = '- Columna';
    removeColumnBtn.onclick = () => {
      document.getElementById("addColumnBtn").classList.toggle("hidden");
      document.getElementById("removeColumnBtn").classList.toggle("hidden");
      document.getElementById("undoBtn").classList.toggle("hidden");
      document.getElementById("redoBtn").classList.toggle("hidden");
      document.getElementById("editTableData").classList.toggle("hidden");

      this.addInput("remove");
    }
    editBar.append(removeColumnBtn);
  }

  removeColumn(field) {
    table.deleteColumn(field);
    addedLayers.forEach(lyr => {
      if (lyr.layer.features[0] === tableData.features[0]) {
        lyr.layer.features.forEach(feat => {
          if (Object.keys(feat.properties).includes(field)) {
            delete feat.properties[field]
          }
        });
      }
    });
    new UserMessage(`Columna removida exitosamente.`, true, "information");
  }

  addColumn(name) {
    name = name.toLowerCase();
    table.addColumn({ title: name, field: name, editor: true }, false);
    new UserMessage(`Columna agregada exitosamente.`, true, "information");
  }

  addInput(action) {
    const inputDiv = this.createElement("div", "inputDiv", "icon-table input-group");
    inputDiv.id = "inputTableDiv";
    const addInputBtn = this.createElement("input", "columnInputName", "form-control");
    addInputBtn.type = "text";
    addInputBtn.placeholder = "Nombre de columna";
    inputDiv.appendChild(addInputBtn);

    const saveBtn = this.createElement("button", "saveBtn", "icon-table btn btn-primary");
    saveBtn.style.float = "left";
    saveBtn.type = "button";
    saveBtn.innerHTML = '<span class="fa-solid fa-check" aria-hidden="true"></span>';
    saveBtn.addEventListener("click", () => {
      let name = addInputBtn.value.trim();
      if (name !== "" && action === "add") {
        this.addColumn(name);
      } else if (name !== "" && action === "remove") {
        this.removeColumn(name);
      }
      this.showHideColumnBtns();
    });
    inputDiv.appendChild(saveBtn);

    const cancelBtn = this.createElement("button", "cancelBtn", "icon-table btn btn-primary");
    cancelBtn.style.float = "left";
    cancelBtn.type = "button";
    cancelBtn.innerHTML = '<span class="fa-solid fa-xmark" aria-hidden="true"></span>';
    cancelBtn.addEventListener("click", () => {
      this.showHideColumnBtns();
    });
    inputDiv.appendChild(cancelBtn);
    editBar.appendChild(inputDiv);

    addInputBtn.focus();
  }

  showHideColumnBtns() {
    document.getElementById("addColumnBtn").classList.toggle("hidden");
    document.getElementById("removeColumnBtn").classList.toggle("hidden");
    document.getElementById("undoBtn").classList.toggle("hidden");
    document.getElementById("redoBtn").classList.toggle("hidden");
    document.getElementById("editTableData").classList.toggle("hidden");

    document.getElementById("columnInputName").remove();
    document.getElementById("saveBtn").remove();
    document.getElementById("cancelBtn").remove();
  }

  toggleEditTableData() {
    var editBtn = document.querySelector("#editTableData")
    if (table.editing) {
      table.isEditable(false)
      editBtn.innerHTML = "Editar"
      editBtn.title = "Editar datos de la tabla"
      document.getElementById("undoBtn").remove()
      document.getElementById("redoBtn").remove()

      document.getElementById("addColumnBtn").remove()
      document.getElementById("removeColumnBtn").remove()
    } else {
      this.addUndoRedoBtn();
      this.addColumnBtn();
      this.removeColumnBtn();
      table.isEditable(true);
      editBtn.innerHTML = "Guardar"
      editBtn.title = "Guardar cambios"
    }
  }

  addSearchBar() {
    let select = this.createElement("select", "filter-field", "filteritems")

    let inputsearch = this.createElement("input", "filter-value", "filteritems")
    inputsearch.type = "text"
    inputsearch.placeholder = "Buscar capas..."

    let filterclear = this.createElement("a", "filter-clear", "filteritems")
    filterclear.innerHTML = '<i style="padding-left: 5px; color: grey !important;" class="fas fa-times"></i>'
    filterclear.onclick = function () {
      document.getElementById("filter-value").value = "";
      document.getElementById("filter-field").selectedIndex = "0";
      table.clearFilter();
    }
    const searchTable = document.getElementById("search-table");
    searchTable.append(select, inputsearch, filterclear);
  }

  addTabs(layername) {
    let aux;
    if (datatable.length == 1) { aux = this.createElement("li", datatable.length, "active") }
    else { aux = this.createElement("li", datatable.length) }
    aux.style = "border: 1px solid silver;border-top-right-radius: 8px;border-top-left-radius: 8px;"

    let activedata = datatable[datatable.length - 1]; // gets lats active table in array

    let tabTitle = gestorMenu.getLayerData(layername).title ?? layername,
      tabLink = document.createElement('a');
    tabLink.id = layername + '-tab';
    tabLink.classList.add('tabEvent');
    tabLink.style = 'height:38px; padding:10px !important; overflow:hidden; white-space: nowrap; direction: rtl;text-overflow: ellipsis;';
    tabLink.setAttribute('data-toggle', 'tab');
    tabLink.setAttribute('istabletab', 'true');
    tabLink.setAttribute('aria-expanded', 'true');
    tabLink.innerHTML = `${tabTitle} (${activedata.length})`;

    aux.appendChild(tabLink);

    aux.onclick = function () {
      activedata = this.id - 1;
      let data = datatable[activedata];
      newTable(data)
    }
    document.getElementById("indextabulator").appendChild(aux).addEventListener('click', function (e) {
      eventGeojson = e.target.attributes.id.value;
      activeGeojson = parseInt(eventGeojson);
    });
  }

  cleanTable() {
    document.getElementById("example-table").innerHTML = "";
    document.getElementById("search-table").innerHTML = ""
  }

  createTable(data) {
    let pagination = 10

    if (ISCelular) {
      if (window.matchMedia("(orientation: landscape)").matches) {
        pagination = 3
        let cont = document.getElementById("ContainerTable")
        cont.style = "margin: 0px !important; bottom: 0px !important;"
      } else { pagination = 4 }
    }

    table = new Tabulator("#example-table", {
      data: data, //assign data to table
      autoColumns: true, //create columns from data field names
      tooltips: true, //show tool tips on cells
      pagination: "local", //paginate the data
      paginationSize: pagination, //allow 10 rows per page of data
      movableColumns: false, //allow column order to be changed
      locale: true,
      resizableRows: false,
      resizableColumns: false,
      history: true,
      rowDblClick: function (e, row) {
        if (row._row.data.Longitud) {
          let lon = row._row.data.Longitud
          let lat = row._row.data.Latitud
          mapa.flyTo([lat, lon], 10)
        }
      },
      autoColumnsDefinitions: function (definitions) {
        //definitions - array of column definition objects
        definitions.forEach((column) => {
          column.editor = true; // add edito to every column
        });
        return definitions;
      },
      langs: {
        "es-es": {
          "pagination": {
            "first": "Primera", //text for the first page button
            "first_title": "Primera", //tooltip text for the first page button
            "last": "Ultima",
            "last_title": "Ultima",
            "prev": "Anterior",
            "prev_title": "Anterior",
            "next": "Siguiente",
            "next_title": "Siguiente",
            "all": "Todo",
          },
        },
        "es-ar": {
          "pagination": {
            "first": "Primera", //text for the first page button
            "first_title": "Primera", //tooltip text for the first page button
            "last": "Ultima",
            "last_title": "Ultima",
            "prev": "Anterior",
            "prev_title": "Anterior",
            "next": "Siguiente",
            "next_title": "Siguiente",
            "all": "Todo",
          }
        }
      },
    });

    table.editing = false;
    table.isEditable = (boolean) => {
      table.columnManager.columns.forEach(col => {
        col.modules.edit.blocked = !boolean;
      })
      table.editing = boolean;
    };
    table.isEditable(false);
    if (table.columnManager.columnsByField["bbox"]) { table.deleteColumn("bbox"); }
  }

  createFilters(data) {

    this.addSearchBar()
    document.getElementById("filter-value").addEventListener("keyup", updateFilter);

    let headers = Object.keys(data[0])
    let aux = `<option style="color: grey !important;" value="no">Selecciona una opción</option>`
    headers.forEach(function (valor) {
      if (valor != 'bbox') {
        aux += `<option value="${valor}">${valor}</option>`
      }
    });
    document.getElementById("filter-field").innerHTML = aux

    let valueEl = document.getElementById("filter-value");
    let fieldEl = document.getElementById("filter-field");

    function customFilter(data) {
      return data.car && data.rating < 3;
    }
    //Trigger setFilter function with correct parameters
    function updateFilter() {
      var filterVal = fieldEl.options[fieldEl.selectedIndex].value;
      var filter = filterVal == "function" ? customFilter : filterVal;
      if (filterVal != "no") {
        table.setFilter(filter, "like", valueEl.value);
      }
    }
  }
}