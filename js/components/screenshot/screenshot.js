class Screenshot {

  constructor() {
    this.component = `
    <div class="center-flex" id="screenshot" title="screenshot">
        <div class="center-flex" id="iconSC-container">
            <span class="fa fa-camera" aria-hidden="true" onclick=capturetoPNG('mapa') ></span>
        </div>
    </div>
    `;
  }

  createComponent(){
    const elem = document.createElement('div');
    elem.innerHTML = this.component;
    document.getElementById('mapa').appendChild(elem);
  }

}


function capturetoPNG(el){
  //ignore elements
  let auxleft = document.getElementsByClassName('leaflet-top leaflet-left')
  auxleft[0].setAttribute("data-html2canvas-ignore", "true")
  let auxright = document.getElementsByClassName('leaflet-top leaflet-right')
  auxright[0].setAttribute("data-html2canvas-ignore", "true")
  let auxbleft = document.getElementsByClassName('leaflet-bottom leaflet-left')
  auxbleft[0].setAttribute("data-html2canvas-ignore", "true")
  let zoom = document.getElementById("zoom-level")
  zoom.setAttribute("data-html2canvas-ignore", "true")
  let sc = document.getElementById("screenshot")
  sc.setAttribute("data-html2canvas-ignore", "true")
  let openfile = document.getElementById("iconopenfile-container")
  openfile.setAttribute("data-html2canvas-ignore", "true")


  let id =  '#'+el
  html2canvas(document.querySelector(id), {
    allowTaint: true,
    logging: false, //consola off
    useCORS: true
    }).then(canvas => {
      let a = document.createElement('a')
      a.id= 'saveAsSC'
      let data = canvas.toDataURL('image/png');
      a.setAttribute('href',data);
      let d = new Date();
      let n = d.getTime();
      a.setAttribute('download', 'mapaIGN'+n+'.png');
      a.click()
    });
}

