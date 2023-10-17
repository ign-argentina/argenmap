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
      if (this.element) {
        console.error('there is not an element with such id ' + id)
      } else {
        console.error('this object has not html element in it')
      }
    }
  }

  addToElement(element){
    element.appendChild(this.element)
  }

  addToObjet(objet) {

    
    const parentElement = objet.getElement();

    console.log(parentElement)
  
    if (parentElement) {
      parentElement.appendChild(this.element);
    } else {
      console.error('Parent element not found.');
    }
  }

  addClass(className) {
    if (this.element) {
      this.element.classList.add(className);
    } else {
      console.error('No se ha creado un elemento al que agregar la clase.');
    }
  }

  appendChild(element) {

  }

  changeInnerHtml(string) {
    if (this.element) {
      this.element.innerText = string;
    }
  }

  changeStyle(styleProperty, styleValue) {
    if (this.element) {
      this.element.style[styleProperty] = styleValue;
      console.log("im doing somethin")
    }
  }

  getElement(){
    return this.element
  }

  remove(){
    this.element.remove(); 
  }

  removeStyle() { //temporal idea

    this.element.style.padding = '0';
    this.element.style.margin = '0';
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

let baseMapData = [{ name: "Argenmap", id: 'argenmap', imgSrc: "src/styles/images/argenmap.webp", option: "" }, { name: "Argenmap Gris", id: 'argenmap-gris', imgSrc: "src/styles/images/argenmap-gris.webp", option: "" },{ name: "Argenmap oscuro", id: 'argenmap-oscuro', imgSrc: "src/styles/images/argenmap-oscuro.webp", option: "" }, { name: "Argenmap Topo", id: 'argenmap-topo', imgSrc: "src/styles/images/argenmap-topo.webp", option: "" }];

class BaseMapMenu extends Menu {
  constructor(containerId) {
    super();
    this.container = this.createMenuContainer();

    baseMapData.forEach((option) => {
      this.addItem(option)
    });

    document.querySelector(containerId).appendChild(this.container);
  }

  addItem(itemOptions) {
    const baseMapItem = new BaseMapItem(itemOptions);
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

    const image = new Imagen(options.id, options.imgSrc, options.name, options.className, options.name);
    image.addToElement(auxElemt)
    //console.log(auxElemt);
    const text = this.createElement('span', null, 'base-map-item-text');
    text.textContent = options.name;
    auxElemt.appendChild(text);

    /* const button = new OptionMenuButton(options.buttonClass);
    button.onClick(options.onClick);
    this.element.appendChild(button.element); */
    console.log(auxElemt);
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
  }

  getRotatedB() {
    this.element.style.transition = "200ms"
    this.element.style.transform = `rotate(${this.rotation}deg)`
    this.rotation += 90;
  }
}
class Label extends UIComponent {
  constructor(id, className, innerHTML) {
    super();
    const label = this.createElement('span', id, className);
    label.innerHTML = innerHTML;

    this.element = label;
  }

  editContent(newText) {
    this.element.innerHTML = newText;
  }
}

class Container extends UIComponent {
  constructor(id, className) {
    super();
    const container = this.createElement('div', id, className);

    this.element = container;
  }

  toggleOpennes() {
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
    button.style.color = "#a380d7"; //revise

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
  whatColor() {
    return this.element.value;
  }
  changeValue(color) {
    this.element.value = color;
  }

}


class ColorPicker extends UIComponent {

  constructor(id, className) {
    super(id, className)

    const container = this.createElement('div', id, className)

    this.idContainer = id
    this.element = container;
  }

  createModal() {

    const colorButtons = ['#ff0000'/*red*/, '#0000ff' /*blue*/, '#008000' /*green*/, '#ffff00' /*yellow*/, '#ffa500' /*orange*/, '#8000ff' /*violet*/];

    //1. creates a series of boutton objets that represent the color to select
    colorButtons.forEach(color => {
      const colorButton = new Button(null, 'outLine', "hell", () => {
        console.log(color);
        this.changeColorValue(color);
      });

      colorButton.changeStyle("backgroundColor", color);
      colorButton.removeStyle()
      colorButton.addTo(this.idContainer);
    });



    const funcionparametro = function () {
      console.log("el color debería ser lindo");
    }




    //2. it creates a input color objet an adds it to the this.idContainer set into the parameter 
    this.color = new InputColor("helpidunnowhqatimdoing", "outLine")
    this.color.removeStyle()
    this.color.changeInnerHtml("Más colores");
    this.color.addTo(this.idContainer);


  }

  //3. the color will be taken from the inputColor objet, so we will need to change the color of it.
  changeColorValue(color) {
    console.log("changing color")
    this.color.setValue(color);
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


//console.log(baseMapMenu);


document.addEventListener("DOMContentLoaded", function () {
  const baseMapMenu = new BaseMapMenu('mapa');
  const parentContainer = new Container('parentContainer', 'container-class');
  const childContainer = new Container('childContainer', 'container-class');

  parentContainer.addToElement(document.body);
  childContainer.addToObjet(parentContainer);

});

