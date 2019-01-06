# Leaflet.zoomhome

[![Travis CI badge](https://api.travis-ci.org/torfsen/leaflet.zoomhome.svg?branch=master)](https://travis-ci.org/torfsen/leaflet.zoomhome)

A [Leaflet](http://leafletjs.com/)-plugin that provides a zoom control with a
"Home" button to reset the view.

[Demo](https://torfsen.github.io/leaflet.zoomhome/)


## Usage

Supported Leaflet versions are 0.7.x and later.

This plugin requires [Font-Awesome](https://fortawesome.github.io/Font-Awesome/):

```xml
<link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css"/>
```

Copy `Leaflet.zoomhome.min.js` and `Leaflet.zoomhome.css` from the `dist` folder to
your project folder and include them in your HTML (you need to include Leaflet before
including the plugin):

```xml
<link rel="stylesheet" href="leaflet.zoomhome.css"/>
<script src="leaflet.zoomhome.min.js"></script>
```

Alternatively, you can install the plugin via [Bower](http://bower.io):

    bower install leaflet.zoomhome --save

When you create your map, pass `{zoomControl: false}` to disable the standard
zoom control:

```js
var map = L.map('map', {zoomControl: false});
```

Then create the zoomhome-control and add it to the map:

```js
var zoomHome = L.Control.zoomHome();
zoomHome.addTo(map);
```


## Options

You can pass additional options when you create the control:

```js
var zoomHome = L.Control.zoomHome({position: 'topright'});
```

In addition to the [options supported by the standard zoom control](http://leafletjs.com/reference.html#control-zoom),
the zoomhome-control supports the following options:

`zoomHomeIcon`: Font-Awesome icon name for the home button (default: `'home'`).

`zoomHomeTitle`: Tooltip-text of the home button (default: `'Home'`).

`homeCoordinates`: Coordinates on which the map is centered when the home button
is pressed (default: the location which the map displayed when the control was
added to the map).

`homeZoom`: The zoom level to which the map zooms when the home button is pressed
(default: the zoom level that was active when the control was added to the map).


## Changing the Home View

You can change the home view after the control has been created using the
following functions.

`zoomHome.setHomeCoordinates(coordinates)`: If `coordinates` are given then
they define the new home coordinates. If no coordinates are given then the
current map center becomes the new home location. The home zoom level is not
changed.

`zoomHome.setHomeZoom(zoom)`: If `zoom` is given then it defines the new home
zoom. If no zoom is given then the current map zoom becomes the new home zoom.
The home coordinates are not changed.

`zoomHome.setHomeBounds(bounds)`: If `bounds` are given then they define the
new home view (both zoom and center). If they are not given, the current map
bounds become the new home.


## Inspecting the Home View

You can get the home coordinates and zoom using the
`zoomHome.getHomeCoordinates()` and `zoomHome.getHomeZoom()` functions,
respectively.


## Change Log

See the file [CHANGELOG.md](CHANGELOG.md).


## License

Based on [code by toms](https://gis.stackexchange.com/a/127383/48264) and
licensed under [CC-BY-SA 3.0](http://creativecommons.org/licenses/by-sa/3.0/).


## Development

Install all requirements using `npm install`.

The tests can be run via `grunt test` (test against the currently installed Leaflet version) or via `grunt test-all` (test against all supported Leaflet versions).

Linting can be done via `grunt jshint`, and `grunt uglify` updates the minified JS file.

`grunt` on its own is equivalent to running the `jshint`, `test-all` and `uglify` tasks.

