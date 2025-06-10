/**
 * Clase para el control de impresión/guardado en PDF del visor Leaflet.
 * Incorpora accesibilidad, manejo de errores, limpieza de recursos y agrega símbolo de norte y capas activas al PDF.
 */
class PdfPrinter {
  /**
   * Inicializa el componente de impresión PDF.
   */
  constructor() {
    /**
     * HTML del componente PDF.
     * @type {string}
     */
    this.component = `
      <a class="iconPDF-container" title="Imprimir/ Guardar en PDF" role="button" tabindex="0" aria-label="Imprimir o guardar en PDF" aria-pressed="false">
        <i id="iconPDF" class="fas fa-print" aria-hidden="true"></i>
      </a>
    `;
    /**
     * Referencia al elemento del control en el DOM.
     * @type {HTMLElement|null}
     */
    this.elem = null;
    /**
     * Referencia a los listeners para limpieza.
     * @type {Array<{el:HTMLElement,type:string,fn:Function}>}
     */
    this.handlers = [];
  }

  /**
   * Crea y agrega el componente al mapa.
   */
  createComponent() {
    try {
      const elem = document.createElement("div");
      elem.className = "leaflet-bar leaflet-control";
      elem.id = "pdfPrinter";
      elem.innerHTML = this.component;
      // Accesibilidad: soporte de teclado
      const icon = elem.querySelector('.iconPDF-container');
      if (icon) {
        icon.addEventListener('keydown', this.#onKeyDown.bind(this));
        this.handlers.push({ el: icon, type: 'keydown', fn: this.#onKeyDown.bind(this) });
        icon.onclick = this.print.bind(this);
        this.handlers.push({ el: icon, type: 'click', fn: icon.onclick });
      }
      const container = document.querySelector(".leaflet-top.leaflet-left");
      if (container) container.append(elem);
      this.elem = elem;
    } catch (e) {
      console.error('Error creando el componente PdfPrinter:', e);
    }
  }

  /**
   * Maneja eventos de teclado para accesibilidad.
   * @param {KeyboardEvent} e
   * @private
   */
  #onKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.print();
    }
  }

  /**
   * Genera e imprime/guarda el PDF con el mapa, símbolo norte, escala y capas activas con leyendas.
   * Mantiene la proporción del mapa y muestra un loading mientras se procesa.
   */
  print() {
    try {
      const PDFClass = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
      if (typeof PDFClass === 'undefined' || typeof window.L === 'undefined' || typeof window.leafletImage === 'undefined') {
        alert('jsPDF y leaflet-image son necesarios para imprimir el mapa.');
        return;
      }
      const mapObj = window.mapa || window.map;
      const mapElem = document.getElementById('mapa');
      if (!mapObj || !mapElem) {
        alert('No se encontró el mapa para imprimir.');
        return;
      }
      // Mostrar loading
      const loadingDiv = document.createElement('div');
      loadingDiv.id = 'pdf-loading';
      loadingDiv.style.position = 'fixed';
      loadingDiv.style.top = '0';
      loadingDiv.style.left = '0';
      loadingDiv.style.width = '100vw';
      loadingDiv.style.height = '100vh';
      loadingDiv.style.background = 'rgba(255,255,255,0.8)';
      loadingDiv.style.zIndex = '99999';
      loadingDiv.style.display = 'flex';
      loadingDiv.style.alignItems = 'center';
      loadingDiv.style.justifyContent = 'center';
      loadingDiv.innerHTML = '<div style="background:#fff;padding:2em 3em;border-radius:10px;box-shadow:0 0 10px #888;font-size:1.5em;font-weight:bold;">Generando PDF del mapa...</div>';
      document.body.appendChild(loadingDiv);

      // Ocultar overlays y controles temporales excepto la escala
      const overlays = Array.from(mapElem.querySelectorAll('.leaflet-control, .leaflet-top, .leaflet-right, .leaflet-left, .leaflet-bottom'));
      overlays.forEach(el => {
        if (!el.classList.contains('leaflet-control-scale')) {
          el.style.visibility = 'hidden';
        }
      });
      // Mostrar la escala en una posición fija para capturarla
      const scaleElem = mapElem.querySelector('.leaflet-control-scale');
      let scaleClone = null;
      if (scaleElem) {
        scaleClone = scaleElem.cloneNode(true);
        scaleClone.style.position = 'absolute';
        scaleClone.style.left = '20px';
        scaleClone.style.bottom = '20px';
        scaleClone.style.zIndex = '10000';
        mapElem.appendChild(scaleClone);
      }
      // Usar leaflet-image para capturar el mapa base
      window.leafletImage(mapa, (err, canvas) => {
        // Restaurar overlays y remover loading
        overlays.forEach(el => { el.style.visibility = ''; });
        if (scaleClone) mapElem.removeChild(scaleClone);
        if (document.getElementById('pdf-loading')) document.body.removeChild(loadingDiv);
        if (err || !canvas) {
          alert('No se pudo capturar el mapa.');
          return;
        }
        // Calcular tamaño proporcional para el PDF
        const pdfW = 277, pdfH = 150;
        const ratio = Math.min(pdfW / canvas.width, pdfH / canvas.height);
        const imgW = Math.round(canvas.width * ratio);
        const imgH = Math.round(canvas.height * ratio);
        const offsetX = 10 + Math.floor((pdfW - imgW) / 2);
        const offsetY = 20 + Math.floor((pdfH - imgH) / 2);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new PDFClass({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        pdf.addImage(imgData, 'PNG', offsetX, offsetY, imgW, imgH);
        // Agregar símbolo de norte (triángulo hueco y N debajo, esquina superior derecha)
        this.#drawNorthSymbol(pdf, offsetX + imgW - 20, offsetY + 10);
        // Agregar la escala (capturada como imagen)
        if (scaleElem) {
          this.#drawScaleToPDF(pdf, scaleElem, 200, 170);
        }
        // Agregar lista de capas activas con leyendas en el lateral derecho
        const capas = this.#getActiveLayersWithLegends();
        pdf.setFontSize(10);
        let y = 30;
        capas.forEach(({ titulo, legendImg }, idx) => {
          pdf.text(titulo, offsetX + imgW + 10, y);
          // Si quieres agregar leyenda, puedes hacerlo aquí (opcional)
          y += 8;
        });

        // Nombre de archivo con fecha y hora
        const now = new Date();
        const fecha = now.toLocaleDateString('es-AR').replace(/\//g, '-');
        const hora = now.toTimeString().slice(0, 5).replace(':', '-');
        pdf.save(`mapa_${fecha}_${hora}.pdf`);
      });
    } catch (e) {
      if (document.getElementById('pdf-loading')) document.body.removeChild(document.getElementById('pdf-loading'));
      console.error('Error al imprimir/guardar PDF:', e);
    }
  }

  /**
   * Dibuja la escala en el PDF usando html2canvas.
   * @param {jsPDF} pdf
   * @param {HTMLElement} scaleElem
   * @param {number} x
   * @param {number} y
   * @private
   */
  #drawScaleToPDF(pdf, scaleElem, x, y) {
    if (window.html2canvas) {
      window.html2canvas(scaleElem).then(canvas => {
        const img = canvas.toDataURL('image/png');
        pdf.addImage(img, 'PNG', x, y, 40, 10);
      });
    }
  }

  /**
   * Agrega la imagen de la leyenda al PDF si es posible.
   * @param {jsPDF} pdf
   * @param {string} legendImg
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @private
   */
  #addLegendImageToPDF(pdf, legendImg, x, y, w, h) {
    // Si la imagen es base64 o CORS compatible
    pdf.addImage(legendImg, 'PNG', x, y, w, h);
  }

  /**
   * Dibuja un símbolo de norte (triángulo hueco y N debajo) en la esquina superior derecha del mapa.
   * @param {jsPDF} pdf
   * @param {number} x
   * @param {number} y
   * @private
   */
  #drawNorthSymbol(pdf, x, y) {
    pdf.setLineWidth(3);
    pdf.setDrawColor(0);
    pdf.setFillColor(255, 255, 255); // Triángulo hueco
    pdf.triangle(x, y + 10, x + 5, y, x + 10, y + 10, 'D');
    pdf.setLineWidth(0.200025); // Restaurar a valor por defecto de jsPDF
    pdf.setFontSize(8);
    pdf.text('N', x + 3, y + 16);
  }

  /**
   * Obtiene los títulos y leyendas de las capas activas (excluyendo base).
   * @returns {Array<{titulo:string, legendImg:string}>}
   * @private
   */
  #getActiveLayersWithLegends() {
    try {
      if (typeof gestorMenu !== 'undefined' && gestorMenu.getActiveLayersWithoutBasemap) {
        return gestorMenu.getActiveLayersWithoutBasemap().map(l => ({
          titulo: l.titulo || l.name || l.nombre || 'Capa desconocida',
          legendImg: l.LegendsGraphics || null
        }));
      }
    } catch (e) { }
    return [{ titulo: 'No disponible', legendImg: null }];
  }

  /**
   * Limpia listeners y elimina el componente del DOM.
   */
  destroy() {
    this.handlers.forEach(({ el, type, fn }) => {
      if (el && el.removeEventListener) {
        el.removeEventListener(type, fn);
      }
    });
    this.handlers = [];
    if (this.elem && this.elem.parentNode) {
      this.elem.parentNode.removeChild(this.elem);
    }
    this.elem = null;
  }
}
