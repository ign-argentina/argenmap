# Funcionalidades

- Agregar capas desde servicios WMS y WMTS
- Agregar mapas base desde servicios TMS y XYZ (desde la configuración)
- Dibujar y descargar geometrías
- Modificar estilo de las geometrías dibujadas
- Consultar datos de las capas activas con click o usando una geometría como filtro
- Copiar coordenadas del cursor
- Agregar capas desde archivos KML,GeoJSON, GPX, SHP en formato (.zip), WKT en formato (.txt o .wkt), TopoJSON en formato (.json).
- Agregar capas desde URL
- Medir área y distancia
- Mostrar grilla
- Filtrar el panel de capas por medio de un cuadro de búsqueda
- Administrar en conjunto las capas de una sección desde su menú contextual
- Consultar la ubicación de usuario/a
- Vista de pantalla completa
- Incluir en la URL como parámetros la posición y zoom actuales del mapa y capas activas para compartir
- Captura de pantalla en formato PNG con escala.
- Panel de ayuda con guia rápida
- Panel de accesibilidad
- Descargar una captura el mapa en formato PDF junto con la escala, orientacion y leyendas
- Instalar el build de producción como PWA y recuperar sin conexión la interfaz
  y los recursos locales ya almacenados. Los mapas, capas y procesos remotos
  continúan necesitando conectividad.

## Opciones de una sección de capas

Cada encabezado de sección muestra un botón de opciones en su extremo derecho.
El botón abre un menú que permite:

- Activar todas las capas de la sección o desactivarlas si ya están activas.
- Fijar una sección al principio de su contenedor. Sólo se fija una sección a
  la vez; al elegir otra se restablece el orden configurado antes de moverla.
- Ajustar el mapa al encuadre conjunto de todas sus capas. El cálculo incluye
  todos los miembros de las capas agrupadas y las geometrías de archivo.
- Activar o desactivar la consulta de todas las capas consultables.
- Cambiar en vivo la opacidad de todas las capas con un control deslizante. El
  valor se conserva si una capa se desactiva y vuelve a activarse.

El botón de opciones no despliega ni contrae la sección. En las secciones OGC
con carga diferida, las acciones que necesitan conocer las capas esperan la
carga del servicio; no agregan solicitudes `GetCapabilities` al arranque.

## Diseño adaptable en dispositivos móviles

En pantallas de hasta 600 px el menú principal reserva un área táctil de 44 px
para cada botón y asigna el ancho restante al panel activo. El buscador de
capas se adapta a ese ancho sin desbordar el viewport y el desplazamiento queda
contenido dentro del panel.

Mientras un panel lateral está abierto, las herramientas Leaflet que podrían
quedar debajo se ocultan y deshabilitan temporalmente. Se restauran al cerrar
el panel, al tocar el mapa o al presionar `Escape`. En dispositivos táctiles se
mantienen áreas interactivas de al menos 44 px también en orientación
horizontal.

La lista de cambios está en [GitHub][]

[GitHub]: https://github.com/ign-argentina/argenmap/releases
