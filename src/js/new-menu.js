class MenuUI {
    menuUI = null;
    //elements = {};

    constructor(id, name, nodeType, className) {
        this.menuUI = document.createElement(nodeType);
        this.menuUI.id = id;
        this.menuUI.name = name;
        this.menuUI.className = className;
    }

    getContent() {
        return this.menuUI;
    }

    addTo(parentID) {
        let _parent = document.getElementById(parentID);
        if (!_parent) {
            return new UserMessage("El nodo HTML de destino no existe.", true, "error");
        }
        _parent.appendChild(this.menuUI);
    }
    remove() {
        this.menuUI.remove();
    }
    setStyle(cssClass) {
        // validar si la clase existe
        this.menuUI.className = cssClass;
    }
}
class Menu extends MenuUI {
    constructor(options, callback) {
        super(options.id, options.name, options.nodeType, options.className);
        this.menuUI.type = options.type;
    }

    sort() {}

    addItem(options) {
        let item = new ItemUI(options);
        //agrega el boton al  menu de capas
        item.addTo()
    }

}
// class LayerMenu extends Menu {
//     constructor(options, callback) {
//         super(options, callback);
//     }
//     sort() {}
// }

function navbarBehavior() {
    //escucha al evento click de los hijos y mostrara el menu de cada uno
}

//MenuUI
let navbar1 = new MenuUI("navbar-ui", "navbarUI", "button", "navbar-ui");
//navbar1.addTo("sidebar-container");

//Menus
let menuOptions = {id: "navbar", className: "navbar-submenu", nodeType: "div", type: "esUnString"};
let navbar = new Menu(menuOptions, navbarBehavior);
// navbar.addTo("navbar-container");

// let layerMenuOptions = {id: "layer-menu", className: "navbar-submenu", nodeType: "ul"};
// let layerMenu = new LayerMenu(layerMenuOptions);
//layerMenu.addTo("navbar");

// let helpMenuOptions = {id: "help-menu", className: "navbar-submenu", };
// let helpMenu = new Menu(helpMenuOptions);
// helpMenu.addTo("navbar");

// let processMenuOptions = {id: "process-menu", className: "navbar-submenu"};
// let processMenu = new Menu(processMenuOptions);
// processMenu.addTo("navbar");

// //Menu-specific
// let layerListOptions = {id: "layer-list", className: "layer-list"};
// let layerList = new Menu(layerListOptions);
// navbar.addTo("layer-menu");


//ItemUI
// class ItemUI extends MenuUI {
//     constructor(options, callback) {
//         super(options.id, options.name, options.nodeType, options.className)
//     }
//     onclick() {
//         //detecta el click y llama a callback
//     }
// }

// class Layer {
//     constructor() {
//     }
//     add(_mapId) {
//         this.addTo(_mapId)
//     }
    
//     let layers = data.layers
//     layers.array.forEach(layer => {
//         let _layer = new Layer(layer);
        
//         //genero un boton por capa
//         let itemOptions = {id: layer.id + "_btn", className: "layer-btn", nodeType: "button"}
//         let item = new ItemUI(itemOptions, _layer.add())
//         //agrega el boton al menu de capas
//         item.addTo("layer-menu");
//     });
// }