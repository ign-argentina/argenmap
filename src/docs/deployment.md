# Guía rápida de instalación

### Requerimientos

- Servidor web (Nginx, Apache, lighttpd, etc.)

## 1. Descargar código

Clonar con el comando:

    git clone https://github.com/ign-argentina/argenmap.git

O descargar el código en formato ZIP y descomprimirlo con la sig. URL: 

https://github.com/ign-argentina/argenmap/archive/master.zip

## 2. Definir la configuración 

Copiar los archivos de configuración por defecto que están en el directorio `src/config/default` al directorio `src/config` y editar los nuevos archivos según se desee.

> [!TIP]
> Los mapas base, capas y modo en que se agrupan y ordenan se definen en el archivo `data.json` 
>
> La apariencia, vista inicial del mapa y otras opciones en `preferences.json`.

En el artículo de **[Configuración](configuration.md)** se detalla esta parte del proceso.

## 3. Publicar el visor 

Mover o copiar el código del visor al directorio raíz de un servidor web o con alguna herramienta de depuración como LiveServer en Visual Studio Code, etc y abrir en un navegador web la URL donde se encuentra publicado.

> [!IMPORTANT]
> Para ver cambios en la configuración es necesario recargar el visor en el navegador.

### Siguiente: [Configurar el visor](configuration.md)
