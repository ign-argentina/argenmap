# Guía rápida de instalación

### Requisitos previos

- Un servidor web (Nginx, Apache, lighttpd, o similar)
- Acceso a la terminal o consola de comandos
- Git instalado (opcional, pero recomendado)
- Editor de texto (Visual Studio Code, Sublime Text, etc.)

---

## 1. Descargar el código fuente

**Opción 1: Usando Git**

```powershell
git clone https://github.com/ign-argentina/argenmap.git
cd argenmap
```

**Opción 2: Descarga manual**

1. Ve a: https://github.com/ign-argentina/argenmap
2. Haz clic en "Code" > "Download ZIP"
3. Extrae el archivo ZIP en la carpeta deseada

Link de descarga directa:

```plaintext
https://github.com/ign-argentina/argenmap/archive/master.zip
```

---

## 2. Configurar archivos de configuración de la aplicación

Copia los archivos de configuración que están en el directorio `src/config/default` al directorio `src/config` y editar los nuevos archivos según se desee.

1. Copia los archivos de configuración por defecto:

   ```bash
   # En Linux
   cp -r src/config/default/* src/config/
   ```

2. Edita los archivos de configuración según tus necesidades:

   - [`src/config/data.json`](../config/data.json): Define mapas base, capas y agrupaciones.
   - [`src/config/preferences.json`](../config/preferences.json): Configura la apariencia y opciones iniciales.

   **Ejemplo de edición:**

   ```json
   // src/config/preferences.json
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
   },
   [...]
   }
   ```

> Consulta el artículo de **[Configuración](configuration.md)** para detalles avanzados.

---

## 3. Publicar el visor en un servidor web

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

- Abre la URL donde publicaste el visor.
- Si realizas cambios en la configuración, recarga la página para ver los cambios.

---

> [!IMPORTANT]
> Para ver cambios en la configuración es necesario recargar el visor en el navegador.

### Siguiente: [Configurar el visor](configuration.md)
