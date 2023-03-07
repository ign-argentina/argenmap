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
        if (!url || !url.length) {
            //throw new Error('url parameter is required');
            new UserMessage(STRINGS.url_required, true, 'warning');
            return null;
        } 
        // Validate url returns an object with the host (www.google.com) and capability (...gle.com/wms?service=getCapa.)
        let validatedUrl = this.validateUrl(url)
        this.url = validatedUrl.capability;
        this.host = validatedUrl.host;

        const options = {
            redirect: "follow",
            referrerPolicy: "no-referrer"
        };
        let data = null;

        await fetch(this.url, options)
            .then( res => {
                if(!res.ok){
                    throw new Error('Network response was not OK. Status code: ' + res.status);
                }
                return res.text();
            })
            .then( d => data = d )
            .catch( e => { throw new Error(e) });

        return new WMSCapabilities().parse(data);
    }


    async loadWMS(url){
        try {
            const data = await this.handleRequest(url);

            this.rawData = data;
            this.title = this.rawData.Service.Title;
            this.title.replace(/[^a-zA-Z ]/g, "").replace(/ /g, "_");
            this.id = this.generateId(this.title);

            return this.layers = this.rawData.Capability.Layer.Layer.map((layer) => {
                // assign minx, miny, etc depending on CRS
                let bbox;
                layer.BoundingBox.some((p) => {
                    let crs = p.crs.toString().toLowerCase();
                    bbox = p.extent;
                    return true;
                    // The following if triggers an error if layer's CRS doesn't match with WGS84, it is commented until is managed in a more suitable way
                    /* if ( crs === 'crs:84' || crs === 'epsg:4326') { 
                        bbox = p.extent;
                        return true;
                    } */
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
