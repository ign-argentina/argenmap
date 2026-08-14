# Argenmap configuration guide

This guide describes the settings affected by `src/config/data.json` and
`src/config/preferences.json`. Copy the files from `src/config/default/` when
starting a new configuration and validate the JSON after each change.

## Basemaps, sections, and layers (`data.json`)

The legacy structure uses `items`: the first item contains the basemaps and
each following item defines a WMS or WMTS section.

```jsonc
{
  "items": [
    { "capas": [/* basemaps */] },
    { /* WMS or WMTS service */ }
  ],
  "layers_joins": [],
  "template_feature_info_exception": ["gid"]
}
```

### Basemap example

```jsonc
{
  "titulo": "Argenmap",
  "nombre": "argenmap",
  "servicio": "tms",
  "version": "1.0.0",
  "attribution": "Instituto Geográfico Nacional + OpenStreetMap",
  "host": "https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{-y}.png",
  "legendImg": "src/styles/images/argenmap.png",
  "peso": 10,
  "selected": true,
  "zoom": {
    "min": 3,
    "max": 19,
    "nativeMin": 3,
    "nativeMax": 21
  }
}
```

TMS sources may require `{-y}` instead of `{y}`.

### Separate `sections` and `layers` structure

Sections and layers can be declared separately. This is recommended when
several layers share a heading, tab, description, or visual style:

```jsonc
{
  "items": [
    { "capas": [/* basemaps */] }
  ],
  "sections": [
    {
      "id": "events",
      "nombre": "Events",
      "tab": {
        "id": "IG",
        "searcheable": true,
        "content": "Geospatial information"
      },
      "short_abstract": "Event-related layers"
    }
  ],
  "layers": [
    {
      "type": "file",
      "section": "events",
      "titulo": "Venues",
      "source": {
        "url": "data/venues.geojson",
        "format": "geojson"
      }
    }
  ]
}
```

Every layer must reference an existing section `id`. At startup, section and
layer properties are merged; layer properties take precedence. Basemaps remain
inside `items`.

### Section-specific styles

Use `section_style` to customize only one section and its layer entries:

```jsonc
{
  "id": "events",
  "nombre": "Events",
  "section_style": {
    "container": {
      "backgroundColor": "#ffffff",
      "backgroundImage": "linear-gradient(90deg, #75aadb, #ffffff)",
      "padding": "5px",
      "border": "1px solid #75aadb",
      "borderRadius": "12px"
    },
    "header": {
      "backgroundColor": "#202c5c",
      "backgroundImage": "src/styles/images/banner.webp",
      "backgroundGradient": "linear-gradient(90deg, rgba(0,0,0,.75), rgba(0,0,0,.25))",
      "backgroundSize": "cover",
      "backgroundPosition": "center",
      "backgroundRepeat": "no-repeat",
      "color": "#ffffff",
      "fontFamily": "Encode Sans, sans-serif",
      "fontSize": "20px",
      "fontWeight": "600",
      "fontStyle": "normal",
      "textTransform": "none",
      "letterSpacing": "0",
      "lineHeight": "1.2",
      "textDecoration": "none",
      "borderRadius": "9px",
      "icon": {
        "type": "image",
        "src": "src/styles/images/event.png",
        "alt": "Events",
        "size": "24px"
      }
    },
    "layers": {
      "backgroundColor": "#ffffff",
      "color": "#303030",
      "fontFamily": "Encode Sans, sans-serif",
      "fontSize": "15px",
      "fontWeight": "400",
      "fontStyle": "normal",
      "textTransform": "none",
      "letterSpacing": "0",
      "lineHeight": "1.3",
      "textDecoration": "none"
    }
  }
}
```

Header icons can also use Font Awesome, for example
`{"type":"font-awesome","class":"fas fa-futbol"}`. On mobile screens,
configured font sizes are reduced when necessary to keep the menu readable and
touch targets usable.

### WMS and WMTS query settings

```jsonc
{
  "type": "wms",
  "nombre": "Satellite imagery",
  "seccion": "satellite",
  "servicio": "wms",
  "version": "1.3.0",
  "host": "https://example.gov/geoserver/service/wms",
  "queryable": true,
  "queryActive": false,
  "allowed_layers": ["Center", "North"],
  "customize_layers": {
    "Center": {
      "queryable": true,
      "queryActive": true
    },
    "North": {
      "queryable": false
    }
  }
}
```

- `queryable` allows feature queries. It defaults to `true`.
- `queryActive` enables querying at startup. It defaults to `false`.
- Entries in `customize_layers` override the service defaults for a named
  layer.

Query popups keep the current zoom and center the requested point.

### File-backed layers

File layers can be loaded at startup from local or remote URLs. Supported
formats are those handled by `FileLayer`: `geojson`/`json`, `topojson`, `kml`,
`gpx`, `wkt`, and zipped Shapefiles. The format may be inferred from the URL or
set explicitly with `source.format`.

```jsonc
{
  "type": "file",
  "section": "events",
  "titulo": "Venues",
  "isActive": true,
  "zoomOnActivate": true,
  "queryable": true,
  "queryActive": true,
  "allowedOptions": ["zoom", "query", "data", "download"],
  "source": {
    "url": "data/venues.geojson",
    "format": "geojson",
    "title": "Event venues",
    "description": "Confirmed locations",
    "icon": "src/styles/images/venue.png",
    "style": {
      "activeButtonColor": "#287bb5",
      "marker": {
        "iconUrl": "src/styles/images/venue.png",
        "iconSize": [32, 32],
        "iconAnchor": [16, 32],
        "popupAnchor": [0, -32]
      },
      "point": {
        "radius": 6,
        "color": "#287bb5",
        "weight": 2,
        "fillColor": "#ffffff",
        "fillOpacity": 0.8
      },
      "line": {
        "color": "#287bb5",
        "weight": 3,
        "opacity": 0.9
      },
      "polygon": {
        "color": "#287bb5",
        "weight": 2,
        "fillColor": "#75aadb",
        "fillOpacity": 0.25
      }
    }
  }
}
```

Main settings:

- `isActive` displays the layer at startup; the default is `false`.
- `zoomOnActivate` fits the layer when it is activated.
- `queryable` allows entity queries; the default is `true`.
- `queryActive` enables queries at startup when `queryable` is `true`; the
  default is `false`.
- `allowedOptions` limits the layer submenu. Available values are `zoom`,
  `query`, `data`, `download`, `rename`, and `delete`. If omitted, every
  applicable option is displayed.
- `source.title`, `source.description`, and `source.icon` control the layer
  button.
- `source.style.activeButtonColor` controls the active button background.
- `source.style.marker`, `point`, `line`, and `polygon` set styles by geometry
  type. `MultiPoint`, `MultiLineString`, and `MultiPolygon` are also handled.

`isActive` belongs on the layer object. Query settings, `allowedOptions`, and
`zoomOnActivate` may be declared there or inside `source`; `source` values take
precedence. Add `"query"` to `allowedOptions` to expose the
**Enable/Disable query** command. It is omitted when `queryable` is `false`.

#### HTML in file-layer popups

A GeoJSON property named `html` (case-insensitive) is inserted as HTML in a
full-width popup row. Other property values are escaped and rendered as text:

```jsonc
{
  "type": "Feature",
  "properties": {
    "name": "Main venue",
    "html": "<img src='https://example.gov/image.jpg' alt='Venue'>"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [-58.38, -34.6]
  }
}
```

> [!WARNING]
> The `html` value is intentionally not sanitized. Only use trusted files or
> services.

File popups have a responsive minimum width. Images and other embedded media
are constrained to the available space and approximately half the screen on
desktop. Opening a popup preserves the zoom and centers the queried point. The
layer-options submenu automatically opens toward the available side and stays
inside the visual viewport on desktop, Android, and iOS.

## Application settings (`preferences.json`)

`preferences.json` controls the initial map position, toolbar, search, theme,
logo, enabled extensions, and the startup notification.

### Google Analytics

`analytics_ids` must always be an array. Use a `G-` measurement ID for a GA4
property:

```jsonc
"analytics_ids": ["G-XXXXXXXXXX"]
```

Google tag (`GT-`), Google Ads (`AW-`), and Floodlight (`DC-`) IDs are also
accepted. The application removes duplicates, ignores empty or invalid values,
loads `gtag.js` once, and sends one `config` command per ID. Disable Analytics
with an empty array:

```jsonc
"analytics_ids": []
```

Do not use `""` or a single string. Ad blockers, tracking protection, or a CSP
that disallows `googletagmanager.com`/`google-analytics.com` can prevent data
collection; the application reports a console warning without blocking
startup. Verify the installation with Tag Assistant or the browser's
**Network** panel.

### Versioned startup popup

```jsonc
{
  "mainPopup": {
    "isActive": true,
    "version": "2026-07-20T15:30:00-03:00",
    "welcomeSign": "What's new",
    "image": "src/styles/images/news.webp",
    "text": "New content is now available."
  }
}
```

When the user selects **Do not show again**, the application stores the current
`mainPopup.version` in `localStorage`. Changing the value makes the new message
appear again. The version may be a number, timestamp, ISO date, or descriptive
string. It must remain stable between loads and change only when a new message
is published; generating a new timestamp on every load would always display the
popup.

If `version` is omitted, legacy behavior is preserved: the stored preference
hides all future content until the `mainPopup` local-storage entry is manually
removed.

## Appearance

Additional application-wide styles and images can be placed in:

Custom styles can be added without changing the application's main stylesheet
by declaring them in `preferences.json`:

```json
"customStyles": [
  "src/config/styles/css/theme.css"
]
```

This property is optional. When it is missing or empty, no custom stylesheet is
requested. Declared stylesheets are loaded in parallel after the core styles
and keep precedence over plugin styles loaded later. Each file should contain
only the rules that need to be added or overridden; copying the complete core
stylesheet is not required.

- `src/config/styles/css`: stylesheets declared through `customStyles`.
- `src/config/styles/images`: logos and other images.
- `src/config/styles/images/legends`: layer legend or preview images.

## Validation and troubleshooting

- Validate JSON syntax before reloading the application.
- Check that service, file, icon, and image URLs are accessible.
- Ensure every `layers[].section` references an existing `sections[].id`.
- Use unique section IDs and layer titles.
- Reload the viewer after configuration changes.
