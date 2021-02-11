describe('addTo', function () {

    it('uses the given coordinates', async function () {
        var homeCoordinates = await page.evaluate(() => {
            var zoomHome = L.Control.zoomHome({homeCoordinates: [50, 10]});
            zoomHome.addTo(map);
            return zoomHome.getHomeCoordinates();
        });
        assert.deepEqual(homeCoordinates, [50, 10]);
    });

    it('uses the map center when no coordinates are given', async function () {
        var homeCoordinates = await page.evaluate(() => {
            var zoomHome = L.Control.zoomHome();
            zoomHome.addTo(map);
            return zoomHome.getHomeCoordinates();
        });
        var mapCenter = await page.evaluate(() => map.getCenter());
        assert.deepEqual(homeCoordinates, mapCenter);
    });

    it('uses the given zoom', async function () {
        var homeZoom = await page.evaluate(() => {
            var zoomHome = L.Control.zoomHome({homeZoom: 5});
            zoomHome.addTo(map);
            return zoomHome.getHomeZoom();
        });
        assert.equal(homeZoom, 5);
    });

    it('uses the map zoom when no zoom is given', async function () {
        var homeZoom = await page.evaluate(() => {
            var zoomHome = L.Control.zoomHome();
            zoomHome.addTo(map);
            return zoomHome.getHomeZoom();
        });
        var mapZoom = await page.evaluate(() => map.getZoom());
        assert.equal(homeZoom, mapZoom);
    });

    it('adds the control to the map', async function () {
        await page.evaluate(() => L.Control.zoomHome().addTo(map));
        var controlElement = await page.$('#map .leaflet-control-zoomhome');
        assert.exists(controlElement);
    });

});


describe('Clicking the home button', function () {

    it('resets the map center and zoom', async function () {
        await page.evaluate(() => {
            console.log('Hello');
            window.zoomHome = L.Control.zoomHome({
                homeCoordinates: [50, 10],
                homeZoom: 5,
            });
            zoomHome.addTo(map);
        });
        var homeButton = await page.$('#map .leaflet-control-zoomhome-home');
        // See https://github.com/GoogleChrome/puppeteer/issues/1484
        page.evaluate(e => e.click(), homeButton);
        var center = await page.evaluate(() => map.getCenter());
        var zoom = await page.evaluate(() => map.getZoom());
        assert.deepEqual(center, {lat: 50, lng: 10});
        assert.equal(zoom, 5);
    });

});


describe('setHomeCoordinates', function () {

    it('uses the given coordinates', async function () {
        var homeCoordinates = await page.evaluate(() => {
            var zoomHome = L.Control.zoomHome();
            zoomHome.addTo(map);
            zoomHome.setHomeCoordinates([50, 10]);
            return zoomHome.getHomeCoordinates();
        });
        assert.deepEqual(homeCoordinates, [50, 10]);
    });

    it('uses the map center when no coordinates are given', async function () {
        var homeCoordinates = await page.evaluate(() => {
            var zoomHome = L.Control.zoomHome();
            zoomHome.addTo(map);
            map.setView([50, 10]);
            zoomHome.setHomeCoordinates();
            return zoomHome.getHomeCoordinates();
        });
        assert.deepEqual(homeCoordinates, {lat: 50, lng: 10});
    });

});


describe('setHomeZoom', function () {

    it('uses the given zoom', async function () {
        var homeZoom = await page.evaluate(() => {
            var zoomHome = L.Control.zoomHome();
            zoomHome.addTo(map);
            zoomHome.setHomeZoom(5);
            return zoomHome.getHomeZoom();
        });
        assert.equal(homeZoom, 5);
    });

    it('uses the map zoom when no zoom is given', async function () {
        var homeZoom = await page.evaluate(() => {
            var zoomHome = L.Control.zoomHome();
            zoomHome.addTo(map);
            map.setZoom(5);
            zoomHome.setHomeZoom();
            return zoomHome.getHomeZoom();
        });
        assert.equal(homeZoom, 5);
    });

});


describe('setHomeBounds', function () {

    it('uses the given bounds', async function () {
        var homeView = await page.evaluate(() => {
            var zoomHome = L.Control.zoomHome();
            zoomHome.addTo(map);
            zoomHome.setHomeBounds([[50, 10], [51, 11]]);
            return {
                coordinates: zoomHome.getHomeCoordinates(),
                zoom: zoomHome.getHomeZoom(),
            };
        });
        assert.deepEqual(homeView, {
            coordinates: {lat: 50.5, lng: 10.5},
            zoom: 6,
        });
    });

    it('uses the map bounds when no bounds are given', async function () {
        var homeView = await page.evaluate(() => {
            var zoomHome = L.Control.zoomHome();
            zoomHome.addTo(map);
            map.fitBounds([[50, 10], [51, 11]]);
            zoomHome.setHomeBounds();
            return {
                coordinates: zoomHome.getHomeCoordinates(),
                zoom: zoomHome.getHomeZoom(),
            };
        });
        assert.equal(homeView.zoom, 6);
        // See https://github.com/Leaflet/Leaflet/issues/5211
        assert.approximately(homeView.coordinates.lat, 50.5, 0.01);
        assert.approximately(homeView.coordinates.lng, 10.5, 0.01);
    });

});

