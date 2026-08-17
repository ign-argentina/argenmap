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

### Group several layers under one button

Use `layers_joins` to make one menu button control layers from one or more OGC
services. The first layer identifies the button and every entry in `joins` is
activated or deactivated with it:

```jsonc
{
  "seccion": "imagery",
  "host": "https://example.org/geoserver/imagery",
  "layer": "aerial_mosaic",
  "icon": "src/config/styles/images/legends/grouped-imagery.svg",
  "joins": [
    {
      "seccion": "boundaries",
      "host": "https://example.org/geoserver/boundaries/wms",
      "layer": "flight_boundaries"
    }
  ]
}
```

`icon` accepts a local path or URL and takes precedence over the primary
layer's service icon or legend for the menu button only. It does not replace
the OGC legend metadata used by other tools such as printing. When omitted,
`src/styles/images/layers-group.svg` is used to make the grouping explicit.
The icon path never depends on the visible title or its special characters.

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
      "expanded": true,
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
      "id": "event-venues",
      "type": "file",
      "section": "events",
      "title": "Venues",
      "description": "Confirmed locations",
      "source": {
        "url": "data/venues.geojson",
        "format": "geojson"
      }
    }
  ]
}
```

Every layer must reference an existing section `id`. The two blocks have
independent responsibilities and are not combined through property overrides:

- `sections` exclusively defines menu headings and organization: `id`,
  `nombre`, `expanded`, `tab`, `short_abstract`, `peso`, `class`, and
  `section_style`.
- `layers` exclusively defines each source or layer: `id`, `type`, `section`,
  `title`, `description`, `icon`, state, options, styles, and connection data.
- Service options such as `host`, `icons`, `allowed_layers`, and
  `customize_layers` belong to their `layers` entry, not to the section.
- For a file-backed layer, `source` only describes the resource being read,
  such as `url` and `format`; presentation belongs to the layer.

Changing `title`, `id`, or another layer property does not change its section
heading or style. Basemaps remain inside `items`. Legacy configurations may
still use `titulo` and visual properties inside `source`, but those aliases are
not recommended in the separated schema.

The boolean `expanded` property displays a section expanded when the
application starts. It defaults to `false`. If the section contains lazily
loaded OGC services, setting it to `true` starts loading those services so its
content can be displayed.

The contextual menu at the right of every section heading needs no additional
configuration. It can enable or disable all layers, pin the section to the top,
fit the combined layer bounds, toggle querying, and change group opacity.
Actions that depend on OGC metadata load that section's capabilities document
on demand, as expanding the section does; unused section services are not
requested during startup.

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
  "id": "event-venues",
  "type": "file",
  "section": "events",
  "title": "Event venues",
  "description": "Confirmed locations",
  "icon": "src/styles/images/venue.png",
  "isActive": true,
  "zoomOnActivate": true,
  "queryable": true,
  "queryActive": true,
  "editable": true,
  "popupFormat": "table",
  "allowedOptions": ["zoom", "query", "edit", "data", "download"],
  "activeButtonColor": "#287bb5",
  "style": {
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
  },
  "source": {
    "url": "data/venues.geojson",
    "format": "geojson"
  }
}
```

Main settings:

- `id` is the layer's stable unique identifier.
- `section` references a section `id`; it does not define the visible heading.
- `title`, `description`, and `icon` control the layer button without changing
  the section heading.
- `isActive` displays the layer at startup; the default is `false`.
- `zoomOnActivate` fits the layer when it is activated.
- `queryable` allows entity queries; the default is `true`.
- `queryActive` enables queries at startup when `queryable` is `true`; the
  default is `false`.
- `editable` sets the initial style and geometry editing state. It defaults to
  `true`. When set to `false`, **Edit styles** is disabled and Leaflet.Draw
  skips every feature in the layer until editing is enabled from its submenu.
- `popupFormat` controls queried content rendering. It accepts `table`, `text`,
  and `html`; when omitted, tables are used except for a sole `html` property.
- `allowedOptions` limits the layer submenu. Available values are `zoom`,
  `query`, `edit`, `data`, `download`, `rename`, and `delete`. If omitted,
  every applicable option is displayed.
- `activeButtonColor` controls the active button background without becoming
  part of the exported geometry style.
- `style.marker`, `point`, `line`, and `polygon` set styles by geometry
  type. `MultiPoint`, `MultiLineString`, and `MultiPolygon` are also handled.
- `style.label` defines an optional label from one or more feature properties
  and applies to every geometry type in the layer.

In the separated schema, presentation and behavior properties belong to the
layer block. `source` contains the file location and format. Their previous
locations inside `source` remain compatibility fallbacks; when a property is
also present on the layer, the layer value takes precedence. Add `"query"` to
`allowedOptions` to expose the
**Enable/Disable query** command. It is omitted when `queryable` is `false`.

The `"edit"` option adds **Enable/Disable editing** to that same submenu. The
change applies to every feature in the layer and controls both **Edit styles**
and geometry selection by the Leaflet.Draw editing tools. It only affects the
current session and does not rewrite `data.json`:

```jsonc
{
  "type": "file",
  "editable": false,
  "allowedOptions": ["zoom", "query", "edit", "download"]
}
```

#### Per-feature or per-geometry styles

Each GeoJSON `Feature` may define its own style through `properties.styles`.
This is the same object generated by the context menu's **Edit styles** command,
and it is also applied to files opened manually:

```jsonc
{
  "type": "Feature",
  "properties": {
    "name": "Northern route",
    "type": "polyline",
    "styles": {
      "color": "#9e161a",
      "weight": 5,
      "opacity": 0.9,
      "dashArray": 8
    }
  },
  "geometry": {
    "type": "LineString",
    "coordinates": [[-69.8, -32.9], [-70.1, -33.2]]
  }
}
```

`styles` values apply only to that feature and override the layer-wide style.
The precedence order is: application defaults, the layer's `style`, and the
feature's `properties.styles`. Supported values include those saved by the
editor, such as `color`, `weight`, `opacity`, `fillColor`, `fillOpacity`,
`dashArray`, `radius`, and marker options.

#### Geometry labels

The `style.label` block builds a label by concatenating an ordered `parts`
list. Each part uses `"type": "field"` to read a feature property or
`"type": "text"` to insert its value literally:

```jsonc
{
  "style": {
    "line": {
      "color": "#9e161a",
      "weight": 4
    },
    "label": {
      "enabled": true,
      "parts": [
        { "type": "field", "value": "column" },
        { "type": "text", "value": " — " },
        { "type": "field", "value": "commander" },
        { "type": "text", "value": " (distance: " },
        { "type": "field", "value": "distance_km" },
        { "type": "text", "value": " km)" }
      ],
      "position": "above",
      "color": "#421014",
      "fontFamily": "Noto Sans, sans-serif",
      "fontSize": 14,
      "fontStyle": "italic",
      "underline": false,
      "uppercase": false,
      "halo": true,
      "haloColor": "#ffffff",
      "haloWidth": 2,
      "autoHide": true,
      "minZoom": 7,
      "maxZoom": 18
    }
  }
}
```

Available positions depend on geometry type:

- Points, markers, and circles: `top`, `bottom`, `left`, or `right`.
- Lines: `above`, `on-line`, or `below`; the upper and lower variants keep a
  fixed distance from the path.
- Polygons and rectangles: `center`, `border`, or `parallel`.

Labels on lines and borders are oriented automatically so text remains
readable even when the path was drawn in the opposite direction. With
`autoHide` enabled (the default), they are also hidden automatically when the
text does not fit the visible path with a safe margin or when that portion of
the path bends too sharply. This is recalculated after each zoom change, so a
label reappears when zooming in provides enough room. Set `"autoHide": false`
to disable this fit check.

`minZoom` and `maxZoom` optionally limit the Leaflet zoom levels at which any
label is displayed. Either value can be omitted to leave that end unbounded.

`fontStyle` accepts `normal` or `italic`; `underline` and `uppercase` are
booleans. `halo` enables a text outline controlled by `haloColor` and
`haloWidth`. When a `label` block exists, it is enabled unless
`"enabled": false` is set.

The legacy `fields` and `separator` properties remain supported. Opening an
older configuration in the editor converts it to ordered parts, which can then
be combined with fixed strings, for example
`[{"type":"field","value":"height"},{"type":"text","value":" m"}]`.

The **Geometry label** section in **Edit styles** exposes the same options. It
provides controls to add fields or text, reorder them, and remove them. The
editor also exposes minimum and maximum zoom and whether automatic fitting
should hide poorly distributed text. The configuration controls remain hidden
until **Show label** is enabled. It works for file features, vector layers, and
geometries made with the drawing tools. Changes are saved to
`properties.styles.label` when the feature or layer is downloaded.

When a layer is downloaded from its menu, each feature exports its current
visual options in `styles`. Changes made with **Edit styles** therefore replace
the style with which that feature was originally loaded in the downloaded file.

The internal `type` property preserves the subtype created by the application,
such as `marker`, `circle`, `circlemarker`, `rectangle`, or `label`. Both `type`
and `styles` are used to reconstruct the geometry but are always omitted from
query popup content.

#### File-layer popup format

The default `popupFormat` is `table`, with one row per property. `text` renders
the same values without a table or surrounding box: each property name is bold,
starts with an uppercase letter, and uses spaces instead of underscores,
followed by its normal-weight value. When a GeoJSON feature has a single
property named `html` (case-insensitive), its value is rendered as HTML
automatically or when `"popupFormat": "html"` is configured:

```jsonc
{
  "type": "Feature",
  "properties": {
    "html": "<img src='https://example.gov/image.jpg' alt='Venue'>"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [-58.38, -34.6]
  }
}
```

For safety, `html` is interpreted only when it is the sole property. Features
with additional attributes fall back to a table and show the markup escaped.
Explicitly selecting `table` or `text` also disables HTML interpretation. The
reserved `styles` and `type` metadata do not count as visible attributes for
this rule because they are never displayed.

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
    "welcomeSignStyle": {
      "fontSize": "0.9rem",
      "color": "#ffffff",
      "textAlign": "center",
      "direction": "auto",
      "position": "above"
    },
    "image": "src/styles/images/news.webp",
    "text": "New content is now available.",
    "background": "transparent",
    "overlayBackground": "rgba(0, 0, 0, 0.6)"
  }
}
```

`mainPopup.background` accepts any valid CSS `background` value, including
`"transparent"`, a solid color such as `"#13213c"`, or a gradient such as
`"linear-gradient(135deg, #13213c, #157db9)"`. The card is transparent when the
option is omitted. `mainPopup.overlayBackground` independently controls the
background covering the application and keeps the semi-transparent shade when
omitted.

`mainPopup.welcomeSignStyle` customizes the welcome text without requiring a
global stylesheet. By default the text is smaller, centered, and placed above
the image. `fontSize` accepts a CSS size (`"14px"`, `"0.9rem"`, `"clamp(...)"`)
or a number, which is interpreted as pixels. `position` accepts `"above"` or
`"below"`, while `direction` accepts `"auto"`, `"ltr"`, or `"rtl"` for future
language-specific content.

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
