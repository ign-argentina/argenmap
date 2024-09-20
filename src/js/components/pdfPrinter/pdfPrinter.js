class PdfPrinter {
  constructor() {
    this.component = `
        <a class="iconPDF-container" title="Imprimir/ Guardar en PDF" onclick=print()>
              <i id="iconPDF" class="fas fa-print" aria-hidden="true"></i>
        </a>
        `;
  }

  createComponent() {
    const elem = document.createElement("div");
    elem.className = "leaflet-bar leaflet-control";
    elem.id = "pdfPrinter";
    elem.innerHTML = this.component;
    document.querySelector(".leaflet-top.leaflet-left").append(elem);
  }
}
