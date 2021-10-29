/**
 * File Layer handles KML, JSON, GeoJson, WKT, TXT, GPX and Zip (shapefile) file types from an input file
 * Used libraries: 
 * · Shpafiles: https://github.com/calvinmetcalf/shapefile-js
 * · KML, WKT, TOPOJSON, GPX: https://github.com/mapbox/leaflet-omnivore
 * · GeoJSON: Leaflet
 **/

 class FileLayer {
    constructor(){
        this.file = null;
        this.fileName = null;
        this.format = null;
        this.layerData = null;
        this.layerType = null;
        this.fileSize = null;
        this.layer = null;
        this.id = null;
    }

    getFileName(){
        return this.fileName;
    }

    getLayer(){
        return this.layer;
    }

    getRawLayerData(){
        return this.layerData;
    }

    getFormat(){
        return this.format;
    }

    getLayerType(){
        return this.layerType;
    }

    getId(){
        return this.id;
    }

    getGeoJSON(){
        // we assume that zip is the format for shapefile
        if(this.format == 'zip'){
            return this.layer;
        }

        return this.layer.toGeoJSON();
    }

    getFileSize(measure){
        if (measure && typeof measure == 'string') {
            if(measure == 'kb') {
                return this.fileSize/1000;
            }
        }
        return this.fileSize;
    }

    handleFile(file){
        // TODO Agregar soporte para archivos locales desde consola por ejemplo, no solo de input.
        this.file = file;
        this.fileName = file.name;
        this.format = file.name.split(".").pop();
        this.fileSize = file.size;
        this.id = this.format + (''+new Date().getTime()).substr(8);
        // Fetch the file
        return new Promise((resolve,reject)=>{
            fetch(URL.createObjectURL(file))
            .then((response)=>{
                // Parse the response
                let responseType = this.getResponseType();
                // Parse the response to the required format ex: response.text(), response.json()
                this.handleResponse(response,responseType).then((data)=>{
                    // Converts using the libraries
                    this.getGeojson(data).then((result)=>{
                        this.layer = result;
                        resolve();
                    }).catch((error)=>{
                        console.error("error converting to geoJSON");
                        reject(error)
                    })
                }).catch((error)=>{
                    console.error("error reading the file");
                    reject(error)
                })
            }).catch((error)=>{
                console.error("error getting the file");
                reject(error)
            })
        });
    }

    /**
     * Converts different data to the expected format and returns a geoJSON
     * @param {String} data from response
     * @returns a geoJSON object
     */
    getGeojson(data){
        return new Promise((resolve,reject)=>{
            let layer = null;
            switch (this.format) {
                case 'zip':
                    // Its necessary return the promise, only in this case because shp resolves in a promise
                    this.layerType = 'shapefile';
                    return shp(data).then((parsedLayer)=>{
                        resolve(parsedLayer);
                    }).catch(()=>{
                        reject(`El archivo ${this.fileName} no pudo ser procesado, verifíquelo e intente nuevamente.`)
                    })
                    break;
                case 'json':
                case 'geojson':
                    if (data.type == 'Topology') {
                        this.layerType = 'topoJSON';
                        layer = omnivore.topojson.parse(data);
                    }else{
                        this.layerType = 'geoJSON';
                        layer = L.geoJSON(data);
                    }
                    break;
                case 'kml':
                    this.layerType = 'kml';
                    layer = omnivore.kml.parse(data);
                    break;
                case 'txt':
                case 'wkt':
                    this.layerType = 'wkt';
                    layer = omnivore.wkt.parse(data);
                    break;
                case 'gpx':
                    this.layerType = 'gpx';
                    layer = omnivore.gpx.parse(data);
                    break;
                default:
                    break;
            }

            // Se comprueba que layer haya sido resuelto y que disponga de layers
            if(layer == null || Object.keys(layer._layers).length == 0){
                reject(`El archivo ${this.fileName} no pudo ser procesado, verifíquelo e intente nuevamente.`);
            }else {resolve(layer)}
        })
    }

    /**
     * Convert the body text of a response to the desired format type (json, text, arrayBuffer)
     * @param {*} response 
     * @param {String} responseType 
     * @returns promise which resolves with the result of parsing the body text
     */
    handleResponse(response,responseType){
        return new Promise((resolve,reject)=>{
            switch (responseType) {
                case 'text':
                    response.text().then((data)=>{
                        this.layerData = data;
                        resolve(data);
                    });
                    break;
                    case 'json':
                    response.json().then((data)=>{
                        this.layerData = data;
                        resolve(data);
                    });
                    break;
                    case 'arrayBuffer':
                    response.arrayBuffer().then((data)=>{
                        this.layerData = data;
                        resolve(data);
                    });
                    break;
                default:
                    reject('invalid file');
            }
        })
    }

    getResponseType(){
        /**
         * An object to retrieve the type of response, it is used to parse the response of a fetch
         */
        let responseType = {
            'txt':'text',
            'wkt':'text',
            'gpx':'text',
            'kml':'text',
            'json':'json',
            'geojson':'json',
            'zip':'arrayBuffer'
        };

        return responseType[this.format];
    }
}