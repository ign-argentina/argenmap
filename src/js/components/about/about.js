class AboutButton {
  constructor() {
    this.isVisible = false;
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
    elem.onclick = onClickAboutFede.bind(this);
    document.querySelector(".leaflet-top.leaflet-left").append(elem);

    
  }

  

}

function onClickAboutFede() {
  

  if (!this.isVisible) {
    // Código para abrir el popup
    const popup = document.createElement("div");
    popup.innerHTML = "About Precario";
    popup.id = "Center-about"


    // Provisional 
    popup.style.position = "absolute";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.background = "white";
    popup.style.padding = "20px";
    popup.style.border = "1px solid black";

    document.body.appendChild(popup);


    this.isVisible = true;

  }else{

    // Cerrar popup

    const popup = document.getElementById("Center-about");
    if (popup) {
      popup.remove();
    }
    
    this.isVisible = false;

  }

}