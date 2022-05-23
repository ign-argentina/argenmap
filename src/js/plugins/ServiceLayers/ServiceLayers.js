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

    /**
     * Checks the url given according to the request type getCapabilities, then returns the data or an error
     * @param {String} url for request of type getCapabilities
     * @returns a promise with the capabilities data
     */
    async handleRequest(url){
        if (!url || !url.length) throw new Error('url parameter is required');
        // Validate url returns an object with the host (www.google.com) and capability (...gle.com/wms?service=getCapa.)
        let validatedUrl = this.validateUrl(url)
        this.url = validatedUrl.capability;
        this.host = validatedUrl.host;
        
        try {
            const response = await fetch(this.url);
            // Check response
            if (!response.ok) throw new Error(`An error has occured: ${response.status}`);
            // Parse the response
            const data = await response.text();

            // Instantiate the capabilities parser
            const wmsParser = new WMSCapabilities(); // TODO add new parsers for other types of services
            // Parse and resolve
            const capabilities = await wmsParser.parse(data);

            return capabilities;
        } catch (error) {
            // when a CORS type error occurs the name of the error is a "TypeError", different from a 404 which is an "Error" 
            if(error.name==="TypeError") throw new Error('Maybe a Cross-Origin Request Blocked (CORS)',error);
            
            throw error;
        }
    }


    async loadWMS(url){
        try {
            const data = await this.handleRequest(url);

            this.rawData = data;
            this.title = this.rawData.Service.Title;
            this.title.replace(/[^a-zA-Z ]/g, "").replace(/ /g, "_");
            this.id = this.generateId(this.title);

            return this.layers = this.rawData.Capability.Layer.Layer.map((layer) => {
                // TODO Se deberia comprobar la existencia de CRS:84 
                // realizar la asignación de minx,miny,etc dependiendo el sistema
                let bbox;
                layer.BoundingBox.some((p) => {
                    if (p.crs == 'CRS:84') {
                        bbox = p.extent;
                        return true;
                    }
                });
                let style = "";
                (layer.Style) ? 
                    style = layer.Style[0].LegendURL[0] 
                    : style;
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
                    legend: style.OnlineResource,
                    hostName: style.Name
                }
            });
        } catch (error) { throw error }
    }

    generateId() {
        // A horrible but quickly way to parse String (+ "")
        return 'wms-'+(new Date().getTime() + "").substr(6);
    }
    
    /**
     * Check and transform url if it necessary, adding service=wms, getCapabilities or http scheme
     * @param {String} url to getCapabilities
     * @returns {Object} capability url and host
     */
    validateUrl(url) {
        // create an element "a" to use its properties
        var a = document.createElement('a');
        a.href = url;
    
        return {
            host: a.origin + a.pathname,
            capability: a.origin + a.pathname + '?service=wms&request=GetCapabilities'
        }
    }
}
