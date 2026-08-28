# Mediciones reproducibles de performance

El repositorio incluye una herramienta para comparar el arranque de Argenmap
con caché fría y caliente usando la misma sesión de Chromium. Mide:

* `DOMContentLoaded` desde el inicio de la navegación;
* el evento `argenmap:map-ready` emitido cuando el mapa está listo;
* bytes codificados transferidos por las solicitudes iniciadas hasta ese evento;
* cantidad, duración total y duración máxima de tareas largas mediante la Long
  Tasks API.

## Medir el build local

Se requiere Node.js 20 o posterior y Chrome/Chromium instalado. Primero genera
el build y luego ejecuta tres pares de mediciones:

```bash
npm run build
npm run measure:performance -- --output performance-report.json
```

La herramienta levanta temporalmente `build/` en un puerto local. Ese servidor
reproduce los encabezados de caché documentados y entrega las variantes Brotli o
gzip generadas por el build, por lo que los bytes reflejan la transferencia
comprimida. No debe usarse como servidor de producción.

Cada corrida realiza estos pasos:

1. navega fuera del sitio y elimina caché HTTP, service workers, Cache Storage y
   demás datos del origen;
2. mide una carga con caché fría;
3. mantiene la página abierta durante el período de preparación para que se
   complete el registro diferido del service worker y la caché secundaria;
4. vuelve a navegar sin eliminar datos y mide la carga con caché caliente.

El resumen utiliza la mediana de las corridas. El JSON conserva cada muestra,
las opciones utilizadas y las versiones de Node, Chrome y el protocolo de
diagnóstico para poder comparar resultados.

## Medir una publicación

Puede medirse una URL de prueba o producción sin levantar el servidor local:

```bash
npm run measure:performance -- \
  --url https://ejemplo/argenmap/index.html \
  --runs 5 \
  --output performance-production.json
```

Opciones principales:

| Opción | Valor predeterminado | Uso |
| --- | ---: | --- |
| `--runs` | `3` | Cantidad de pares fría/caliente. |
| `--timeout` | `60000` | Milisegundos máximos para esperar el mapa. |
| `--warmup` | `8000` | Espera entre la medición fría y la caliente. |
| `--settle` | `1500` | Espera para completar solicitudes iniciadas antes de mapa listo. |
| `--chrome` | detección automática | Ruta a Chrome o Chromium. También puede usarse `CHROME_BIN`. |
| `--output` | ninguno | Archivo JSON donde guardar el informe completo. |

`--no-sandbox` está destinado únicamente a contenedores o CI confiables donde
Chromium no pueda iniciar su sandbox. No debe combinarse con una URL que no sea
de confianza. `--ignore-certificate-errors` existe sólo para ambientes de prueba
con certificados interceptados.

## Comparar resultados

Para que la comparación sea útil, conserva la misma máquina, versión de Chrome,
resolución, configuración de Argenmap y condiciones de red. Las capas base,
teselas y CDN externos pueden introducir variación; por eso deben compararse las
medianas de varias corridas y no una única muestra.

Los bytes se obtienen mediante Chrome DevTools Protocol y corresponden a las
solicitudes iniciadas no después de `map-ready`. La espera `--settle` permite que
esas solicitudes terminen, pero no incorpora solicitudes nuevas iniciadas luego
del evento. Las tareas largas también se filtran por su instante de inicio para
que el límite sea el mismo.
