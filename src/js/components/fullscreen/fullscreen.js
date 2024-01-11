class Fullscreen {
  constructor() {
    this.component = `
      <a id="iconFS-container" title="Pantalla Completa">
            <i id="iconFS" class="fas fa-expand" aria-hidden="true"></i>
      </a>
      `;
  }

  createComponent() {
    const elem = document.createElement("div");
    elem.className = "leaflet-bar leaflet-control";
    elem.id = "fullscreen";
    elem.innerHTML = this.component;
    elem.onclick = toggleFullScreen;
    document.querySelector(".leaflet-top.leaflet-right").append(elem);
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
