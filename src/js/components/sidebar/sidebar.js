let areHiddenLeft = false;
let areHiddenRigth = false;
let locate = null;
let zoomhome = null;
let customgraticule = null;
let measure = null;
let loadLayersButton = null;
let leafletbottom = null;
let drawb = null;
let divbar = null;
let icongeop = null;
let fullscreen = null;
class SidebarTools {
  constructor() {
    locate = document.getElementsByClassName(
      "leaflet-control-locate leaflet-bar leaflet-control"
    );
    zoomhome = document.getElementsByClassName(
      "leaflet-control-zoomhome leaflet-bar leaflet-control"
    );
    customgraticule = document.getElementsByClassName(
      "leaflet-control leaflet-control-customgraticule"
    );
    measure = document.getElementsByClassName(
      "leaflet-control-measure leaflet-bar leaflet-control"
    );
    loadLayersButton = document.getElementById("loadLayersButton");

    leafletbottom = document.getElementsByClassName("leaflet-bottom");

    drawb = document.getElementsByClassName("leaflet-top leaflet-right");
    
    divbar = document.getElementsByClassName("leaflet-bar leaflet-control");

    fullscreen = document.getElementById("fullscreen");

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
          this.style.left = "40px";
        } else {
          this.style.left = "46px";
        }
        areHiddenLeft = false;
        zoomhome[0].hidden = false;
        customgraticule[0].hidden = false;
        locate[0].hidden = false;
        measure[0].hidden = false;
        loadLayersButton.style.display = "";
        divbar[2].hidden = false;
        document.getElementById("screenShoter").style.display = "";
        $("#geoprocesos-icon").show();
        fullscreen.style.display = "";
      } else {
        //this.style.left = "10px";
        areHiddenLeft = true;
        //zoomhome[0].hidden = true;
        customgraticule[0].hidden = true;
        locate[0].hidden = true;
        measure[0].hidden = true;
        loadLayersButton.style.display = "none";
        divbar[2].hidden = true;
        document.getElementById("screenShoter").style.display = "none";
        $("#geoprocesos-icon").hide();
        fullscreen.style.display = "none";
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
