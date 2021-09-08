class Screenshot {
  constructor() {
    this.component = `
    <div class="center-flex" id="screenshot" title="screenshot" onclick=capturetoPNG('mapa') data-html2canvas-ignore="true">
        <div class="center-flex" id="iconSC-container">
            <span class="fa fa-camera" aria-hidden="true"  ></span>
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

function capturetoPNG(el) {
  //ignore elements
  let auxleft = document.getElementsByClassName("leaflet-top leaflet-left");
  auxleft[0].setAttribute("data-html2canvas-ignore", "true");
  let auxright = document.getElementsByClassName("leaflet-top leaflet-right");
  auxright[0].setAttribute("data-html2canvas-ignore", "true");
  let auxbleft = document.getElementsByClassName("leaflet-bottom leaflet-left");
  auxbleft[0].setAttribute("data-html2canvas-ignore", "true");
  let mapa =  document.getElementById("mapa")
  if(mapa.querySelectorAll('svg.leaflet-zoom-animated')[0]){
    mapa.querySelectorAll('svg.leaflet-zoom-animated')[0].setAttribute("data-html2canvas-ignore", "true");
  }

  let id = "#" + el;
  html2canvas(document.querySelector(id), {
    logging: false, //consola off
    allowTaint : false,
    useCORS: true
  }).then((canvas) => {
    let a = document.createElement("a");
    a.id = "saveAsSC";
    let data = canvas.toDataURL("image/png");
    a.setAttribute("href", data);
    let d = new Date();
    let n = d.getTime();
    a.setAttribute("download", "mapaIGN" + n + ".png");
    a.click();
  });
}
