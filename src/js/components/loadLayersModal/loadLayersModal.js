var LOAD_LAYERS_MODAL_OPEN = false;

class LoadLayersModal {
  constructor() {
    this.component = `
        <a id="loadLayersButtonContent" class="center-flex" onClick=modal.open()>
            <img src="src/js/components/loadLayersModal/add-layers-icon.svg" width="17" height="17" alt="Agregar capas">
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

    // Main section
    let mainSection = document.createElement("div");
    mainSection.classList.add("modalMainSection");

    // Content (header irá aquí arriba)
    let content = document.createElement("div");
    content.classList.add("modalContent");

    // Header (ahora dentro de content)
    let header = document.createElement("div");
    header.classList.add("modalHeader", "center-flex-space-around");

    let modalTitle = document.createElement("h3");
    modalTitle.innerText = "Agregar capas";
    header.appendChild(modalTitle);

    let nav = document.createElement("div");
    nav.classList.add("modalNav");

    this.actions.forEach((action, i) => {
      let btn = document.createElement("button");
      if (action.icon && action.icon.length) {
        btn.innerHTML = `<i class="${action.icon}"></i>`;
      } else {
        btn.innerText = action.name;
      }
      btn.classList.add("modalNavButton", "ag-btn", "ag-btn-secondary");
      btn.addEventListener("click", () => {
        this.selectedAction = i;
        modal.showActions(this.selectedAction);
      });
      nav.appendChild(btn);
    });

    header.appendChild(nav);
    content.appendChild(header);

    // Action contents
    this.actions.forEach((action) => {
      let actionContent = document.createElement("div");
      actionContent.id = action.id;
      actionContent.classList.add("actionContent", "disableAction");
      content.appendChild(actionContent);
    });

    mainSection.appendChild(content);
    divContainer.appendChild(mainSection);
    document.getElementById("load-layer").append(divContainer);
  }

  open() {
    if (!LOAD_LAYERS_MODAL_OPEN) {
      modal.createModal();
      modal.showActions(0);
      LOAD_LAYERS_MODAL_OPEN = true;
    } else {
      const modalElem = document.getElementById("loadLayersModal");
      if (modalElem) {
        document.getElementById("load-layer").removeChild(modalElem);
      }
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

    let component = this.actions[actionIndx].component.createComponent();
    document.getElementById(this.actions[actionIndx].id).innerHTML = "";
    document.getElementById(this.actions[actionIndx].id).append(component);
  }
}

let modal = new modalUI();
modal.createModal();
modal.showActions(0);