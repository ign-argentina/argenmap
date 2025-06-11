/**
 * Clase para el control de impresión/guardado en PDF del visor Leaflet.
 * Incorpora accesibilidad, manejo de errores, limpieza de recursos y agrega símbolo de norte y capas activas al PDF.
 * 
 * @example
 * // Crear e inicializar el componente
 * const pdfPrinter = new PdfPrinter();
 * pdfPrinter.createComponent();
 * 
 * // Limpiar recursos al terminar
 * pdfPrinter.destroy();
 * 
 * @requires jsPDF - Biblioteca para generación de PDF
 * @requires leaflet-image - Plugin para captura de mapas Leaflet
 * @requires html2canvas - Biblioteca para captura de elementos DOM (opcional, para escalas)
 */
class PdfPrinter {
  /**
   * Inicializa el componente de impresión PDF.
   * @param {Object} [options={}] - Opciones de configuración
   * @param {number} [options.timeout=15000] - Tiempo límite para generar imagen del mapa (ms)
   * @param {string} [options.loadingText='Generando PDF del mapa...'] - Texto del indicador de carga
   * @param {Object} [options.pageFormat={width: 297, height: 210}] - Formato de página en mm (A4 horizontal por defecto)
   * @param {number} [options.margin=10] - Margen de página en mm
   */
  constructor(options = {}) {
    /**
     * Configuración del componente
     * @type {Object}
     * @private
     */
    this.config = {
      timeout: options.timeout || 17000,
      loadingText: options.loadingText || 'Generando PDF del mapa...',
      pageFormat: options.pageFormat || { width: 297, height: 210 }, // A4 horizontal
      margin: options.margin || 10,
      ...options
    };

    /**
     * Estado actual del proceso de generación
     * @type {'idle'|'loading'|'processing'|'error'}
     * @private
     */
    this.state = 'idle';

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

    /**
     * Cache de dependencias externas verificadas
     * @type {Object}
     * @private
     */
    this.dependencies = {
      jsPDF: null,
      leafletImage: null,
      html2canvas: null,
      verified: false
    };
  }  /**
   * Crea y agrega el componente al mapa.
   */
  createComponent() {
    try {
      // Verificar si ya existe el componente
      if (this.elem) {
        console.warn('PdfPrinter: El componente ya existe, destruyendo el anterior');
        this.destroy();
      }

      const elem = document.createElement("div");
      elem.className = "leaflet-bar leaflet-control";
      elem.id = "pdfPrinter";
      elem.innerHTML = this.component;

      // Configurar accesibilidad y eventos
      const icon = elem.querySelector('.iconPDF-container');
      if (icon) {
        // Soporte de teclado para accesibilidad
        const keydownHandler = this.#onKeyDown.bind(this);
        icon.addEventListener('keydown', keydownHandler);
        this.handlers.push({ el: icon, type: 'keydown', fn: keydownHandler });

        // Event handler para click
        const clickHandler = this.print.bind(this);
        icon.onclick = clickHandler;
        this.handlers.push({ el: icon, type: 'click', fn: clickHandler });

        // Mejorar feedback visual durante la carga
        icon.setAttribute('data-state', this.state);
      }

      // Buscar contenedor del mapa con fallback
      const container = document.querySelector(".leaflet-top.leaflet-left") ||
        document.querySelector(".leaflet-control-container .leaflet-top.leaflet-left") ||
        document.querySelector("#mapa .leaflet-top.leaflet-left");

      if (!container) {
        throw new Error('No se encontró el contenedor de controles de Leaflet');
      }

      container.append(elem);
      this.elem = elem;

    } catch (e) {
      console.error('Error creando el componente PdfPrinter:', e);
      throw e;
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
  * @returns {Promise<void>} Promesa que se resuelve cuando el PDF se genera exitosamente
  */
  async print() {
    // Prevenir múltiples ejecuciones simultáneas
    if (this.state === 'loading' || this.state === 'processing') {
      console.warn('PdfPrinter: Ya hay una operación de impresión en curso');
      return;
    }

    let loadingDiv = null;
    let overlays = [];
    let scaleClone = null;

    try {
      this.state = 'loading';

      // Verificar dependencias críticas
      const PDFClass = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
      if (typeof PDFClass === 'undefined' || typeof window.leafletImage === 'undefined') {
        throw new Error('jsPDF y leaflet-image son necesarios para imprimir el mapa.');
      }

      const mapObj = window.mapa || window.map;
      const mapElem = document.getElementById('mapa');
      if (!mapObj || !mapElem) {
        throw new Error('No se encontró el mapa para imprimir.');
      }

      // Crear indicador de carga
      loadingDiv = document.createElement('div');
      loadingDiv.id = 'pdf-loading';
      loadingDiv.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(255,255,255,0.9); z-index: 99999;
        display: flex; align-items: center; justify-content: center;
      `;
      loadingDiv.innerHTML = `
        <div style="background:#fff;padding:2em 3em;border-radius:10px;box-shadow:0 0 20px rgba(0,0,0,0.3);
                   font-size:1.5em;font-weight:bold;text-align:center;">
          <div style="margin-bottom:1em;">📄 ${this.config.loadingText}</div>
          <div style="font-size:0.8em;color:#666;">Esto puede tomar unos momentos...</div>
        </div>
      `;
      document.body.appendChild(loadingDiv);

      this.state = 'processing';

      // Preparar mapa para captura (ocultar controles excepto escala)
      overlays = Array.from(mapElem.querySelectorAll('.leaflet-control, .leaflet-top, .leaflet-right, .leaflet-left, .leaflet-bottom'));
      overlays.forEach(el => {
        if (!el.classList.contains('leaflet-control-scale')) {
          el.style.visibility = 'hidden';
        }
      });

      // Clonar escala para posicionamiento fijo
      const scaleElem = mapElem.querySelector('.leaflet-control-scale');
      if (scaleElem) {
        scaleClone = scaleElem.cloneNode(true);
        scaleClone.style.cssText = 'position:absolute;left:20px;bottom:20px;z-index:10000;';
        mapElem.appendChild(scaleClone);
      }

      // Capturar mapa con timeout configurable
      const canvas = await this.#captureMapWithTimeout(mapObj, this.config.timeout);

      // Generar PDF
      const pdf = await this.#createPDFDocument(canvas, mapObj, scaleElem);

      // Guardar con nombre optimizado
      const filename = this.#generateFilename();
      pdf.save(filename);

      this.state = 'idle';

    } catch (error) {
      this.state = 'error';
      console.error('Error al imprimir/guardar PDF:', error);
      alert('Error al imprimir/guardar PDF: ' + error.message);
      throw error;

    } finally {
      // Cleanup garantizado
      if (loadingDiv && document.body.contains(loadingDiv)) {
        document.body.removeChild(loadingDiv);
      }
      if (overlays.length > 0) {
        overlays.forEach(el => { el.style.visibility = ''; });
      }
      if (scaleClone && scaleClone.parentNode) {
        scaleClone.parentNode.removeChild(scaleClone);
      }
    }
  }

  /**
   * Agrega la imagen de la leyenda al PDF manteniendo su proporción original.
   * @param {jsPDF} pdf
   * @param {string} legendImg - URL de la imagen de leyenda
   * @param {number} x - Posición X
   * @param {number} y - Posición Y  
   * @param {number} maxWidth - Ancho máximo permitido (en px)
   * @param {number} maxHeight - Alto máximo permitido (en px)
   * @returns {Promise<number>} Alto real de la imagen agregada (en mm)
   * @private
   */
  async #addLegendImageToPDF(pdf, legendImg, x, y) {
    return new Promise((resolve) => {
      try {
        const img = new window.Image();
        img.onload = () => {
          try {
            // Usar el tamaño original de la imagen (en px)
            // Conversión px a mm (96 dpi)
            const pxToMm = 25.4 / 96;
            const widthMm = img.width * pxToMm;
            const heightMm = img.height * pxToMm;
            pdf.addImage(img, 'PNG', x, y, widthMm, heightMm);
            resolve(heightMm);
          } catch (error) {
            console.warn('Error procesando imagen de leyenda:', error);
            resolve(0);
          }
        };
        img.onerror = () => {
          console.warn('No se pudo cargar la imagen de leyenda:', legendImg);
          pdf.setFontSize(7);
          pdf.setTextColor(150, 150, 150);
          pdf.text('(Leyenda no disponible)', x, y + 3);
          resolve(5);
        };
        img.crossOrigin = 'anonymous';
        img.src = legendImg;
      } catch (error) {
        console.warn('Error cargando imagen de leyenda:', error);
        resolve(0);
      }
    });
  }

  /**
   * Dibuja un símbolo de norte mejorado (triángulo y N) en el PDF.
   * @param {jsPDF} pdf - Documento PDF
   * @param {number} x - Posición X
   * @param {number} y - Posición Y
   * @private
   */
  #drawNorthSymbol(pdf, x, y) {
    try {
      // Configurar estilo del símbolo
      const lineWidth = 0.5;
      const triangleSize = 8;

      pdf.setLineWidth(lineWidth);
      pdf.setDrawColor(0, 0, 0); // Negro
      pdf.setFillColor(255, 255, 255);

      // Dibujar triángulo apuntando al norte
      const topX = x + triangleSize / 2;
      const topY = y;
      const leftX = x;
      const leftY = y + triangleSize;
      const rightX = x + triangleSize;
      const rightY = y + triangleSize;

      // Triángulo con borde y relleno
      pdf.triangle(leftX, leftY, topX, topY, rightX, rightY, 'D');

      // Letra N debajo del triángulo
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      const textX = x + (triangleSize / 2) - 1; // Centrar la N
      const textY = y + triangleSize + 4; // Espacio debajo del triángulo
      pdf.text('N', textX, textY);

    } catch (error) {
      console.warn('Error dibujando símbolo de norte:', error);
      // Fallback simple: solo texto
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('N↑', x, y + 10);
    }
  }
  /**
   * Obtiene los títulos y leyendas de las capas activas (excluyendo base).
   * @returns {Array<{titulo:string, legendImg:string}>}
   * @private
   */
  #getActiveLayersWithLegends() {
    try {
      if (typeof gestorMenu !== 'undefined' && gestorMenu.getActiveLayersWithoutBasemap) {
        console.log(gestorMenu.getActiveLayersWithoutBasemap());
        return gestorMenu.getActiveLayersWithoutBasemap().map(l => ({
          titulo: l.titulo || l.name || l.nombre || 'Capa desconocida',
          host: l.host || null
        }));
      }
    } catch (e) {
      console.warn('Error obteniendo capas activas:', e);
    }
    return [{ titulo: 'No disponible', legendImg: null }];
  }

  /**
   * Captura el mapa con timeout configurable
   * @param {Object} mapObj - Objeto del mapa de Leaflet
   * @param {number} timeout - Timeout en milisegundos
   * @returns {Promise<HTMLCanvasElement>}
   * @private
   */
  #captureMapWithTimeout(mapObj, timeout) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Tiempo de espera agotado (${timeout}ms) al generar la imagen del mapa. Puede que alguna capa no esté respondiendo.`));
      }, timeout);

      window.leafletImage(mapObj, (err, canvas) => {
        clearTimeout(timeoutId);
        if (err || !canvas) {
          reject(new Error('No se pudo capturar el mapa: ' + (err?.message || 'Canvas no generado')));
        } else {
          resolve(canvas);
        }
      });
    });
  }

  /**
   * Crea el documento PDF con todos los elementos
   * @param {HTMLCanvasElement} canvas - Canvas con la imagen del mapa
   * @param {Object} mapObj - Objeto del mapa de Leaflet
   * @param {HTMLElement} scaleElem - Elemento de escala
   * @returns {Promise<jsPDF>} Documento PDF generado
   * @private
   */
  async #createPDFDocument(canvas, mapObj, scaleElem) {
    const PDFClass = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
    const { width: pageW, height: pageH } = this.config.pageFormat;
    const margin = this.config.margin;

    // Calcular área del mapa (75% del ancho, margen configurable)
    const mapAreaW = Math.floor(pageW * 0.75) - margin;
    const mapAreaH = pageH - 2 * margin;
    const rightPanelX = margin + mapAreaW + 5;

    // Ajustar proporción del mapa
    const ratio = Math.min(mapAreaW / canvas.width, mapAreaH / canvas.height);
    const imgW = Math.round(canvas.width * ratio);
    const imgH = Math.round(canvas.height * ratio);
    const offsetX = margin + Math.floor((mapAreaW - imgW) / 2);
    const offsetY = margin + Math.floor((mapAreaH - imgH) / 2);

    // Crear PDF
    const pdf = new PDFClass({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Título superior
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    const title = (typeof app !== 'undefined' && app.title) ? app.title : 'Mapa';
    pdf.text(title, margin, margin + 15);
    pdf.setFont('helvetica', 'normal');

    // Imagen del mapa
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', offsetX, offsetY, imgW, imgH);

    // Símbolo de norte
    this.#drawNorthSymbol(pdf, offsetX + imgW - 15, offsetY + 10);

    // Escala como texto robusto
    this.#addScaleTextToPDF(pdf, mapObj, offsetX + 2, offsetY + imgH - 5);

    const capas = this.#getActiveLayersWithLegends();
    pdf.setFontSize(12);
    pdf.text('Capas activas:', rightPanelX, margin + 15);
    pdf.setFontSize(10);

    let y = margin + 23;
    const maxWidth = pageW - rightPanelX - 5;

    // Procesar capas de forma asíncrona para manejar las imágenes
    for (const { titulo, host } of capas) {
      if (y >= pageH - margin - 20) break;
      const lines = this.#splitTextToLines(pdf, titulo, maxWidth);
      for (const line of lines) {
        if (y < pageH - margin - 15) {
          pdf.text(line, rightPanelX, y);
          y += 4;
        }
      }
      if (host && y < pageH - margin - 20) {
        try {
          const legendImg = `${host}/wms?service=WMS&request=GetLegendGraphic&format=image%2Fpng&version=1.1.1&layer=${titulo}&transparent=true&scale=1&LEGEND_OPTIONS=fontAntiAliasing:true;dpi:111;fontName:verdana;hideEmptyRules:false;labelMargin:5;forceTitles:on;forceLabels:on;`;
          const imageHeight = await this.#addLegendImageToPDF(
            pdf,
            legendImg,
            rightPanelX + 2,
            y
          );
          y += Math.max(imageHeight + 6, 8);
        } catch (error) {
          console.warn('Error agregando leyenda para capa:', titulo, error);
          y += 3;
        }
      } else {
        y += 3;
      }
    }

    // Atribución del mapa base
    this.#addAttribution(pdf, mapObj, offsetX, offsetY, imgW, imgH);

    return pdf;
  }

  /**
   * Agrega la atribución del mapa base al PDF
   * @param {jsPDF} pdf - Documento PDF
   * @param {Object} mapObj - Objeto del mapa
   * @param {number} offsetX - Posición X del mapa
   * @param {number} offsetY - Posición Y del mapa
   * @param {number} imgW - Ancho de la imagen
   * @param {number} imgH - Alto de la imagen
   * @private
   */
  #addAttribution(pdf, mapObj, offsetX, offsetY, imgW, imgH) {
    try {
      let attributionText = '';
      if (mapObj && mapObj.attributionControl && mapObj.attributionControl._container) {
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
    } catch (e) {
      console.warn('Error agregando atribución:', e);
    }
  }

  /**
   * Genera un nombre de archivo único con fecha y hora
   * @returns {string} Nombre del archivo
   * @private
   */
  #generateFilename() {
    const now = new Date();
    const fecha = now.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
    const hora = now.toTimeString().slice(0, 5).replace(':', '-');

    const appName = (typeof app !== 'undefined' && app.title) ?
      app.title.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'mapa';

    return `${appName}_${fecha}_${hora}.pdf`;
  }
  /**
   * Limpia listeners y elimina el componente del DOM.
   * Garantiza la liberación completa de recursos para evitar memory leaks.
   * 
   * @example
   * // Limpiar cuando el componente ya no es necesario
   * pdfPrinter.destroy();
   */
  destroy() {
    try {
      // Cancelar cualquier operación en curso
      if (this.state === 'loading' || this.state === 'processing') {
        console.warn('PdfPrinter: Cancelando operación en curso durante destroy()');
        this.state = 'idle';
      }

      // Remover todos los event listeners
      this.handlers.forEach(({ el, type, fn }) => {
        try {
          if (el && el.removeEventListener && typeof fn === 'function') {
            el.removeEventListener(type, fn);
          }
        } catch (e) {
          console.warn('Error removiendo event listener:', e);
        }
      });
      this.handlers = [];

      // Remover elemento del DOM
      if (this.elem && this.elem.parentNode) {
        this.elem.parentNode.removeChild(this.elem);
      }
      this.elem = null;

      // Limpiar referencias de dependencias
      this.dependencies = {
        jsPDF: null,
        leafletImage: null,
        html2canvas: null,
        verified: false
      };

      // Limpiar cualquier loading div que pueda haber quedado
      const loadingDiv = document.getElementById('pdf-loading');
      if (loadingDiv) {
        document.body.removeChild(loadingDiv);
      }

      console.log('PdfPrinter: Componente destruido correctamente');

    } catch (e) {
      console.error('Error durante destroy de PdfPrinter:', e);
    }
  }
  /**
   * Divide un texto en líneas que caben en el ancho especificado del PDF.
   * Incluye fallback manual en caso de que jsPDF no esté disponible.
   * @param {jsPDF} pdf - Documento PDF
   * @param {string} text - Texto a dividir
   * @param {number} maxWidth - Ancho máximo en mm
   * @returns {string[]} Array de líneas de texto
   * @private
   */
  #splitTextToLines(pdf, text, maxWidth) {
    try {
      if (!text || typeof text !== 'string') {
        return [''];
      }

      if (pdf && typeof pdf.splitTextToSize === 'function') {
        return pdf.splitTextToSize(text, maxWidth);
      }

      // Fallback: dividir manualmente por longitud estimada
      const estimatedCharsPerLine = Math.floor(maxWidth * 3); // Aproximación
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';

      words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length <= estimatedCharsPerLine) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      });

      if (currentLine) lines.push(currentLine);
      return lines.length > 0 ? lines : [text];

    } catch (error) {
      console.warn('Error dividiendo texto para PDF:', error);
      return [text || ''];
    }
  }

  /**
   * Calcula y dibuja la escala numérica y gráfica del mapa en el PDF.
   * @param {jsPDF} pdf
   * @param {Object} mapObj
   * @param {number} x - Posición X en el PDF
   * @param {number} y - Posición Y en el PDF
   * @private
   */
  #addScaleTextToPDF(pdf, mapObj, x, y) {
    try {
      let scaleInfo = null;

      if (mapObj && typeof mapObj.getZoom === 'function' && typeof mapObj.getCenter === 'function') {
        const zoom = mapObj.getZoom();
        const center = mapObj.getCenter();

        // Calcular resolución (metros por pixel) para Web Mercator
        const resolution = 156543.03392804097 * Math.cos(center.lat * Math.PI / 180) / Math.pow(2, zoom);

        // Calcular información para escala gráfica
        scaleInfo = this.#calculateGraphicScale(resolution);
      }

      // Dibujar solo la escala gráfica si es posible
      if (scaleInfo) {
        this.#drawGraphicScale(pdf, x, y - 4, scaleInfo);
      }

    } catch (e) {
      console.warn('Error agregando escala gráfica al PDF:', e);
      // No dibujar nada si falla
    }
  }

  /**
   * Calcula los valores óptimos para dibujar una escala gráfica
   * @param {number} resolution - Resolución en metros por píxel
   * @returns {Object} Información de la escala gráfica
   * @private
   */
  #calculateGraphicScale(resolution) {
    // Definir distancias estándar para escalas gráficas
    const standardDistances = [
      1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000,
      2000, 2500, 5000, 10000, 20000, 25000, 50000, 100000
    ];

    // Calcular el ancho máximo deseado para la barra (en mm)
    const maxBarWidthMm = 40;

    const pixelSizeMm = 0.16; // 1 pixel = 0.16 mm (ajustar según la resolución del PDF)
    const pixelsPerMm = 1 / pixelSizeMm;

    // Encontrar la distancia estándar más apropiada
    let bestDistance = standardDistances[0];
    for (const distance of standardDistances) {
      if (distance <= maxBarWidthMm * resolution * pixelsPerMm) {
        bestDistance = distance;
      } else {
        break;
      }
    }

    // Calcular el ancho de la barra en mm para el PDF
    const barWidthPx = bestDistance / resolution;
    const barWidthMm = barWidthPx * pixelSizeMm;

    // Limitar el ancho máximo
    const finalBarWidthMm = Math.min(barWidthMm, maxBarWidthMm);

    let unit, displayDistance;
    if (bestDistance >= 1000) {
      unit = 'km';
      displayDistance = bestDistance / 1000;
    } else {
      unit = 'm';
      displayDistance = bestDistance;
    }

    return {
      distance: bestDistance,
      displayDistance,
      unit,
      barWidthMm: finalBarWidthMm,
      text: `${displayDistance} ${unit}`
    };
  }
  /**
   * Dibuja una escala gráfica (barra) en el PDF
   * @param {jsPDF} pdf
   * @param {number} x - Posición X
   * @param {number} y - Posición Y
   * @param {Object} scaleInfo - Información de la escala
   * @private
   */
  #drawGraphicScale(pdf, x, y, scaleInfo) {
    try {
      const barHeight = 3; // Altura de la barra en mm
      const textOffset = 2; // Espacio entre barra y texto

      // Configurar estilo
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(0, 0, 0);
      pdf.setFillColor(255, 255, 255);

      // Dibujar barra principal (fondo blanco con borde negro)
      pdf.rect(x, y, scaleInfo.barWidthMm, barHeight, 'FD');

      // Dibujar segmentos alternados (patrón de escala tradicional)
      const numSegments = 4;
      const segmentWidth = scaleInfo.barWidthMm / numSegments;

      pdf.setFillColor(0, 0, 0); // Negro para segmentos alternados
      for (let i = 0; i < numSegments; i += 2) {
        pdf.rect(x + (i * segmentWidth), y, segmentWidth, barHeight, 'F');
      }

      // Dibujar texto de la escala
      pdf.setFontSize(8);
      pdf.setTextColor(60, 60, 60);

      // Texto "0" al inicio
      pdf.text('0', x - 2, y + barHeight + textOffset + 2);

      // Texto con la distancia al final
      pdf.text(scaleInfo.text, x + scaleInfo.barWidthMm + 2, y + barHeight + textOffset + 2);

      // Opcional: marcas intermedias
      if (numSegments >= 2) {
        const halfDistance = scaleInfo.displayDistance / 2;
        const halfText = `${halfDistance}${halfDistance < 1 && scaleInfo.unit === 'km' ? '00 m' : ''}`;
        const halfX = x + (scaleInfo.barWidthMm / 2);

        // Línea vertical en el medio
        pdf.setLineWidth(0.3);
        pdf.line(halfX, y, halfX, y + barHeight);

        // Texto en el medio (opcional, solo si hay espacio)
        if (scaleInfo.barWidthMm > 25) {
          pdf.text(halfText, halfX - 2, y - 1);
        }
      }

    } catch (error) {
      console.warn('Error dibujando escala gráfica:', error);
    }
  }
}
