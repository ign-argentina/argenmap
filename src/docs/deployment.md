## Requerimientos

- Servidor web (Nginx, Apache, lighttpd, etc.)

## Guía rápida de instalación

### Primer paso: descargar código

Clonar el repositorio o descargarlo en formato ZIP y descomprimirlo:

Para clonar, usar la URL https://github.com/ign-argentina/argenmap.git
y el comando:

    git clone https://github.com/ign-argentina/argenmap.git

Para descargar el repositorio comprimido en formato ZIP: 

https://github.com/ign-argentina/argenmap/archive/master.zip

### Segundo paso: definir la configuración 

Los mapas base, capas se definen `data.json` y la configuración en `preferences.json`.

> En "data" se definen los mapas base y capas, al modificarlo y recargar la página se verán los cambios hechos.

En el artículo de **[Configuración](configuration.md)** se detalla esta parte del proceso.

### Tercer paso: publicar visor 

Publicar el contenido de este repositorio con un servidor web o con alguna herramienta de depuración como LiveServer en Visual Studio Code, etc.

## Siguiente: [Configuración](configuration.md)
