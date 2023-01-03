let areHiddenLeft = false;
let areHiddenRigth = false;
let locate = null;
let zoomhome = null;
let customgraticule = null;
let measure = null;
let loadLayersButton = null;
let leafletbottom = null;
let drawb = null;
let screenshot = null;
let divbar = null;
let icongeop = null;
let fullscreen = null;
class SidebarTools {
  constructor() {
    this.component = `
    <span id="sidebar-toolbar-span"class="glyphicon glyphicon-option-vertical" aria-hidden="true">
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

    document.querySelector("#sidebar-toolbar-icon-left").addEventListener("click", function () {
        locate = document.getElementsByClassName("leaflet-control-locate");
        zoomhome = document.getElementsByClassName("leaflet-control-zoomhome");
        customgraticule = document.getElementsByClassName("leaflet-control-customgraticule");
        measure = document.getElementsByClassName("leaflet-control-measure");
        loadLayersButton = document.getElementById("loadLayersButton");
        leafletbottom = document.getElementsByClassName("leaflet-bottom");
        drawb = document.getElementsByClassName("leaflet-top leaflet-right");
        //screenshot = document.getElementById("screenshot");
        divbar = document.getElementsByClassName("leaflet-bar leaflet-control");
        fullscreen = document.getElementById("fullscreen");
        icongeop = document.getElementById("geoprocesos-icon");

        if (areHiddenLeft) {
          /*if (window.matchMedia("(max-width: 400px)").matches) {
            this.style.left = "40px";
          } else {
            this.style.left = "46px";
          }*/

          areHiddenLeft = false;
          zoomhome[0].hidden = false;
          customgraticule[0].hidden = false;
          locate[0].hidden = false;
          measure[0].hidden = false;
          loadLayersButton.style.display = "";
          //screenshot.style.display = "";
          divbar[2].hidden = false;
          icongeop.style.display = "";
          fullscreen.style.display = "";
        } else {
          //this.style.left = "10px";
          areHiddenLeft = true;
          //zoomhome[0].hidden = true;
          customgraticule[0].hidden = true;
          locate[0].hidden = true;
          measure[0].hidden = true;
          loadLayersButton.style.display = "none";
          //screenshot.style.display = "none";
          divbar[2].hidden = true;
          icongeop.style.display = "none";
          fullscreen.style.display = "none";
        }
      });

    document.querySelector("#sidebar-toolbar-icon-right").addEventListener("click", function () {
        drawb = document.getElementsByClassName("leaflet-top leaflet-right");
        let isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        let pos_right_max600 = "36px";
        let pos_right = "46px";
      if (!isChrome) {
        pos_right_max600 = "36px";
        pos_right = "54px";

      }
        if (areHiddenRigth) {
          areHiddenRigth = false;
          drawb[0].hidden = false;
          if (window.matchMedia("(max-width: 600px)").matches) {
            this.style.right = pos_right_max600;
          } else {
            this.style.right = pos_right;
          }
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
