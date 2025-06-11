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
  async print() {
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

      // Timeout para la generación del mapa (por ejemplo, 15 segundos)
      let timeoutId;
      const leafletImagePromise = new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Tiempo de espera agotado al generar la imagen del mapa. Puede que alguna capa no esté respondiendo.'));
        }, 17000); // 17 segundos

        window.leafletImage(mapObj, (err, canvas) => {
          clearTimeout(timeoutId);
          if (err || !canvas) {
            reject(new Error('No se pudo capturar el mapa.'));
          } else {
            resolve(canvas);
          }
        });
      });

      let canvas;
      try {
        canvas = await leafletImagePromise;
      } catch (err) {
        overlays.forEach(el => { el.style.visibility = ''; });
        if (scaleClone) mapElem.removeChild(scaleClone);
        if (document.getElementById('pdf-loading')) document.body.removeChild(loadingDiv);
        alert(err.message);
        return;
      }

      overlays.forEach(el => { el.style.visibility = ''; });
      if (scaleClone) mapElem.removeChild(scaleClone);
      if (document.getElementById('pdf-loading')) document.body.removeChild(loadingDiv);

      // Calcular área del mapa (75% del ancho, 98% del alto, 1cm de margen izq/sup/inf)
      const pageW = 297, pageH = 210; // A4 horizontal en mm
      const margin = 10; // 1cm
      const mapAreaW = Math.floor(pageW * 0.75) - margin; // ~75% del ancho
      const mapAreaH = pageH - 2 * margin; // casi todo el alto
      const rightPanelX = margin + mapAreaW + 5;
      // Ajustar proporción del mapa
      const ratio = Math.min(mapAreaW / canvas.width, mapAreaH / canvas.height);
      const imgW = Math.round(canvas.width * ratio);
      const imgH = Math.round(canvas.height * ratio);
      const offsetX = margin + Math.floor((mapAreaW - imgW) / 2);
      const offsetY = margin + Math.floor((mapAreaH - imgH) / 2);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new PDFClass({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      // Título superior centrado
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(app.title || 'Mapa', margin, margin + 15);
      pdf.setFont('helvetica', 'normal');
      // Imagen del mapa
      pdf.addImage(imgData, 'PNG', offsetX, offsetY, imgW, imgH);
      // Símbolo de norte
      this.#drawNorthSymbol(pdf, offsetX + imgW - 15, offsetY + 10);
      // Escala
      if (scaleElem) {
        await this.#drawScaleToPDF(pdf, scaleElem, offsetX + 2, offsetY + imgH - 5);
      }
      // Panel derecho: título y capas activas
      const capas = this.#getActiveLayersWithLegends ? this.#getActiveLayersWithLegends() : [];
      pdf.setFontSize(12);
      pdf.text('Capas activas:', rightPanelX, margin + 15);
      pdf.setFontSize(10);
      let y = margin + 23; // Espacio inicial para las capas
      // Leyendas de las capas
      const maxWidth = pageW - rightPanelX - 5;
      capas.forEach(({ titulo }, idx) => {
        const lines = this.#splitTextToLines(pdf, titulo, maxWidth);
        lines.forEach(line => {
          pdf.text(line, rightPanelX, y);
          y += 6;
        });
      });
      // Atribución del mapa base (abajo a la derecha del mapa)
      let attributionText = '';
      if (mapObj && mapObj.attributionControl && mapObj.attributionControl._container) {
        // Extraer solo el texto de los enlaces y concatenar con " + "
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = mapObj.attributionControl._container.innerHTML;
        const texts = Array.from(tempDiv.querySelectorAll('a')).map(a => a.textContent.trim());
        attributionText = texts.join(' + ');
      }
      if (attributionText) {
        pdf.setFontSize(8);
        pdf.setTextColor(100);
        pdf.text(attributionText, offsetX + imgW - 2, offsetY + imgH + 7, { align: 'right' });
      }
      // Nombre de archivo con fecha y hora
      const now = new Date();
      const fecha = now.toLocaleDateString('es-AR').replace(/\//g, '-');
      const hora = now.toTimeString().slice(0, 5).replace(':', '-');
      pdf.save(`mapa_${fecha}_${hora}.pdf`);
    } catch (e) {
      if (document.getElementById('pdf-loading')) document.body.removeChild(document.getElementById('pdf-loading'));
      console.error('Error al imprimir/guardar PDF:', e);
      alert('Error al imprimir/guardar PDF: ' + e.message);
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
  async #drawScaleToPDF(pdf, scaleElem, x, y) {
    if (window.html2canvas) {
      const canvas = await window.html2canvas(scaleElem);
      const img = canvas.toDataURL('image/png');
      // Obtener el tamaño original del canvas en píxeles
      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;
      // Calcular el tamaño en mm (jsPDF usa 96 dpi por defecto)
      const pxPerMm = 96 / 14.35; // 1 mm = 96 px / 14.35 (1 cm = 10 mm)
      const imgWidthMm = imgWidthPx / pxPerMm;
      const imgHeightMm = imgHeightPx / pxPerMm;
      pdf.addImage(img, 'PNG', x, y, imgWidthMm, imgHeightMm);
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
    const lineWidth = Math.max(1, 2 * 0.2646);
    pdf.setLineWidth(lineWidth);
    pdf.setDrawColor(0);
    pdf.setFillColor(255, 255, 255); // Triángulo hueco
    pdf.triangle(x, y + 10, x + 5, y, x + 10, y + 10, 'D');
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

  /**
   * Divide un texto en líneas para que no se corte en el PDF.
   * @param {jsPDF} pdf
   * @param {string} text
   * @param {number} maxWidth
   * @returns {string[]}
   * @private
   */
  #splitTextToLines(pdf, text, maxWidth) {
    return pdf.splitTextToSize(text, maxWidth);
  }
}
