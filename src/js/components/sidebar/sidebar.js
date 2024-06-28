let areHiddenLeft = false;
let areHiddenRigth = false;
let locate = null;
let zoomhome = null;
let customgraticule = null;
let measure = null;
let drawb = null;
let divbar = null;
let fullscreen = null;
let pdfPrinter = null;
let screenShoter = null;

class SidebarTools {
  constructor() {
    this.component = `
    <span id="sidebar-toolbar-span"class="glyphicon glyphicon-option-vertical" aria-hidden="true">
    `;
  }

  createBtn(id, stylePosition, btnId, title) {
    const elem = document.createElement("div");
    elem.className = 'leaflet-bar leaflet-control';
    elem.id = btnId;
    elem.title = title;
    const elemIcon = document.createElement("a");
    elemIcon.id = id;
    elemIcon.innerHTML = this.component;
    elem.appendChild(elemIcon);
    elem.style = stylePosition;
    document.getElementById('mapa').appendChild(elem);
  }

  createComponent() {
    let rightPositionStyle;
    window.matchMedia("(max-width: 600px)").matches ? rightPositionStyle = "position: absolute; top: 10px; right: 36px;" : rightPositionStyle = "position: absolute; top: 10px; right: 46px;";

    this.createBtn("sidebar-toolbar-icon-left", "position: relative; top: -10px; left: 6px;", "hideBtnLeft", "Esconder herramientas");
    this.createBtn("sidebar-toolbar-icon-right", rightPositionStyle, "hideBtnRight", "Esconder herramientas");

    this.hideLeftBtns();
    this.hideRightBtns();
  }

  hideRightBtns() {
    document.querySelector("a#sidebar-toolbar-icon-right").addEventListener("click", function () {
      let btnR = document.querySelector("#hideBtnRight");
      let drawb = document.getElementsByClassName("leaflet-top leaflet-right");

      let pos_right_max600, pos_right;

      L.Browser.webkit ? (pos_right_max600 = "36px", pos_right = "46px") : (pos_right_max600 = "36px", pos_right = "46px");

      if (areHiddenRigth) {
        areHiddenRigth = false;
        drawb[0].hidden = false;

        window.matchMedia("(max-width: 600px)").matches ? btnR.style.right = pos_right_max600 : btnR.style.right = pos_right;
      } else {
        areHiddenRigth = true;
        drawb[0].hidden = true;

        window.matchMedia("(min-width: 600px)").matches ? btnR.style.right = "10px" : btnR.style.right = "5px";
      }
    });
  }

  hideLeftBtns() {
    document.querySelector("a#sidebar-toolbar-icon-left").addEventListener("click", function () {
      locate = document.getElementsByClassName("leaflet-control-locate");
      zoomhome = document.getElementsByClassName("leaflet-control-zoomhome");
      customgraticule = document.getElementsByClassName("leaflet-control-customgraticule");
      measure = document.getElementsByClassName("leaflet-control-measure");
      drawb = document.getElementsByClassName("leaflet-top leaflet-right");
      screenShoter = document.getElementById("screenShoter");
      divbar = document.getElementsByClassName("leaflet-bar leaflet-control");
      fullscreen = document.getElementById("fullscreen");
      pdfPrinter = document.getElementById("pdfPrinter");

      if (areHiddenLeft) {
        areHiddenLeft = false;
        zoomhome[0].hidden = false;
        customgraticule[0].hidden = false;
        locate[0].hidden = false;
        measure[0].hidden = false;
        divbar[2].hidden = false;
        fullscreen.style.display = "";
        screenShoter ? screenShoter.style.display = "" : null;
        pdfPrinter.style.display = "";
      } else {
        areHiddenLeft = true;
        zoomhome[0].hidden = true;
        customgraticule[0].hidden = true;
        locate[0].hidden = true;
        measure[0].hidden = true;
        divbar[2].hidden = true;
        fullscreen.style.display = "none";
        screenShoter ? screenShoter.style.display = "none" : null;
        pdfPrinter.style.display = "none";
      }
    });
  }
}
