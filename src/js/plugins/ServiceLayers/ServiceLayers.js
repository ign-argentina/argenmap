class ServiceLayers{
    constructor(){
        this.layers = null;
        this.url = null;
        this.host = null;
        this.rawData = null;
        this.title = null;
        this.abstract = null;
        this.id = null;
    }

    getLayers(){
        return this.layers;
    }
    
    getTitle(){
        return this.title;
    }

    getId(){
        return this.id;
    }

    loadWMS(url) {
        return new Promise((res,rej)=>{
            this.handleURL(url).then((data)=>{
                this.rawData = data;
                this.title = this.rawData.Service.Title;
                this.id = generateId(this.title);
    
                this.layers = this.rawData.Capability.Layer.Layer.map((layer) => {

                    let bbox;
                    // TODO Se deberia comprobar la existencia de CRS:84 realizar la asignación de minx,miny,etc acá dependiendo el sistema
                    layer.BoundingBox.some((p) => {
                        if (p.crs == 'CRS:84') {
                            bbox = p.extent;
                            return true;
                        }
                    })

                    return {
                        name: layer.Name,
                        title: layer.Title,
                        srs: layer.BoundingBox[0].crs,
                        host: this.host,
                        minx: bbox[0],
                        miny: bbox[1],
                        maxx: bbox[2],
                        maxy: bbox[3],
                        attribution: layer.Attribution,
                        abstract: layer.Abstract,
                        legend:layer.Style[0].LegendURL[0].OnlineResource,
                        hostName:layer.Style[0].LegendURL[0].Name
                    }
                });
                res(this.layers);
    
            }).catch((error)=>{rej(error)})
        })
    }

    handleURL(url){
        return new Promise((resolve,reject)=>{
            if (!url) {
                reject('url parameter is required');
            }
            
            let validatedUrl = validateUrl(url)
            this.url = validatedUrl.capability;
            this.host = validatedUrl.host;

            // Get data
            return fetch(this.url)
            .then(function (response) {
                return response.text();
            })
            .then(function (text) {
                // Instantiate the capabilities Parser
                const wmsParser = new WMSCapabilities();
                // Parse and resolve
                resolve(wmsParser.parse(text));
            }).catch((error)=>{
                reject(error);
            })
        })

    }
}

function generateId() {
    // A horrible but quickly way to parse String (+ "")
    return 'wms-'+(new Date().getTime() + "").substr(6);
}

/**
 * Check and transform url if it necessary, adding service=wms, getCapabilities or http scheme
 * @param {String} url to getCapabilities
 * @returns {Object} capability url and host
 */
function validateUrl(url) {
    // create an element "a" to use its properties
    var a = document.createElement('a');
    a.href = url;

    return {
        host: a.origin + a.pathname,
        capability: a.origin + a.pathname + '?service=wms&request=GetCapabilities'
    }
}