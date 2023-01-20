class PdfPrinter {
  constructor() {
    this.component = `
        <div class="center-flex" id="iconPDF-container" title="Imprimir/ Guardar en PDF" onclick=print()>
              <i id="iconPDF" class="fas fa-print" aria-hidden="true"></i>
        </div>
        `;
  }

  createComponent() {
    const elem = document.createElement("div");
    elem.className = "leaflet-bar leaflet-control";
    elem.id = "pdfPrinter";

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
    document.querySelector(".leaflet-top.leaflet-left").append(elem);
  }
}
