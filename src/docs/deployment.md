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
* Si editaste archivos de configuración, recarga la página para aplicar los cambios

---

> [!IMPORTANT]
> ⚠️ Cada vez que modifiques la configuración, debes recargar el visor en el navegador.

---

➡️ **Siguiente paso:** [Configurar el visor](configuration.md)

---
