/**
 * @todo Evaluate using customElements.
*/
let batman_URL = "https://media.tenor.com/GvhT-DxYb1IAAAAC/batman-superhero.gif";
let baseMapData = [{ name: "Argenmap", id: 'argenmap', imgSrc: "src/styles/images/argenmap.webp", option: [{ leyends: 'src/styles/images/legends/argenmap.webp', shadow: true }] }, { name: "Argenmap Gris", id: 'argenmap-gris', imgSrc: "src/styles/images/argenmap-gris.webp", option: "" }, { name: "Argenmap oscuro", id: 'argenmap-oscuro', imgSrc: "src/styles/images/argenmap-oscuro.webp", option: "" }, { name: "Argenmap Topo", id: 'argenmap-topo', imgSrc: "src/styles/images/argenmap-topo.webp", option: "" }];

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

  addTo(target) {
    if (!this.element) {
      console.error('No se ha creado un elemento para agregar.');
      return;
    }

    if (typeof target === 'string') {
      // Si el argumento es un string, asumimos que es un ID
      const targetElement = document.getElementById(target);
      if (targetElement) {
        targetElement.appendChild(this.element);
      } else {
        console.error('No se encontró un elemento con el ID: ' + target);
      }
    } else if (target instanceof HTMLElement) {
      // Si el argumento es un elemento HTML, lo utilizamos como contenedor
      target.appendChild(this.element);
    } else if (typeof target === 'object' && target.hasOwnProperty('element') && target.element instanceof HTMLElement) {
      // Si el argumento es un objeto con una propiedad 'element', lo utilizamos como contenedor
      target.element.appendChild(this.element);
    } else {
      console.error('No se pudo agregar el elemento al destino especificado.');
    }
  }

  // addTo(id) {
  //   if (this.element && document.getElementById(id)) {
  //     document.getElementById(id).appendChild(this.element);
  //   } else {
  //     if (this.element) {
  //       console.error('there is not an element with such id ' + id)
  //     } else {
  //       console.error('this object has not html element in it')
  //     }
  //   }
  // }

  addToElement(element) {
    element.appendChild(this.element)
  }

  addToObjet(objet) {
    const parentElement = objet.getElement();

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

  getElement() {
    return this.element
  }

  remove() {
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


class BaseMapMenu extends Menu {
  constructor(containerId) {
    super();
    this.container = this.createMenuContainer();

    baseMapData.forEach((option) => {
      this.addItem(option)
    });

    const addBaseMapBtn = new Button('add-base-map-btn', 'add-base-map-btn', 'fa-solid fa-plus', null, this.openAddBaseMap);
    addBaseMapBtn.addToElement(this.container)
    // this.container.append(addBaseMapBtn);

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

  openAddBaseMap() {
    const menuBaseMap = new MenuBaseMap();
    menuBaseMap.toggleOpen();
  }
}

class BaseMapItem extends UIComponent {
  constructor(options) {
    super();

    const auxElemt = this.createElement('div', options.id, 'base-map-item');

    const image = new Imagen(options.id, options.imgSrc, options.name, options.className, options.name);
    image.addToElement(auxElemt)

    const text = this.createElement('span', null, 'base-map-item-text');
    text.textContent = options.name;
    auxElemt.appendChild(text);

    const button = new OptionMenuButton(options.option, options.id);
    button.addToElement(auxElemt)

    return auxElemt
  }
}

class OptionMenuButton extends UIComponent {
  constructor(options, id) {
    super();
    const baseMapOptsBtn = new Button('opt-base-map-btn', 'opt-base-map-btn', 'fa-solid fa-ellipsis-vertical', null, () => this.openBaseMapOpts(options, id));
    return baseMapOptsBtn
  }
  openBaseMapOpts(options, id) {
    const optsContainer = this.createElement('div', 'base-map-opts-menu', 'base-map-opts-menu');
    if (options) {
      options.forEach(element => {
        const optsItem = this.createElement('div', 'bm-opt-item', 'bm-opt-item');
        if (element.leyends) {
          const icon = this.createElement('span', 'opt-btn-icon', 'fa-solid fa-info');
          optsItem.appendChild(icon);
          optsItem.innerText = 'Ver leyendas';
          optsItem.addEventListener('click', () => console.log('Mostrar leyendas'));
        }
        if (element.shadow) {
          const icon = this.createElement('span', 'opt-btn-icon', 'fa-solid fa-mountain');
          optsItem.appendChild(icon);
          optsItem.innerText = 'Agregar sombras';
          optsItem.addEventListener('click', () => console.log('Agregar sombras'));
        }
        optsContainer.appendChild(optsItem);
      });
    }
    document.getElementById(id).append(optsContainer);
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

class Dialog extends UIComponent {
  // returns an empty dialog with close and custom buttons
  constructor() {
    super();
  }
}

class Button extends UIComponent {
  // returns a button with custom text and action triggered by click event
  constructor(id, classList, iconClass, innerText = '', clickHandler) {
    super();
    const button = this.createElement("button", id, classList);
    button.innerHTML = innerText;

    if (iconClass) {
      const icon = this.createElement('span', classList + '-icon', iconClass);
      button.appendChild(icon);
    }

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
    this.createModal()
  }

  createModal() {

    const colorButtons = ['#ff0000'/*red*/, '#0000ff' /*blue*/, '#008000' /*green*/, '#ffff00' /*yellow*/, '#ffa500' /*orange*/, '#8000ff' /*violet*/];

    //1. creates a series of boutton objets that represent the color to select
    colorButtons.forEach(color => {
      const colorButton = new Button(null, 'outLine', null,  "hell", () => {
        console.log(color);
        this.changeColorValue(color);
      });

      colorButton.changeStyle("backgroundColor", color);
      colorButton.removeStyle()
      colorButton.addTo(this.element);
    });

    const funcionparametro = function () {
      console.log("el color debería ser lindo");
    }

    //2. it creates a input color objet an adds it to the this.idContainer set into the parameter 
    this.color = new InputColor("helpidunnowhqatimdoing", "outLine")
    this.color.removeStyle()
    this.color.changeStyle('height', '20px')
    this.color.changeInnerHtml("Más colores");
    this.color.addTo(this.element);


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

document.addEventListener("DOMContentLoaded", function () {
  /* const parentContainer = new Container('parentContainer', 'container-class');
  const childContainer = new Container('childContainer', 'container-class');
  parentContainer.addToElement(document.body);
  childContainer.addToObjet(parentContainer); */
  const baseMapMenu = new BaseMapMenu('body');
});

