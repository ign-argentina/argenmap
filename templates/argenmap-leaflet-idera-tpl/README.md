# Visualizador de Mapas de IDERA

Instrucciones en linux sobre la instalación el visualizador de mapas web de IDERA en su última versión y el servidor proxy asociado.
El proxy es utilizado para consultar geoservidores que publican servicios WMS de IDERA y que no poseen la opción de Access-Control-Allow-Origin (CORS). El proxy agrega esta opción.

# Pasos

## 1. Creación de sitio de publicación

El visualizador debe ser publicado mediante un servidor web. Se debe crear un directorio relacionado a un sitio para la publicación del visualizador. El resto del instructivo asume que el directorio de trabajo esta publicado.

## 2 Descargar el Visualizador ARGENMAP

`git clone --branch ItemGroupWMSSelector https://github.com/ign-argentina/argenmap idera`

## 3 Descargar el template del visualizador de IDERA

	cd idera/templates
	git clone --branch develop https://github.com/ign-argentina/argenmap-leaflet-idera-tpl.git 

## 4 Copiar el archivo de configuración
	mv argenmap-leaflet-idera-tpl/conf/menu.json ../js/
	
## 5 Eliminar el directorio de  configuración
Se puede eliminar el directorio de configuración que ya no es necesario y se encuentra vacío.
`rm -ri argenmap-leaflet-idera-tpl/conf/`

## 6 Proxy
El visualizador de IDERA consume información de servidores que no tienen habilitado la opción de CORS o que no implementan certificado de seguridad SSL/TSL.  Debido a que es necesario que dichas configuraciones estén establecidas en los servidores para poder tomar datos correctamente de ellos es imprescindible para el correcto funcionamiento del visualizador se ha habilitado temporariamente un proxy que suple dichas falencias.
El proxy se encuentra licenciado por Esri mediante la licencia Apache License, Version 2.0 y puede ser descargado de la siguiente URL: https://github.com/Esri/resource-proxy.
Una copia del proxy, su configuración y licencia se encuentra en el repositorio del template de IDERA descargado previamente.
Requerimientos del proxy:
Requirements
* PHP 5.6 or higher (recommended)
* cURL PHP extension
* OpenSSL PHP extension
* PDO_SQLITE PDO PHP extension

El proxy tiene un archivo de log que debe ser redirigido a un directorio que PHP pueda escribir.
Para configurarlo debe editarse el archivo: /templates/argenmap-leaflet-idera-tpl/proxy/proxy.config
En el caso de IDERA se debe remplazar:

	<?xml version="1.0" encoding="utf-8" ?>
	<ProxyConfig allowedReferers="*"
	logFile="proxy_log.log"
	mustMatch="true">
	
Por:

	<?xml version="1.0" encoding="utf-8" ?>
	<ProxyConfig allowedReferers="*"
	logFile="/var/log/mapaideraproxy/proxy_log.log"
	mustMatch="true">
	
Si encuentra problemas al utilizar el proxy, puede deshabilitar el log para evaluar si es un problemas de permisos en el directorio de salida del archivo del log, eliminando la opción <b>logFile</b>

	<?xml version="1.0" encoding="utf-8" ?>
	<ProxyConfig allowedReferers="*"	
	mustMatch="true">
	
## 7. Estadisticas
Puede incorporar el código que requiere el sistema de estadísticas de su elección modificando el archivo: js/analytics/analytics.js
	