class Screenshot {

  constructor() {
    this.component = `
    <div class="center-flex" id="screenshot" title="screenshot">
        <div class="center-flex" id="iconSC-container">
            <i class="fa fa-camera" aria-hidden="true" onclick=capturemap() ></i>
            <a href="#" id="saveAsSC" hidden></a>
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


//borrar leaflet-controls // screenshot
function capturemap(){
html2canvas(document.querySelector("#mapa"), {
  allowTaint: true,
  useCORS: true
  }).then(canvas => {
    var a = document.getElementById('saveAsSC');
    var data = canvas.toDataURL('image/png');
    a.setAttribute('href',data);
    var d = new Date();
    var n = d.getTime();
    a.setAttribute('download', 'mapaIGN'+n+'.png');
    a.click();
  });
}

