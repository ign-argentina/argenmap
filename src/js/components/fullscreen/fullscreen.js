class Fullscreen {
  constructor() {
    this.component = `
      <div class="center-flex" id="fullscreen" title="Pantalla Completa" onclick=toggleFullScreen()>
          <div class="center-flex" id="iconFS-container">
            <i id="iconFS"class="fas fa-expand" aria-hidden="true"></i>
          </div>
      </div>
      `;
  }

  createComponent() {
    const elem = document.createElement("div");
    elem.className = "leaflet-control-locate leaflet-bar leaflet-control";
    elem.id = "fullscreen";

    let isChrome =
      /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    let shadow_style = "0 1px 5px rgb(0 0 0 / 65%)";
    let border_style = "none";
    let size = "26px";
    if (!isChrome) {
      shadow_style = "none";
      border_style = "2px solid rgba(0, 0, 0, 0.2)";
      size = "34px";
    }

    elem.style.width = size;
    elem.style.height = size;
    elem.style.border = border_style;
    elem.style.boxShadow = shadow_style;

    elem.innerHTML = this.component;
    document.getElementById("mapa").appendChild(elem);
    //document.querySelector(".leaflet-bottom.leaflet-left").appendChild(elem);
  }
}

function toggleFullScreen() {
  var icon = document.querySelector("#iconFS");
  if (!document.fullscreenElement) {
    icon.classList.remove("fas", "fa-expand");
    icon.classList.add("fas", "fa-compress");
    document.documentElement.requestFullscreen();
  } else if (document.exitFullscreen) {
    icon.classList.remove("fas", "fa-compress");
    icon.classList.add("fas", "fa-expand");
    document.exitFullscreen();
  }
}
