class AboutButton {
    constructor() {
      this.component = `
        <a id="iconABOUT-container" title="Acerca de nosotros">
          <i class="fa-regular fa-address-card"></i>
        </a>
        `;
    }
  
    createComponent() {
      const elem = document.createElement("div");
      elem.className = "leaflet-bar leaflet-control";
      elem.id = "AboutButton";
      elem.innerHTML = this.component;
      elem.onclick = onClickAboutFede;
      document.querySelector(".leaflet-top.leaflet-left").append(elem);
    }
  }


  function onClickAboutFede(){

    var icon = document.querySelector("#iconFS");



  }