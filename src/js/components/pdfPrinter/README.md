# PdfPrinter Component

## Descripción

El componente `PdfPrinter` proporciona funcionalidad de impresión y guardado en PDF para mapas de Leaflet en la aplicación Argenmap. Incluye características avanzadas como símbolo de norte, escala, capas activas y manejo robusto de errores.

## Características

- ✅ **Captura optimizada de mapas** con timeout configurable
- ✅ **Símbolo de norte mejorado** con triángulo y letra N
- ✅ **Escala del mapa** incluida en el PDF (si html2canvas está disponible)
- ✅ **Lista de capas activas** en panel lateral
- ✅ **Manejo robusto de errores** con fallbacks
- ✅ **Accesibilidad completa** con soporte de teclado
- ✅ **Gestión de memoria** con cleanup automático
- ✅ **Configuración flexible** de timeouts y formato
- ✅ **Loading UI optimizado** con feedback visual

## Dependencias

### Requeridas
- **jsPDF**: Generación de documentos PDF
- **leaflet-image**: Captura de mapas Leaflet

### Opcionales
- **html2canvas**: Captura de elementos DOM (para incluir escala)

## Instalación y Uso

### Uso Básico

```javascript
// Crear e inicializar el componente
const pdfPrinter = new PdfPrinter();
pdfPrinter.createComponent();

// El botón aparecerá en los controles de Leaflet
// Los usuarios pueden hacer clic o usar Enter/Espacio para generar el PDF
```

### Configuración Avanzada

```javascript
// Crear con opciones personalizadas
const pdfPrinter = new PdfPrinter({
  timeout: 20000, // 20 segundos de timeout
  loadingText: 'Generando reporte del mapa...',
  pageFormat: { width: 297, height: 210 }, // A4 horizontal
  margin: 15 // Margen de 15mm
});

pdfPrinter.createComponent();
```

### Limpieza de Recursos

```javascript
// Importante: limpiar cuando el componente ya no es necesario
pdfPrinter.destroy();
```

## API Reference

### Constructor

```javascript
new PdfPrinter(options)
```

#### Parámetros

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `options` | Object | `{}` | Opciones de configuración |
| `options.timeout` | number | `15000` | Tiempo límite en ms para captura del mapa |
| `options.loadingText` | string | `'Generando PDF del mapa...'` | Texto del indicador de carga |
| `options.pageFormat` | Object | `{width: 297, height: 210}` | Formato de página en mm |
| `options.margin` | number | `10` | Margen de página en mm |

### Métodos Públicos

#### `createComponent()`
Crea y agrega el componente al mapa.

```javascript
pdfPrinter.createComponent();
```

#### `print()`
Genera e imprime/guarda el PDF. Retorna una Promise.

```javascript
await pdfPrinter.print();
```

#### `destroy()`
Limpia listeners y elimina el componente del DOM.

```javascript
pdfPrinter.destroy();
```

## Estados del Componente

El componente maneja los siguientes estados internos:

- `idle`: Estado inicial, listo para usar
- `loading`: Verificando dependencias y preparando
- `processing`: Generando el PDF
- `error`: Error en el proceso

## Manejo de Errores

### Errores Comunes

1. **Dependencias faltantes**
   ```
   Error: jsPDF y leaflet-image son necesarios para imprimir el mapa.
   ```
   **Solución**: Verificar que las bibliotecas estén cargadas antes de usar el componente.

2. **Mapa no encontrado**
   ```
   Error: No se encontró el mapa para imprimir.
   ```
   **Solución**: Asegurar que `window.mapa` o `window.map` exista y el elemento `#mapa` esté presente.

3. **Timeout de captura**
   ```
   Error: Tiempo de espera agotado (15000ms) al generar la imagen del mapa.
   ```
   **Solución**: Aumentar el timeout o verificar que las capas respondan correctamente.

### Fallbacks Automáticos

- Si `html2canvas` no está disponible, se omite la escala del PDF
- Si las imágenes de leyenda fallan, se muestra texto alternativo
- Si la división de texto falla, se usa un algoritmo de fallback
- Si el símbolo de norte falla, se dibuja un texto simple

## Optimizaciones de Rendimiento

### Gestión de Memoria
- Cleanup automático de elementos DOM temporales
- Remoción de event listeners en `destroy()`
- Limpieza de referencias de dependencias

### Optimización de Captura
- Ocultación temporal de controles para captura limpia
- Posicionamiento fijo de escala para mejor captura
- Timeout configurable para evitar cuelgues

### Carga Asíncrona
- Verificación no bloqueante de dependencias
- Loading UI con feedback visual
- Procesamiento asíncrono con manejo de errores

## Ejemplos de Integración

### Con Gestión de Estados

```javascript
class MapController {
  constructor() {
    this.pdfPrinter = new PdfPrinter({
      timeout: 25000,
      loadingText: 'Exportando mapa a PDF...'
    });
  }

  initialize() {
    this.pdfPrinter.createComponent();
  }

  async exportToPDF() {
    try {
      await this.pdfPrinter.print();
      console.log('PDF generado exitosamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      this.showErrorToUser(error.message);
    }
  }

  cleanup() {
    this.pdfPrinter.destroy();
  }
}
```

### Con Validación de Dependencias

```javascript
function initializePdfPrinter() {
  // Verificar dependencias antes de crear el componente
  const hasJsPDF = typeof window.jsPDF !== 'undefined' || 
                   (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF);
  const hasLeafletImage = typeof window.leafletImage !== 'undefined';

  if (!hasJsPDF || !hasLeafletImage) {
    console.warn('PdfPrinter: Dependencias faltantes, cargando dinámicamente...');
    loadDependencies().then(() => {
      const printer = new PdfPrinter();
      printer.createComponent();
    });
  } else {
    const printer = new PdfPrinter();
    printer.createComponent();
  }
}
```

## Solución de Problemas

### Debug Mode

Para habilitar logs detallados, abrir las herramientas de desarrollador y verificar la consola durante la generación del PDF.

### Verificación de Dependencias

```javascript
// Verificar en consola del navegador
console.log('jsPDF:', typeof window.jsPDF !== 'undefined');
console.log('leaflet-image:', typeof window.leafletImage !== 'undefined');
console.log('html2canvas:', typeof window.html2canvas !== 'undefined');
```

### Problemas de CORS

Si las capas de mapa tienen problemas de CORS, configurar el servidor para permitir las solicitudes o usar capas que soporten CORS.
