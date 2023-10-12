/**
 * @todo Evaluate using customElements.
 */
let batman_URL = "https://media.tenor.com/GvhT-DxYb1IAAAAC/batman-superhero.gif";

class UIComponent {
  constructor() {
    this.element = null;
  }

  createElement(elementType, id, className) {
    const element = document.createElement(elementType);
    if (id) element.id = id;
    if (className) element.className = className;
    return element;
  }

  addTo(id) {
    if (this.element && document.getElementById(id)) {
      document.getElementById(id).appendChild(this.element);
    } else {
      console.error('No se ha creado un elemento para agregar.');
    }
  }

  addClass(className) {
    if (this.element) {
      this.element.classList.add(className);
    } else {
      console.error('No se ha creado un elemento al que agregar la clase.');
    }
  }
}

class Menu extends UIComponent {
  // returns an empty list with methods for sorting, filter, etc
  constructor() {
    super();
    this._items = [];
    this._groups = [];
    this._selectedItems = [];
  }

  addItem(itemOptions) { }

  sortBy(value) { }

  onEach(action) { }

  disableAll() { }

  activateAll() { }

  reset() { }

  group(items) { }

}

let baseMapData = [{ name: "Argenmap", id: 'argenmap', imgSrc: "src/styles/images/argenmap.webp", option: "" }, { name: "Argenmap Gris", id: 'argenmap-gris', imgSrc: "src/styles/images/argenmap-gris.webp", option: "" }];

class BaseMapMenu extends Menu {
  constructor(containerId) {
    super();
    this.container = this.createMenuContainer();

    baseMapData.forEach((option) => {
      this.addItem(option)
    });
    //console.log(this.container);

    document.addEventListener('DOMContentLoaded', function () {
      document.getElementById('container-fluid').append(this.container);
    })
  }

  addItem(itemOptions) {
    const baseMapItem = new BaseMapItem(itemOptions);
    console.log(typeof (baseMapItem));
    this.container.append(baseMapItem);
    this._items.push(baseMapItem);
  }

  createMenuContainer() {
    return this.createElement('div', 'base-map-menu', 'base-map-menu');
  }
}

class BaseMapItem extends UIComponent {
  constructor(options) {
    super();

    const auxElemt = this.createElement('div', options.id, 'base-map-item');

    //const image = new Imagen(options.id, options.imgSrc, options.name, options.className, options.name);
    auxElemt.appendChild(new Imagen(options.id, options.imgSrc, options.name, options.className, options.name));
    //console.log(auxElemt);
    const text = this.createElement('span', null, 'base-map-item-text');
    text.textContent = options.name;
    auxElemt.appendChild(text);

    /* const button = new OptionMenuButton(options.buttonClass);
    button.onClick(options.onClick);
    this.element.appendChild(button.element); */
    //console.log(typeof (auxElemt));
    return auxElemt
  }
}

class OptionMenuButton extends UIComponent {
  constructor(iconClass) {
    super();
    this.element = this.createElement('button', null, 'option-menu-button');
    const icon = this.createElement('span', null, 'icon ' + iconClass);
    this.element.appendChild(icon);
  }

  onClick(callback) {
    this.element.addEventListener('click', callback);
  }
}

class TabElement extends UIComponent {
  //creates a tab to display a certain part of a modal
  constructor(name, id, className, event) {
    super()
    const tab = document.createElement("div")
    tab.innerHTML = name
    tab.id = id
    tab.className = className

    //There is probably a better way to handle this part, for now it will be the same as the existing one
    if (event && typeof event === 'function') {
      tab.addEventListener('click', event);
    }

    this.element = tab;
  }
}

class Imagen extends UIComponent {
  // returns an image
  constructor(id, src, altTxt, className, title) {
    super();
    const img = this.createElement('img', id, className);
    img.src = src;
    img.alt = altTxt;
    img.title = title;

    //this.rotation = 90;
    this.element = img;
    return img
  }

  getRotatedB() {
    this.element.style.transition = "200ms"
    this.element.style.transform = `rotate(${this.rotation}deg)`
    this.rotation += 90;
  }
}
class Label extends UIComponent {
  // returns a label
  constructor() {
    super();
  }
}

//Probably it will be a better idea to hace an abstract class to handle base map items, because we have the one inside the library and the one in the first "menu" 
/* class BaseMapItem extends UIComponent {
  //This BaseMapItem builds itself with a large constructor taking all the paremeters needed
  constructor(name, imgSrc, buttonClass, itemOptions) {
    super();

    // Create container
    this.id = "id-contenedor-de-prueb" //it should get here by parameter
    const container = this.createElement('div', this.id, 'justAnIdea');

    //const imgObj = new Imagen("idbonitoydescriptivo", imgSrc, "preview capa", "imagenClaseSinImaginacion", "capa")

    // Create text
    const innerText = this.createElement('span');
    innerText.innerHTML = name;
    innerText.style.width = "40px"

    // Create button

    const funcionparametro = function () {
      this.toggleOptionsVisibility(optionsList);
    }

    const btnObj = new Button("iddos", buttonClass, "!!!", funcionparametro)

    // Create options list

    const optionsList = this.createElement('ul'); //mmm ul has sense¿¿
    optionsList.style.listStyleType = 'none';

    this.isVisible = true;

    itemOptions.forEach((option) => {  //the idea is than for every option it creates a new clikeable "thing"
      const li = this.createElement('li');
      const div = this.createElement('div');

      div.innerHTML = option.label;

      if (option.action && typeof option.action === 'function') {
        div.addEventListener('click', option.action);
      }

      li.appendChild(div);
      optionsList.appendChild(li);
    });

    // console.log(imgObj)
    // imgObj.addTo("id-contenedor-de-prueb")

    container.appendChild(innerText)

    // btnObj.addTo("id-contenedor-de-prueb")
    container.appendChild(optionsList)

    this.element = container;
  }

  build() {
    //add the elements creating objets for them
  }

  toggleOptionsVisibility(optionsList) {
    if (this.isVisible) {
      optionsList.style.display = 'none';
      this.isVisible = false;
    } else {
      optionsList.style.display = 'block';
      this.isVisible = true;
    }
  }
}
 */
class Dialog extends UIComponent {
  // returns an empty dialog with close and custom buttons
  constructor() {
    super();
  }
}

class Button extends UIComponent {
  // returns a button with custom text and action triggered by click event
  constructor(id, classList, innerText, clickHandler) {
    super();
    const button = this.createElement("button", id, classList);
    button.innerHTML = innerText;
    button.style.color = "#a380d7";

    if (clickHandler && typeof clickHandler === 'function') {
      button.onclick = clickHandler;
    }

    this.element = button;
  }
}
class Input extends UIComponent {
  constructor(id, className, type) {
    super();
    this.createInput(id, className, type);
  }

  createInput(id, className, type) {
    const input = this.createElement("input", id, className);
    input.type = type;
    this.element = input;
  }

  getValue() {
    return this.element.value;
  }

  setValue(value) {
    this.element.value = value;
  }
}

class InputText extends Input {
  constructor(id, className, placeHolder) {
    super(id, className, 'text');
    this.element.placeholder = placeHolder;
  }
}
class InputColor extends Input {
  constructor(id, className) {
    super(id, className, 'color'); // Llama al constructor de la clase base con el tipo 'color'
  }
  whatColor(){
    return this.element.value;
  }
  changeValue(color){
    this.element.value = color;
  }
}

class InputColorUsable extends InputColor{ //this has no sense at all. 
  constructor(id, className){
    super(id, className)

    this.element = this.createModal()
  }

  createModal(){
    const container =  this.createElement('div', null, null)
    

  }

}

class Checkbox extends Input {
  // Constructor de Checkbox, crea un elemento de tipo checkbox con etiqueta personalizada
  constructor(id, className, label) {
    super(id, className, 'checkbox'); // Llama al constructor de la clase base con el tipo 'checkbox'
    this.createLabel(label);
  }

  createLabel(label) {
    const labelElement = this.createElement('label');
    labelElement.innerText = label;
    this.element.appendChild(labelElement);
  }

  isChecked() {
    return this.element.checked;
  }

  setChecked(checked) {
    this.element.checked = checked;
  }
}
/**
 * Represents the About Us modal in the user interface.
 * @extends UIComponent
 */


let baseMapMenu = new BaseMapMenu('mapa');
//console.log(baseMapMenu);