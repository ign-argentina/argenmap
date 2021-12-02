let areHiddenLeft = false;
let areHiddenRigth = false;
let locate = null;
let zoomhome = null;
let fullscreen = null;
let customgraticule = null;
let measure = null;
let abrirarchivo = null;
let leafletbottom = null;
let drawb = null;
let screenshot = null;
let divbar = null;
let icongeop = null;
class SidebarTools {
  constructor() {
    locate = document.getElementsByClassName(
      "leaflet-control-locate leaflet-bar leaflet-control"
    );
    zoomhome = document.getElementsByClassName(
      "leaflet-control-zoomhome leaflet-bar leaflet-control"
    );
    fullscreen = document.getElementsByClassName(
      "leaflet-control-zoom-fullscreen fullscreen-icon"
    );
    customgraticule = document.getElementsByClassName(
      "leaflet-control leaflet-control-customgraticule"
    );
    measure = document.getElementsByClassName(
      "leaflet-control-measure leaflet-bar leaflet-control"
    );
    abrirarchivo = document.getElementById("modalgeojson");
    leafletbottom = document.getElementsByClassName("leaflet-bottom");
    drawb = document.getElementsByClassName("leaflet-top leaflet-right");
    screenshot = document.getElementById("screenshot");
    icongeop = document.getElementById("geoprocesos-icon");
    console.log(icongeop)
    divbar = document.getElementsByClassName("leaflet-bar leaflet-control");
    this.component = `
    <span data-html2canvas-ignore="true" id="sidebar-toolbar-span"class="glyphicon glyphicon-option-vertical" aria-hidden="true">
    `;
  }

  createComponent() {
    const elem = document.createElement("div");
    elem.id = "sidebar-toolbar-icon-left";
    elem.innerHTML = this.component;

    const elemright = document.createElement("div");
    elemright.id = "sidebar-toolbar-icon-right";
    elemright.innerHTML = this.component;

    document.getElementById("mapa").appendChild(elem);
    document.getElementById("mapa").appendChild(elemright);

    $("#sidebar-toolbar-icon-left").click(function () {
      if (areHiddenLeft) {
        if (window.matchMedia("(max-width: 400px)").matches) {
          this.style.left = "36px";
        } else {
          this.style.left = "46px";
        }

        areHiddenLeft = false;
        zoomhome[0].hidden = false;
        fullscreen[0].style.display = "";
        customgraticule[0].hidden = false;
        locate[0].hidden = false;
        measure[0].hidden = false;
        abrirarchivo.style.display = "";
        screenshot.style.display = "";
        divbar[2].hidden = false;
        icongeop.style.display = ""
      } else {
        this.style.left = "10px";
        areHiddenLeft = true;
        zoomhome[0].hidden = true;
        fullscreen[0].style.display = "none";
        customgraticule[0].hidden = true;
        locate[0].hidden = true;
        measure[0].hidden = true;
        abrirarchivo.style.display = "none";
        screenshot.style.display = "none";
        divbar[2].hidden = true;
        icongeop.style.display = "none"
      }
    });

    $("#sidebar-toolbar-icon-right").click(function () {
      if (areHiddenRigth) {
        areHiddenRigth = false;
        drawb[0].hidden = false;
        this.style.right = "46px";
      } else {
        areHiddenRigth = true;
        drawb[0].hidden = true;

        if (window.matchMedia("(max-height: 400px)").matches) {
          this.style.right = "5px";
        } else {
          this.style.right = "10px";
        }
      }
    });

    if (window.matchMedia("(max-width: 400px)").matches) {
      $("#sidebar-toolbar-icon-right").click();
    }
  }
}
