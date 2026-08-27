# Guía rápida de instalación

### Requisitos previos

- Servidor web (Nginx, Apache, lighttpd, etc.)
- Acceso a la terminal o consola de comandos
- Git (opcional pero recomendado)
- Editor de código (VS Code, Sublime Text, etc.)

---

## 1. Obtener el código fuente

### Opción 1: Clonar con Git

```bash
git clone https://github.com/ign-argentina/argenmap.git
cd argenmap
```

### Opción 2: Descargar ZIP

1. Accede a: [https://github.com/ign-argentina/argenmap](https://github.com/ign-argentina/argenmap)
2. Haz clic en **Code > Download ZIP**
3. Extrae el archivo en la carpeta deseada

Enlace directo:

```
https://github.com/ign-argentina/argenmap/archive/master.zip
```

---

## 2. Configurar la aplicación

Copia los archivos de configuración que están en el directorio `src/config/default` al directorio `src/config` y editar los nuevos archivos según se desee.

### Paso 1: Copiar archivos por defecto de la configuración

```bash
# En Linux/macOS
cp -r src/config/default/* src/config/
```

### Paso 2: Editar configuración

* [`src/config/data.json`](../config/data.json): Define mapas base, capas y agrupaciones.
* [`src/config/preferences.json`](../config/preferences.json): Configura la apariencia y opciones iniciales.

**Ejemplo básico (`preferences.json`):**

```json
{
  "mapConfig": {
    "center": {
      "latitude": -40,
      "longitude": -59
    },
    "zoom": {
      "initial": 4,
      "min": 3,
      "max": 21
    }
  }
}
```

📘 Consulta más detalles en la guía de **[Configuración](configuration.md)**.

---

## 3. Publicar el visor en un servidor web

### Build de producción (recomendado)

Para generar una versión optimizada se requiere Node.js 20 o posterior. Desde la
raíz del proyecto ejecuta:

```bash
npm ci
npm run build
```

Para resolver automáticamente la versión según la rama, se puede usar:

```bash
npm run build:versioned
```

En `develop` y en las demás ramas que no sean de publicación genera una
versión `develop-<commit>`. En `master`, `hotfix` y `release`, busca primero un
tag semántico (`vMAJOR.MINOR.PATCH`) en el commit actual. Si no existe, solicita
`major`, `minor` o `patch`, calcula el siguiente tag usando
`git tag -l --sort=-v:refname`, lo crea y compila con esa versión. El tag creado
debe publicarse explícitamente, por ejemplo `git push origin v1.27.1`.

El comando básico `npm run build` continúa disponible para casos en los que se
quiera indicar manualmente `ARGENMAP_VERSION`.

La versión se puede indicar explícitamente mediante `ARGENMAP_VERSION`. Para
una publicación asociada a un tag de `master`, por ejemplo:

```bash
ARGENMAP_VERSION=v1.2.3 npm run build
```

Para una build de desarrollo conviene incluir la rama y el commit:

```bash
ARGENMAP_VERSION=develop-$(git rev-parse --short HEAD) npm run build
```

En CI también se aceptan automáticamente los tags de `CI_COMMIT_TAG` y las
ramas de GitHub/GitLab combinadas con su commit corto, por ejemplo
`develop-a1b2c3d4e5f6`. Si no se proporciona ninguna, se genera una versión a
partir del contenido publicado.

### Resultado según la rama

| Rama | Comando | Versión resultante | ¿Crea tag? |
| --- | --- | --- | --- |
| `master` | `npm run build:versioned` | `vMAJOR.MINOR.PATCH` | Sí, si el `HEAD` no tiene tag semántico |
| `hotfix/*` | `npm run build:versioned` | Siguiente `vMAJOR.MINOR.PATCH` | Sí, si el `HEAD` no tiene tag semántico |
| `release/*` | `npm run build:versioned` | Siguiente `vMAJOR.MINOR.PATCH` | Sí, si el `HEAD` no tiene tag semántico |
| `develop` | `npm run build:versioned` | `develop-<commit>` | No |
| Rama derivada de `develop` | `npm run build:versioned` | `develop-<commit>` | No |
| Cualquier rama | `npm run build` | Versión explícita, CI o `content-<hash>` | No |

En las ramas de publicación, si el commit actual no tiene tag, el comando
solicita `major`, `minor` o `patch`, crea el tag local y continúa con el build.
Publica ese tag después de verificar el resultado:

```bash
git push origin v1.27.4
```

Para desplegar el resultado:

1. Ejecuta el comando elegido desde la raíz del repositorio.
2. Revisa `build/build-manifest.json` y confirma la versión en
  `build/index.html`.
3. Publica **todo el contenido de `build/`** como raíz del sitio, reemplazando
  la publicación anterior en una única operación.
4. Verifica que `index.html`, `service-worker.js`, `manifest.webmanifest` y la
  configuración no tengan caché HTTP persistente.
5. Abre el sitio con conexión y acepta el aviso **Actualizar** cuando aparezca
  una nueva versión.

No publiques solo el bundle o solo el service worker: deben pertenecer al mismo
build para evitar mezclar código, estilos y plugins de distintas versiones.

El comando crea la carpeta `build/`, lista para publicar. Esta versión:

* combina y minifica el JavaScript y CSS necesarios para el arranque;
* mantiene separados los plugins que se cargan únicamente al utilizarlos;
* agrega un hash al nombre de los recursos críticos y una versión a todos los
  recursos locales diferidos para poder cachearlos de forma segura;
* copia la configuración de `src/config`; si no hay una configuración local,
  utiliza los archivos de `src/config/default`.
* genera el manifiesto y el service worker necesarios para instalar Argenmap
  como aplicación web progresiva (PWA).

Publica **el contenido de `build/`** como raíz del visor. La carpeta se regenera
por completo cada vez que se ejecuta el comando, por lo que no debe editarse
manualmente.

### Publicar como PWA

La PWA se habilita únicamente en el build de producción. El código fuente
servido en modo de desarrollo incluye el manifiesto, pero no registra un
service worker para evitar que la caché interfiera con la depuración.

Para que el navegador permita instalarla, publica `build/` mediante HTTPS. La
excepción es `localhost`, que puede usarse para pruebas locales. Todos los
archivos del build, incluidos `manifest.webmanifest` y `service-worker.js`,
deben quedar bajo la misma raíz pública.

La estrategia de caché distingue cada tipo de recurso:

* El shell crítico (`index.html`, bundles, configuración e imagen de respaldo)
  se almacena al instalar el service worker. Los recursos auxiliares de la PWA
  se agregan en una segunda etapa ociosa para no competir con el arranque.
  Ambos grupos pertenecen a la misma caché versionada y no mezclan archivos de
  publicaciones distintas.
* `data.json` y `preferences.json` intentan obtener siempre la versión de red y
  recurren a la copia local si no hay conexión.
* Los plugins y recursos estáticos locales se actualizan en segundo plano
  después de haber sido utilizados.
* Sólo se almacenan recursos estáticos de los CDN expresamente permitidos.
* Las teselas remotas, `GetCapabilities`, `GetFeatureInfo`, autenticación y
  geoprocesos no se guardan. Esas funciones siguen necesitando conexión y se
  evita ocupar la cuota del dispositivo o conservar datos sensibles/obsoletos.

En la primera visita se instala el service worker. Una recarga o visita posterior
online permite almacenar también los módulos diferidos que se hayan utilizado.
Sin conexión se recuperan la interfaz, configuración y recursos ya disponibles;
las capas y mapas remotos no se convierten automáticamente en mapas offline.

Cuando se publica una versión nueva, Argenmap muestra un aviso. La nueva versión
queda en espera hasta que la persona elige **Actualizar**, evitando reemplazar
archivos mientras está usando el mapa.

Cuando el navegador ofrece una solicitud de instalación, aparece el botón
**Instalar Argenmap** al final de la barra lateral. En navegadores Chromium abre
el diálogo nativo. En iPhone/iPad y navegadores móviles que no exponen ese
diálogo, el botón explica cómo instalar desde **Compartir** o desde el menú del
navegador. El control se oculta al ejecutar la aplicación ya instalada.

La validación en teléfonos y tabletas se describe en la guía de
[pruebas PWA en dispositivos reales](pwa-testing.md).

### Encabezados HTTP e invalidación de caché

Cada ejecución de `npm run build` calcula la versión PWA a partir de todo el
contenido publicado. Para que el navegador detecte el service worker nuevo y no
mezcle versiones, despliega el contenido completo de `build/` en una sola
operación y configura encabezados equivalentes a estos:

```text
/service-worker.js                 Cache-Control: no-cache
/index.html                        Cache-Control: no-cache
/manifest.webmanifest              Cache-Control: no-cache
/src/config/*.json                 Cache-Control: no-cache
/assets/js/*.[hash].min.js         Cache-Control: public, max-age=31536000, immutable
/src/styles/css/*.[hash].min.css   Cache-Control: public, max-age=31536000, immutable
/src/js/**/*.js?v=*                Cache-Control: public, max-age=31536000, immutable
/src/js/**/*.css?v=*               Cache-Control: public, max-age=31536000, immutable
```

No cambies manualmente el nombre ni el contenido de `service-worker.js`. Si una
publicación debe revertirse, vuelve a generar y desplegar el build de la versión
anterior: su contenido producirá otra versión de caché. Para resolver una
instalación dañada durante pruebas, se puede eliminar el almacenamiento del sitio
o anular el registro del service worker desde las herramientas del navegador.

### Publicar el código fuente (desarrollo)

**Opción 1: Usando Live Server en Visual Studio Code**

1. Instala la extensión "Live Server".
2. Haz clic derecho en `index.html` y selecciona "Open with Live Server".

**Opción 2: Usando Apache/Nginx**

1. Copia todo el contenido del proyecto a la carpeta pública de tu servidor web.

   Ejemplo para Apache en Linux:

   ```sh
   sudo cp -r ~/argenmap /var/www/html/argenmap
   ```

2. Accede desde tu navegador a:  
   `http://localhost/argenmap/`

---

## 4. Verificar funcionamiento

* Abre la URL donde publicaste el visor
* Si editaste archivos de configuración, vuelve a generar/publicar el build y
  recarga la página para aplicar los cambios.
* En las herramientas del navegador, verifica que el manifiesto no tenga errores
  y que `service-worker.js` figure como activado.

---

> [!IMPORTANT]
> ⚠️ En producción, cada modificación de configuración requiere regenerar y
> publicar el build para que cambie también la versión de la caché PWA.

---

➡️ **Siguiente paso:** [Configurar el visor](configuration.md)

---
