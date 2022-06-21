class Screenshot {
  constructor() {
    this.component = `
    <div class="leaflet-control-scrshot center-flex" id="screenshot" title="screenshot" onclick=saveImage('mapa') data-html2canvas-ignore="true">
        <div class="center-flex" id="iconSC-container">
          <div id="iconSC"><span class="fa fa-camera" aria-hidden="true"></span></div>
        </div>
    </div>
    `;
  }

  createComponent() {
    const elem = document.createElement("div");
    elem.innerHTML = this.component;
    document.getElementById("mapa").appendChild(elem);
  }
}

const saveImage = async (el) => {
  // Change icon state
  var icon = document.querySelector('#iconSC .fa');
  icon.classList.remove("fa-camera");
  icon.classList.add('fa-spinner');
  // Animate the icon with the CSS animation property
  document.getElementById('iconSC').style.animation = 'spin 1s linear infinite';

  // Get the map element
  let mapElm = document.getElementById(el);
  // Get map sizes
  let width = mapElm.offsetWidth;
  let height = mapElm.offsetHeight;

  leafletImage(mapa, function(err,canvas) {
    if(err){
      alert('Ocurrio un error al descargar la imagen');
      console.warn(err);

      document.getElementById('iconSC').style.animation = 'none';
      icon.classList.remove('fa-spinner');
      icon.classList.add("fa-camera");

      return null;
    }

    // Create an img element where set the image
    var img = document.createElement('img');
    img.width = width;
    img.height = height;
    // Set the src with the obtained canvas
    img.src = canvas.toDataURL();
    // Put into an a element to automatic download
    let a = document.createElement("a");
    a.id = "saveAsSC";
    let data = canvas.toDataURL("image/png");
    a.setAttribute("href", data);
    let d = new Date();
    let n = d.getTime();
    a.setAttribute("download", "mapaIGN" + n + ".png");
    // Simulate the event
    a.click();

    // Leave the icon as it was initially
    document.getElementById('iconSC').style.animation = 'none';
    icon.classList.remove('fa-spinner');
    icon.classList.add("fa-camera");
  })

}