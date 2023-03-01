let areHiddenLeft = false;
let areHiddenRigth = false;
let locate = null;
let zoomhome = null;
let customgraticule = null;
let measure = null;
let loadLayersButton = null;
let drawb = null;
let divbar = null;
let icongeop = null;
let fullscreen = null;
let pdfPrinter = null;
let screenShoter = null;

class SidebarTools {
  constructor() {
    this.component = `
    <span id="sidebar-toolbar-span"class="glyphicon glyphicon-option-vertical" aria-hidden="true">
    `;
  }

  createBtn(id, stylePosition, btnId) {
    const elem = document.createElement("div");
    elem.className = 'leaflet-bar leaflet-control';
    elem.id = btnId;
    const elemIcon = document.createElement("a");
    elemIcon.id = id;
    elemIcon.innerHTML = this.component;
    elem.appendChild(elemIcon);
    elem.style = stylePosition;
    document.getElementById('mapa').appendChild(elem);
  }

  createComponent() {
    this.createBtn("sidebar-toolbar-icon-left", "position: relative; top: -10px; left: 6px;", "hideBtnLeft");
    this.createBtn("sidebar-toolbar-icon-right", "position: absolute; top: 10px; right: 46px;", "hideBtnRight");

    this.hideLeftBtns();
    this.hideRightBtns();
  }

  hideRightBtns() {
    document.querySelector("a#sidebar-toolbar-icon-right").addEventListener("click", function () {
      let btn = document.querySelector("#hideBtnRight");
      let drawb = document.getElementsByClassName("leaflet-top leaflet-right");

      let pos_right_max600 = "36px";
      let pos_right = "46px";
      if (!L.Browser.webkit) {
        pos_right_max600 = "36px";
        pos_right = "46px";
      }

      if (areHiddenRigth) {
        areHiddenRigth = false;
        drawb[0].hidden = false;

        window.matchMedia("(max-width: 600px)").matches ? btn.style.right = pos_right_max600 : btn.style.right = pos_right;
      } else {
        areHiddenRigth = true;
        drawb[0].hidden = true;

        window.matchMedia("(max-height: 400px)").matches ? btn.style.right = "5px" : btn.style.right = "10px";
      }
    });
  }

  hideLeftBtns() {
    document.querySelector("a#sidebar-toolbar-icon-left").addEventListener("click", function () {
      locate = document.getElementsByClassName("leaflet-control-locate");
      zoomhome = document.getElementsByClassName("leaflet-control-zoomhome");
      customgraticule = document.getElementsByClassName("leaflet-control-customgraticule");
      measure = document.getElementsByClassName("leaflet-control-measure");
      loadLayersButton = document.getElementById("loadLayersButton");
      drawb = document.getElementsByClassName("leaflet-top leaflet-right");
      screenShoter = document.getElementById("screenShoter");
      divbar = document.getElementsByClassName("leaflet-bar leaflet-control");
      fullscreen = document.getElementById("fullscreen");
      icongeop = document.getElementById("geoprocesos-icon");
      pdfPrinter = document.getElementById("pdfPrinter");

      if (areHiddenLeft) {
        areHiddenLeft = false;
        zoomhome[0].hidden = false;
        customgraticule[0].hidden = false;
        locate[0].hidden = false;
        measure[0].hidden = false;
        loadLayersButton.style.display = "";
        divbar[2].hidden = false;
        icongeop.style.display = "";
        fullscreen.style.display = "";
        screenShoter ? screenShoter.style.display = "" : null;
        pdfPrinter.style.display = "";
      } else {
        areHiddenLeft = true;
        zoomhome[0].hidden = true;
        customgraticule[0].hidden = true;
        locate[0].hidden = true;
        measure[0].hidden = true;
        loadLayersButton.style.display = "none";
        divbar[2].hidden = true;
        icongeop.style.display = "none";
        fullscreen.style.display = "none";
        screenShoter ? screenShoter.style.display = "none" : null;
        pdfPrinter.style.display = "none";
      }
    });
  }
}
