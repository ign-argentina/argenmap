Leaflet.SimpleGraticule
------------
A graticule for maps in Leaflet's L.CRS.Simple coordinate system. Code inspiration came from Jan Pieter Waagmeester's fantastic
[Leaflet.Grid](https://github.com/jieter) for world projections. It is very similar in nature but assumes an infinite flat plane.

Usage
-----
Adding L.SimpleGraticule:

```JavaScript
var options = {interval: 20,
               showOriginLabel: true,
               redraw: 'move',
               zoomIntervals: [
                {start: 0, end: 3, interval: 50},
                {start: 4, end: 5, interval: 5},
                {start: 6, end: 20, interval: 1}
            ]};

L.simpleGraticule(options).addTo(map);
```
####Options:####
- interval: The spacing in map units between horizontal and vertical lines.
- showOriginLabel: true Whether or not to show '(0,0)' at the origin.
- redraw: on which map event to redraw the graticule. On `move` is default but `moveend` can be smoother.
- zoomIntervals: use different intervals in different zoom levels. If not specified, all zoom levels use value in interval option.

Notes
-----
- This is my first open source contribution. I appreciate feedback on any topics!
