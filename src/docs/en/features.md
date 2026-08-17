# Features

- Add layers from WMS and WMTS services
- Add base maps from TMS and XYZ services
- Draw and download geometries
- Modify style of drawn geometries
- Query data of active layers by click or using a geometry as a filter
- Copy cursor coordinates
- Add layers from GeoJSON files
- Measure area and distance
- Show grid
- Filter the layer panel by a search box
- Manage every layer in a section from its contextual menu
- Show user location
- Capture map image
- Full screen view
- Include in URL as paraeters the current map position, zoom and active layers for sharing

## Layer section options

Each section heading includes an options button at its right edge. Its menu can:

- Enable every layer in the section, or disable them when they are all active.
- Pin one section to the top of its container. Pinning another section restores
  the configured order before moving the new one.
- Fit the map to the combined bounds of every layer, including joined-layer
  members and file geometries.
- Enable or disable querying for every queryable layer.
- Change the opacity of all layers with a live slider. The selected opacity is
  retained when a layer is disabled and enabled again.

Opening the options menu does not expand or collapse the section. For lazily
loaded OGC sections, actions that need layer metadata wait for that service to
load, without adding `GetCapabilities` requests to application startup.

## Responsive design on mobile devices

On screens up to 600 px wide, every main-menu button keeps a 44 px touch area
and the active panel receives the remaining viewport width. The layer search
fits that space without overflowing, while scrolling stays inside the panel.

While a side panel is open, potentially overlapping Leaflet controls are
temporarily hidden and disabled. They return when the panel is closed, the map
is tapped, or `Escape` is pressed. Touch devices retain targets of at least
44 px in landscape orientation as well.

The changelog is at https://github.com/ign-argentina/argenmap/releases
