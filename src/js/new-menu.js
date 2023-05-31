class MenuUI {
    menuUI = null;
    //elements = {};

    constructor(id, name, nodeType) {
        this.name = name;
        this.menuUI = document.createElement(nodeType);
        this.menuUI.id = id;
        //this.menuUI.className;
    }

    getMenuUI() {
        return this.menuUI;
    }

    addTo(parentID) {
        let _parent = document.getElementById(parentID);
        if (!_parent) {
            return new UserMessage("el nodo HTML de destino no existe", true, "error");
            // _parent += _parent + "_" + Math.random();
        }
        _parent.appendChild(this.menuUI);
    }
    remove(id) {
        let _element = document.getElementById(id);
        _element.remove();
    }
    setStyle(cssClass) {
        // validar si la clase existe
        // si existe cambaitar, sino arroja advertencia
        this.menuUI.className = cssClass;
    }
}

class Menu extends MenuUI {
    constructor(type) {
        super()
        this.type = type;
    }
    sort() {
    }
    getElements() {
    }
}

function navbarBehavior() {
    //escucha al evento click de los hijos y mostara el menu de cada uno
}

// //Menus
// let menuOptions = {id: "navbar", className: "navbar-submenu"};
// let navbar = new Menu(menuOptions, navbarBehavior);
// navbar.addTo("navbar-container");

// let layerMenuOptions = {id: "layer-menu", className: "navbar-submenu", nodeType: "ul"};
// let layerMenu = new Menu(layerMenuOptions);
// layerMenu.addTo("navbar");

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



// class Item extends MenuUI {
//     constructor(options, callback) {
//         this.super();
//     }
//     onclick() {
//         //detecta el click y llama a callback
//     }
// }

// class Layer extends ParentClass {
//     constructor() {
//         this.super();
//     }
//     add(_mapId) {
//         this.addTo(_mapId)
//     }
    
//     let layers = data.layers
//     layers.array.forEach(layer => {
//         let _layer = new Layer(layer);
        
//         //genero un boton por capa
//         let itemOptions = {id: layer.id + "_btn", className: "layer-btn"}
//         let item = new Item(itemOptions, _layer.add())
//         //agrega el boton al menu de capas
//         item.addTo("layer-menu");
//     });
    
// }