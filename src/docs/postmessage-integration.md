# Integración bidireccional mediante `postMessage` en Argenmap

Este documento describe la arquitectura, el contrato del protocolo v1, las reglas de validación y seguridad, y la configuración de despliegue implementadas en Argenmap para recibir y aplicar configuraciones en caliente cuando se ejecuta embebido dentro de un `<iframe>` (por ejemplo, desde `editor-argenmap`).

---

## A. Arquitectura

La integración se organiza en tres módulos UMD en JavaScript Vanilla ubicados en `src/js/components/messaging/`, cargados en orden de dependencia tras `app.js` y `UserInterface.js`:

1. **`ConfigProcessor`** (`src/js/components/messaging/config-processor.js`)
   - Valida estructural y tipológicamente las configuraciones entrantes (`{ data, preferences }`) y sus subestructuras (`mapConfig`, `data.items`, mapas base, capas WMS).
   - Detecta actualizaciones completas (`partial: false`) o parciales (`partial: true`).
   - Fusiona actualizaciones parciales mediante `deepMerge` sin mutar las referencias originales (`deepClone`).
   - Normaliza el resultado utilizando `ConfigurationAdapter` (cuando está disponible en el entorno) y detecta las secciones modificadas (`prepareConfigUpdate`).

2. **`LiveUpdater`** (`src/js/components/messaging/live-updater.js`)
   - Aplica en caliente las configuraciones preparadas por `ConfigProcessor` sobre el estado en ejecución de Argenmap (`app`, `gestorMenu`, `baseLayers`, `baseLayersInfo`, `selectedBasemap`, `currentBaseMap`, `overlayMaps`) y sobre la instancia existente de Leaflet (`mapa`).
   - **No recarga el documento ni recrea `L.Map`**: `mapa._leaflet_id` permanece invariante durante todas las actualizaciones.
   - Reconcilia `mapConfig`, preferencias visuales y funcionales, mapas base y servicios WMS (con control de concurrencia mediante `_updateGeneration` ante respuestas asíncronas de `GetCapabilities`).

3. **`MessageBridge`** (`src/js/components/messaging/message-bridge.js`)
   - Detecta si el visor se encuentra embebido en un `<iframe>` (`isEmbedded()`) o ejecutándose de forma independiente (standalone).
   - Centraliza el registro único del listener `window.addEventListener("message", ...)`, la validación de `event.origin`, `event.source` y del sobre del protocolo, la emisión de `VIEWER_READY` cuando el mapa está listo (`argenmap:map-ready`), y el despacho hacia `LiveUpdater`.

### Relación entre editor, iframe y visor Leaflet

```text
+--------------------------+        postMessage (v1)        +--------------------------------+
|  Aplicación anfitriona   | -----------------------------> | Argenmap (iframe)              |
|  (ej. editor-argenmap)   | <----------------------------- |  1. MessageBridge (transporte) |
+--------------------------+   VIEWER_READY / CONFIG_*      |  2. ConfigProcessor (validar)  |
                                                            |  3. LiveUpdater (reconciliar)  |
                                                            |  4. Leaflet (mapa existente)   |
                                                            +--------------------------------+
```

Cuando Argenmap se abre de forma independiente (standalone, `window.parent === window`), `MessageBridge` no registra listeners de mensajería ni emite mensajes, preservando íntegramente el comportamiento habitual del visor.

---

## B. Mensajes del protocolo v1

Todos los mensajes utilizan la clave `type` (nunca `tipo`), `protocol: "argenmap"` y `version: 1`. Los mensajes con `messageId` requieren una cadena alfanumérica/separadores (`^[a-zA-Z0-9._:-]{1,128}$`) de entre 1 y 128 caracteres.

### 1. `VIEWER_READY`
- **Dirección:** Visor → Padre.
- **Finalidad:** Informar al documento padre que la instancia de Leaflet (`mapa`) y los módulos `ConfigProcessor` y `LiveUpdater` están inicializados y listos para recibir mensajes.
- **Comportamiento:** Se emite una única vez por inicialización al dispararse `argenmap:map-ready` (o inmediatamente si el mapa ya existe al inicializar `MessageBridge`), únicamente cuando el visor está embebido y existe un `targetOrigin` validado.
- **Estructura:**
  ```json
  {
    "protocol": "argenmap",
    "version": 1,
    "type": "VIEWER_READY"
  }
  ```

### 2. `UPDATE_CONFIG`
- **Dirección:** Padre → Visor.
- **Finalidad:** Enviar una configuración completa o parcial para aplicarla en caliente sobre el visor.
- **Comportamiento:** `MessageBridge` valida el origen, emisor y sobre del mensaje, invoca `LiveUpdater.applyConfiguration(payload.config, { partial: payload.partial === true })` y responde con `CONFIG_UPDATED`. Si llega antes de que el mapa esté inicializado, responde con `success: false` sin alterar el visor.
- **Estructura:**
  ```json
  {
    "protocol": "argenmap",
    "version": 1,
    "type": "UPDATE_CONFIG",
    "messageId": "update-001",
    "payload": {
      "partial": false,
      "config": {
        "data": {},
        "preferences": {}
      }
    }
  }
  ```

### 3. `CONFIG_UPDATED`
- **Dirección:** Visor → Padre.
- **Finalidad:** Confirmar el resultado de una solicitud `UPDATE_CONFIG`, conservando el mismo `messageId`.
- **Comportamiento:** Informa si la aplicación fue exitosa (`success`), si hubo cambios efectivos (`hasChanges`), las secciones modificadas (`appliedSections`), advertencias (`warnings`, por ejemplo preferencias solo de inicialización o actualizaciones desplazadas por concurrencia) y errores (`errors`). Ante excepciones inesperadas devuelve un mensaje de error genérico sin exponer detalles internos.
- **Estructura:**
  ```json
  {
    "protocol": "argenmap",
    "version": 1,
    "type": "CONFIG_UPDATED",
    "messageId": "update-001",
    "payload": {
      "success": true,
      "hasChanges": true,
      "appliedSections": ["preferences.title", "mapConfig.center"],
      "warnings": [],
      "errors": []
    }
  }
  ```

### 4. `GET_CONFIG`
- **Dirección:** Padre → Visor.
- **Finalidad:** Solicitar la configuración declarativa vigente del visor.
- **Comportamiento:** Obtiene el estado declarativo actual mediante `LiveUpdater.getCurrentConfig()` (sin incluir el estado efímero de navegación manual del usuario), elimina claves internas y responde con `CONFIG_STATE`.
- **Estructura:**
  ```json
  {
    "protocol": "argenmap",
    "version": 1,
    "type": "GET_CONFIG",
    "messageId": "request-001"
  }
  ```

### 5. `CONFIG_STATE`
- **Dirección:** Visor → Padre.
- **Finalidad:** Devolver la configuración declarativa actual (`data` y `preferences`) asociada al `messageId` de la solicitud `GET_CONFIG`.
- **Estructura:**
  ```json
  {
    "protocol": "argenmap",
    "version": 1,
    "type": "CONFIG_STATE",
    "messageId": "request-001",
    "payload": {
      "data": {},
      "preferences": {}
    }
  }
  ```

---

## C. Actualización de configuración (`partial: false` vs `partial: true`)

- **`partial: false` (actualización completa):**
  Reemplaza las ramas `data` y `preferences` por la configuración recibida. Si se omite alguna de las dos ramas en el payload, `ConfigProcessor` aplica respaldo seguro desde la configuración base vigente.
- **`partial: true` (actualización parcial):**
  Fusiona profundamente (`deepMerge`) las propiedades enviadas sobre la configuración declarativa vigente:
  - Las propiedades no especificadas se **preservan** intactas.
  - Los valores *falsy* válidos (`false`, `0`, `""`) enviados explícitamente sobrescriben a los valores previos.
  - **Manejo de arreglos (arrays):** los arreglos **no se concatenan**; cualquier arreglo enviado (por ejemplo, `data.items`, `allowed_layers` o listas dentro de preferencias) **reemplaza por completo** al arreglo anterior en esa clave. Si se envía `data` sin `items`, se conservan los `items` previos junto con las demás claves no modificadas de `data`.

---

## D. Seguridad

1. **Validación de `event.origin`:**
   - Todo mensaje entrante se valida estrictamente contra la lista de orígenes permitidos (`_allowedOrigins`) mediante `normalizeOrigin(event.origin, { allowTrailingSlash: false })`.
   - Se rechazan explícitamente `"*"`, `"null"`, comodines, esquemas distintos de `http:` / `https:` y URLs con credenciales, rutas, `search` o `hash`.
   - Cualquier mensaje de un origen no autorizado se descarta sin modificar el visor ni emitir respuesta.

2. **Validación de `event.source`:**
   - `isValidSource()` exige que el visor esté embebido (`isEmbedded()`) y que `event.source === window.parent` y `event.source !== window`.
   - Se rechazan mensajes provenientes de la propia ventana, iframes hijos u otras ventanas.

3. **Uso de `targetOrigin`:**
   - Nunca se utiliza `targetOrigin: "*"`.
   - Para respuestas (`CONFIG_UPDATED`, `CONFIG_STATE`) se envía exclusivamente a `event.source` usando el `event.origin` ya validado.
   - Para `VIEWER_READY`, `resolveParentTargetOrigin()` verifica el origen del padre mediante `location.ancestorOrigins[0]` o `document.referrer` contra `_allowedOrigins`; si el origen detectado no está autorizado o no puede determinarse de forma segura, bloquea el envío.

4. **Validación de protocolo y versión:**
   - Se verifica que `event.data` sea un objeto plano con `protocol === "argenmap"`, `version === 1` (entero), `type` perteneciente a los tipos entrantes admitidos (`UPDATE_CONFIG`, `GET_CONFIG`), `messageId` válido y `payload` bien formado. No se evalúa ni ejecuta código recibido en mensajes.

5. **Política de `allowedOrigins`:**
   - En entorno de desarrollo (`<meta name="argenmap-build" content="development">` o `localhost` / `127.0.0.1`), si no se configuraron orígenes personalizados, se habilita una lista cerrada de puertos locales (`localhost` y `127.0.0.1` en puertos `3000`, `4173`, `5173`, `5174`, `8080`, más `window.location.origin`).
   - En producción (`<meta name="argenmap-build" content="production">`), si no hay orígenes configurados explícitamente, la lista permanece vacía y la comunicación externa queda deshabilitada.

---

## E. Configuración de despliegue

`MessageBridge` admite las siguientes fuentes para definir los orígenes permitidos (`allowedOrigins`), evaluadas en el siguiente orden de prioridad:

1. **Opciones de inicialización programática:**
   ```js
   MessageBridge.init({
     allowedOrigins: ["https://editor.ejemplo.gob.ar"],
   });
   ```
2. **Actualización explícita en tiempo de ejecución:**
   ```js
   MessageBridge.setAllowedOrigins(["https://editor.ejemplo.gob.ar"]);
   ```
3. **Variable global previa a la carga del puente:**
   ```js
   window.ARGENMAP_ALLOWED_ORIGINS = ["https://editor.ejemplo.gob.ar"];
   ```
   *(También admite una cadena con orígenes separados por comas).*
4. **Metaetiqueta HTML en `index.html`:**
   ```html
   <meta name="argenmap-allowed-origins" content="https://editor.ejemplo.gob.ar">
   ```
5. **Preferencias de Argenmap (`preferences.json` / `app`):**
   - `app.messaging.allowedOrigins`
   - `app.allowedOrigins`

> **Comportamiento seguro por defecto en producción:** Si en un despliegue de producción no se especifica ninguna de las fuentes anteriores, `MessageBridge` no habilita orígenes por defecto (`reason: "no_allowed_origins"`), no registra el listener de mensajes ni emite `VIEWER_READY`.

---

## F. Limitaciones actuales

- El emisor `postMessage` en `editor-argenmap` todavía no está implementado (corresponde a una etapa posterior).
- La integración extremo a extremo en navegador entre `editor-argenmap` y Argenmap embebido queda pendiente de esa etapa.
- La navegación manual del usuario dentro del mapa (desplazamientos o cambios de zoom interactivos) no se sincroniza hacia el documento padre como eventos salientes dentro del protocolo v1.
- El mecanismo previo basado en HTTP/POST o carga estática de `data.json` / `preferences.json` no fue modificado y continúa funcionando normalmente.
