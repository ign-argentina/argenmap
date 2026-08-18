# Pruebas PWA en dispositivos reales

Esta matriz valida la instalación, el uso sin conexión y la actualización de
Argenmap en hardware real. Las pruebas deben realizarse sobre el build de
producción publicado mediante HTTPS; servir el código fuente no registra el
service worker.

## Preparación

1. Ejecutar `npm ci` y `npm run build`.
2. Publicar todo el contenido de `build/` en una URL HTTPS de prueba.
3. Aplicar los encabezados de caché indicados en [deployment.md](deployment.md).
4. Desinstalar una instalación previa de Argenmap y borrar los datos del sitio.
5. Preparar dos builds, A y B. El build B debe contener un cambio visible y debe
   publicarse completo sobre A para verificar el proceso de actualización.

## Android

Probar como mínimo Chrome y Firefox; si el dispositivo lo incluye, agregar
Samsung Internet.

1. Abrir el build A desde el navegador y esperar a que termine de cargar.
2. Verificar que aparece **Instalar Argenmap** en la barra lateral.
3. En Chrome/Samsung Internet, pulsarlo y confirmar que abre el diálogo nativo.
   En Firefox u otro navegador sin esa API, confirmar que muestra la ruta de
   instalación desde el menú.
4. Instalar, abrir desde el icono y comprobar que se ejecuta sin barra del
   navegador, con el icono y nombre correctos.
5. Navegar una vez online, cerrar y volver a abrir en modo avión. Confirmar que
   la interfaz y configuración cargan y que las funciones remotas informan su
   falta de conexión sin bloquear la aplicación.
6. Volver a conectarse, mantener la aplicación abierta y publicar el build B.
7. Volver a la aplicación o recargar. Confirmar que aparece el aviso de nueva
   versión, que B no se aplica antes de pulsar **Actualizar** y que se aplica
   después del botón y la recarga automática.
8. Confirmar que **Instalar Argenmap** no aparece dentro de la aplicación ya
   instalada.

Registrar modelo, versión de Android, navegador, versión y resultado de cada
paso. Repetir en orientación vertical y horizontal.

## iPhone y iPad

Probar con Safari en la versión mínima de iOS/iPadOS soportada y en la versión
estable más reciente.

1. Abrir el build A y pulsar **Instalar Argenmap**.
2. Confirmar que muestra la indicación **Compartir → Agregar a pantalla de
   inicio**; iOS no ofrece `beforeinstallprompt`.
3. Completar la instalación desde Compartir, abrir desde el icono y comprobar
   nombre, icono, modo standalone y ambas orientaciones.
4. Repetir la prueba online/modo avión descrita para Android.
5. Publicar el build B, volver a abrir con conexión y confirmar el aviso de
   actualización y su activación únicamente después de **Actualizar**.
6. Verificar que el botón de instalación no aparece en modo standalone.

Registrar modelo, versión del sistema y resultados. En iOS también conviene
cerrar completamente la aplicación instalada y abrirla nuevamente después de
cada actualización, porque el ciclo de vida del proceso WebKit difiere del de
una pestaña normal.

## Criterio de aprobación

La versión queda aprobada cuando todos los pasos anteriores pasan en al menos
un Android y un iPhone o iPad reales. Una emulación de viewport o una prueba
headless complementa esta matriz, pero no reemplaza la instalación física.
