class Fullscreen {
  constructor() {
    this.component = `
      <div class="center-flex" id="iconFS-container" title="Pantalla Completa" onclick=toggleFullScreen()>
            <i id="iconFS" class="fas fa-expand center-flex" aria-hidden="true"></i>
      </div>
      `;
  }

  createComponent() {
    const elem = document.createElement("div");
    elem.className = "leaflet-bar leaflet-control";
    elem.id = "fullscreen";

    /* let isChrome = L.Browser.webkit;
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
    elem.style.boxShadow = shadow_style; */

    elem.innerHTML = this.component;
    document.querySelector(".leaflet-top.leaflet-left").append(elem);
  }
}

function toggleFullScreen() {
  var icon = document.querySelector("#iconFS");
  if (!document.fullscreenElement) {
    icon.classList.remove("fas", "fa-expand");
    icon.classList.add("fas", "fa-compress");
    document.getElementById("iconFS-container").title =
      "Salir de pantalla completa";
    document.documentElement.requestFullscreen();
  } else if (document.exitFullscreen) {
    icon.classList.remove("fas", "fa-compress");
    icon.classList.add("fas", "fa-expand");
    document.getElementById("iconFS-container").title = "Pantalla completa";
    document.exitFullscreen();
  }
}
