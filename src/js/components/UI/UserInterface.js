/**
 * @todo Evaluate using customElements.
*/
let batman_URL = "https://media.tenor.com/GvhT-DxYb1IAAAAC/batman-superhero.gif";
let baseMapData = [
  {
    name: "Argenmap", id: 'argenmap', imgSrc: "src/styles/images/argenmap.webp",
    option: [{ leyends: 'src/styles/images/legends/argenmap.webp', shadow: true }]
  },

  {
    name: "Argenmap Gris", id: 'argenmap-gris', imgSrc: "src/styles/images/argenmap-gris.webp",
    option: ""
  },

  {
    name: "Argenmap oscuro", id: 'argenmap-oscuro', imgSrc: "src/styles/images/argenmap-oscuro.webp",
    option: ""
  },

  {
    name: "Argenmap Topo", id: 'argenmap-topo', imgSrc: "src/styles/images/argenmap-topo.webp",
    option: ""
  }];

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

  addClass(className) {
    if (this.element) {
      this.element.classList.add(className);
    } else {
      console.error('No se ha creado un elemento al que agregar la clase.');
    }
  }

  changeInnerHtml(string) {
    if (this.element) {
      this.element.innerText = string;
    }
  }

  changeStyle(styleProperty, styleValue) {
    if (this.element) {
      this.element.style[styleProperty] = styleValue;
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
  //an empty list with methods for sorting, filter, etc
  constructor(id = null, className = null) {
    super();
    this._items = [];
    this._groups = [];
    this._selectedItems = [];
    this.element = this.createElement('ul', id, className)
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
  constructor(id, className) {
    super();
    this.element = this.createElement('ul', id, className);
    this.element.style.padding = '0px';


    baseMapData.forEach((option) => {
      this.addItem(option)
    });

    const moreBaseMaps = new Button('add-base-map-btn', 'add-base-map-btn', 'fa-solid fa-plus', null, this.openAddBaseMap);
    moreBaseMaps.addTo(this.element)
  }

  addItem(itemOptions) {
    const baseMapItem = new BaseCapTemplate(itemOptions);
    
    baseMapItem.addTo(this.element)
  }

  openAddBaseMap() {
    const menuBaseMap = new MenuBaseMap();
    menuBaseMap.toggleOpen();
  }
}

class BaseCapTemplate extends UIComponent {
  constructor(options) {
    super();
    this.isShowingOptions = false

    this.element = this.createElement('li', options.id, null);

    const container = new Container(null, 'base-cap-template');

    const image = new Imagen(options.id, options.imgSrc, options.name, options.className, options.name);
    image.addTo(container)

    const label = new Label(null, 'base-map-item-text',null, options.name)
    label.addTo(container)

    const optionsContainer = new Menu()
    optionsContainer.changeStyle('grid-column', '1/4')
    optionsContainer.changeStyle('padding', '0px')


    const openBaseMapOpts = (options, id) => {
      if (this.isShowingOptions == false) {
        if (options) {

          options.forEach(element => {
            if (element.leyends) {
              const leyendButtonContainer = new Container(null, 'optionbutton-container')
              const legendIcon = new Label(null, null, 'fa-solid fa-info', null)
              const legendTitle = new Label(null, null, null, 'Ver leyenda')
              const futurecheckbox = new Button(null, null, null, null, () => console.log('Mostrar leyendas'))

              legendIcon.addTo(leyendButtonContainer)
              legendTitle.addTo(leyendButtonContainer)
              futurecheckbox.addTo(leyendButtonContainer)

              leyendButtonContainer.addTo(optionsContainer)

            }


            if (element.shadow) {
              const shadowButtonContainer = new Container(null, 'optionbutton-container')
              const shadowIcon = new Label(null, null, 'fa-solid fa-mountain', null)
              const shadowTitle = new Label(null, null, null, 'Agregar sombras de motaña')
              const futurecheckbox = new Button(null, null, null, null, () => console.log('Agregar sombras de motaña'))


              shadowIcon.addTo(shadowButtonContainer)
              shadowTitle.addTo(shadowButtonContainer)
              futurecheckbox.addTo(shadowButtonContainer)

              shadowButtonContainer.addTo(optionsContainer)

            }
          });

        }
        this.isShowingOptions = true;
      } else {
        const element = optionsContainer.getElement()
        while (element.firstChild) {
          element.removeChild(element.firstChild);
        }
        this.isShowingOptions = false;
      }
    }

    if (options.option) {
      const button = new Button(
        'opt-base-map-btn',
        'opt-base-map-btn',
        'fa-solid fa-ellipsis-vertical',
        '',
        () => openBaseMapOpts(options.option, options.id));
      button.changeStyle('justify-self', 'end')
      button.addTo(container)
    }





    optionsContainer.addTo(container)
    container.addTo(this.element)


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
  constructor(id, className, iconClass, textContent) {
    super();

    const label = this.createElement('span', id, className);
    
    if (iconClass) {
      const icon = this.createElement('i', null, iconClass);
      label.appendChild(icon);
    }

    if (textContent) {
      label.appendChild(document.createTextNode(textContent));
    }

    this.element = label;
  }

  setText(textContent) {
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }
    if (textContent) {
      this.element.appendChild(document.createTextNode(textContent));
    }
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
    this.element.style.textAlign = 'left';
    this.element.style.paddingLeft = '15px'
  }
}
class InputColor extends Input {
  constructor(id, className) {
    super(id, className, 'color'); 
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
    container.classList.add('generic-colorpicker')
    this.idContainer = id
    this.element = container;
    this.createModal()
  }

  createModal() {

    const colorButtons = ['#ff0000'/*red*/, '#0000ff' /*blue*/, '#008000' /*green*/, '#ffff00' /*yellow*/, '#ffa500' /*orange*/, '#8000ff' /*violet*/];

    //1. creates a series of boutton objets that represent the color to select
    colorButtons.forEach(color => {
      const colorButton = new Button(null, 'darker-button', null, null, () => {
        this.changeColorValue(color);
      });

      colorButton.changeStyle("backgroundColor", color);
      colorButton.changeStyle("border", 'none');

      colorButton.addTo(this.element);
    });

    const funcionparametro = function () {
      console.log("el color debería ser lindo");
    }

    //2. it creates a input color objet an adds it to the this.idContainer set into the parameter 
    this.color = new InputColor(null, 'darker-button')
    this.color.removeStyle()
    this.color.changeStyle('border', 'none')
    this.color.changeStyle('width', '100%')
    this.color.changeValue('#4c4c4c');
    this.color.addTo(this.element);


  }

  //3. the color will be taken from the inputColor objet, so we will need to change the color of it.
  changeColorValue(color) {
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

  const baseMapMenu = new BaseMapMenu('base-map-menu', 'base-map-menu');
  baseMapMenu.addTo('mapa')

});

