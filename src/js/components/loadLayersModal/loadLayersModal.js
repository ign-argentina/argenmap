var LOAD_LAYERS_MODAL_OPEN = false;

class LoadLayersModal {
  constructor() {
    this.component = `
        <a id="loadLayersButtonContent" class="center-flex" onClick=modal.open()>
            <img src="src/js/components/loadLayersModal/add-layers-icon.svg" width="17" height="17">
        </a>
    `;
  }
  createComponent() {
    const elem = document.createElement("div");
    elem.className = "leaflet-bar leaflet-control";
    elem.id = "loadLayersButton";
    elem.title = "Agregar capas";
    elem.innerHTML = this.component;
    if (loadAddLayer) {
      document.querySelector(".leaflet-top.leaflet-left").append(elem);
    }
  }
}

class modalUI {
  constructor() {
    this.isOpen = false;
    this.actions = [
      {
        name: "Archivos",
        id: "files-action",
        icon: "fa-solid fa-folder",
        component: new IconModalGeojson(),
      },
      {
        name: "WMS",
        id: "wms-action",
        icon: "fa-solid fa-link",
        component: new IconModalLoadServices(),
      },
      // {
      // 	name: 'WMTS',
      // 	id: 'wmts-action',
      // 	icon: 'src/js/components/wmts/wmts-solid.svg',
      // 	component: new WmtsLoadLayers
      // },
    ];

    this.selectedAction = 0;
  }

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
    let divContainer = document.createElement("div");
    divContainer.id = "loadLayersModal";
    divContainer.className = "loadLayersModal";

    let header = document.createElement("div");
    header.classList.add("modalHeader", "center-flex-space-btw");

    let modalTitle = document.createElement("h3");
    modalTitle.innerText = "Agregar capas";

    /* let closeButton = document.createElement('button');
    closeButton.classList.add('modalCloseButton');

    closeButton.innerHTML = '<i title="cerrar" class="fa fa-times icon_close_mf" aria-hidden="true"></i>';
    closeButton.onclick = function () {
      document.body.removeChild(loadLayersModal);
      document.getElementById("loadLayersButtonContent").style.backgroundColor = "rgba(255, 255, 255, 0.9)";
      LOAD_LAYERS_MODAL_OPEN = false;
    }; */

    header.appendChild(modalTitle);

    //header.appendChild(closeButton);

    divContainer.appendChild(header);

    let mainSection = document.createElement("div");
    mainSection.classList.add("modalMainSection");

    let nav = document.createElement("div");
    nav.classList.add("modalNav");

    let content = document.createElement("div");
    content.classList.add("modalContent");

    this.actions.forEach((action, i) => {
      let btn = document.createElement("button");
      if (action.icon && action.icon.length) {
        btn.innerHTML = `<i class="${action.icon}"></i>`;
      } else {
        btn.innerText = action.name;
      }
      btn.classList.add("modalNavButton", "ag-btn", "ag-btn-secondary");
      btn.addEventListener("click", function () {
        this.selectedAction = i;
        modal.showActions(this.selectedAction);
      });

      nav.appendChild(btn);

      let actionContent = document.createElement("div");
      actionContent.id = action.id;
      actionContent.classList.add("actionContent");
      actionContent.classList.add("disableAction");
      actionContent.innerText = action.content;

      content.appendChild(actionContent);
    });

    header.appendChild(nav);
    //mainSection.appendChild(nav);
    mainSection.appendChild(content);

    divContainer.appendChild(mainSection);
    document.getElementById("load-layer").append(divContainer);

    /* $("#loadLayersModal").draggable({
      containment: "#mapa"
    }) */
  }

  open() {
    if (!LOAD_LAYERS_MODAL_OPEN) {
      //document.getElementById("loadLayersButtonContent").style.backgroundColor = "rgba(238, 238, 238, 0.9)";
      modal.createModal();
      modal.showActions(0);
      LOAD_LAYERS_MODAL_OPEN = true;
    } else {
      document.getElementById("load-layer").removeChild(loadLayersModal);
      //document.getElementById("loadLayersButtonContent").style.backgroundColor = "rgba(255, 255, 255, 0.9)";
      LOAD_LAYERS_MODAL_OPEN = false;
    }
  }

  showActions(actionIndx) {
    let elements = document.querySelectorAll(".actionContent");
    elements.forEach((el) => el.classList.add("disableAction"));
    elements[actionIndx].classList.remove("disableAction");

    let buttons = document.querySelectorAll(".modalNavButton");
    buttons.forEach((el) => el.classList.remove("modalNavButtonActive"));
    buttons[actionIndx].classList.add("modalNavButtonActive");

    // console.log(this.actions);
    // Remove previous
    // if (previous) this.actions[previous].component.removeComponent();

    let component = this.actions[actionIndx].component.createComponent();
    document.getElementById(this.actions[actionIndx].id).innerHTML = "";
    document.getElementById(this.actions[actionIndx].id).append(component);
  }
}

let modal = new modalUI();
modal.createModal();
modal.showActions(0);
