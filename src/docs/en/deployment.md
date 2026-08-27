## Requirements

- Web server (Nginx, Apache, lighttpd, etc.)

## Fast deployment guide

### 1st step: download code

Clone the repository or download as a ZIP file:

To clone, use the following command (it requires to have Git installed):

```
git clone https://github.com/ign-argentina/argenmap.git
```

Or download the repository from: 

https://github.com/ign-argentina/argenmap/archive/master.zip

### 2nd step: set the configuration 

The base maps and layers can be defined in the `data.json` and the app configuration in `preferences.json`.

> Changes on 'data' will be loaded after reloading the app as happens with any web page.

This step is detailed in the **[Configuration](configuration.md)** article.

### 3rd step: create and publish a production build

Node.js 20 or newer is required to create the optimized, installable PWA build:

```bash
npm ci
npm run build
```

To resolve the version automatically from the branch, run:

```bash
npm run build:versioned
```

On `develop` and other non-release branches it generates a
`develop-<commit>` version. On `master`, `hotfix` and `release`, it first looks
for a semantic tag (`vMAJOR.MINOR.PATCH`) on the current commit. If none
exists, it asks for `major`, `minor` or `patch`, calculates the next tag using
`git tag -l --sort=-v:refname`, creates it and builds with that version. Push a
created tag explicitly, for example `git push origin v1.27.1`.

The basic `npm run build` command remains available when `ARGENMAP_VERSION`
needs to be provided manually.

The release version can be set explicitly with `ARGENMAP_VERSION`. For a
release associated with a `master` tag:

```bash
ARGENMAP_VERSION=v1.2.3 npm run build
```

For a development build, include the branch and commit:

```bash
ARGENMAP_VERSION=develop-$(git rev-parse --short HEAD) npm run build
```

CI also detects GitLab tags and GitHub/GitLab branch names combined with their
short commit, such as `develop-a1b2c3d4e5f6`. If no version is provided, it is
derived from the published contents.

### Result by branch

| Branch | Command | Resulting version | Creates a tag? |
| --- | --- | --- | --- |
| `master` | `npm run build:versioned` | `vMAJOR.MINOR.PATCH` | Yes, if `HEAD` has no semantic tag |
| `hotfix/*` | `npm run build:versioned` | Next `vMAJOR.MINOR.PATCH` | Yes, if `HEAD` has no semantic tag |
| `release/*` | `npm run build:versioned` | Next `vMAJOR.MINOR.PATCH` | Yes, if `HEAD` has no semantic tag |
| `develop` | `npm run build:versioned` | `develop-<commit>` | No |
| Branch derived from `develop` | `npm run build:versioned` | `develop-<commit>` | No |
| Any branch | `npm run build` | Explicit, CI, or `content-<hash>` version | No |

On release branches, if the current commit has no tag, the command asks for
`major`, `minor` or `patch`, creates the tag locally, and continues the build.
Push the tag after checking the result:

```bash
git push origin v1.27.4
```

To deploy the result:

1. Run the selected command from the repository root.
2. Check `build/build-manifest.json` and confirm the version in
	`build/index.html`.
3. Publish **all contents of `build/`** as the site root, replacing the
	previous publication in one operation.
4. Ensure `index.html`, `service-worker.js`, `manifest.webmanifest` and
	configuration files do not have persistent HTTP caching.
5. Open the site online and accept **Update** when a new-version notice appears.

Do not publish only the bundle or only the service worker: they must come from
the same build to prevent code, styles and plugins from different releases from
being mixed.

Publish the **contents of `build/`** as the viewer root. The runtime is compiled
as a real ES module with tree shaking and identifier minification, with an
explicit global bridge for code that has not been migrated yet. Startup
JavaScript is split into stable runtime, foundation, entities, and application
chunks so unchanged chunks can be reused between releases. Internal identifiers
in classic scripts are minified without renaming their global compatibility
APIs. The directory includes the Web App Manifest, versioned bundles and
generated service worker. Do not edit it manually because every build recreates
it.

Production must be served over HTTPS; `localhost` is the only exception intended
for local testing. The source development page does not register a service
worker, so cached production resources cannot interfere with debugging.

The PWA stores its critical shell (`index.html`, bundles, configuration, and
fallback image) when the service worker installs. Auxiliary PWA assets are added
in a second idle stage so they do not compete with startup. Both groups use the
same versioned cache, while local configuration remains network-first with an
offline fallback. Remote map tiles, WMS/WMTS requests, `GetCapabilities`,
`GetFeatureInfo`, authentication and geoprocesses remain network-only. Installing
the PWA therefore does not turn remote maps into offline map packages.

After deploying a new build, Argenmap presents an update notice and activates the
new service worker only when the user chooses **Update**.

When the browser offers installation, an **Install Argenmap** button appears at
the end of the side toolbar. Chromium browsers open their native prompt. On
iPhone/iPad and mobile browsers without that API, the button provides Share or
browser-menu instructions. It is hidden while the installed app runs.

See [PWA tests on real devices](pwa-testing.md) for the Android/iOS validation
matrix.

Configure the web server with equivalent cache headers:

```text
/service-worker.js                 Cache-Control: no-cache
/index.html                        Cache-Control: no-cache
/manifest.webmanifest              Cache-Control: no-cache
/src/config/*.json                 Cache-Control: no-cache
/assets/js/*.[hash].min.js         Cache-Control: public, max-age=31536000, immutable
/src/styles/css/*.[hash].min.css   Cache-Control: public, max-age=31536000, immutable
/src/js/**/*.js?v=*                Cache-Control: public, max-age=31536000, immutable
/src/js/**/*.css?v=*               Cache-Control: public, max-age=31536000, immutable
```

The build generates `.br` and `.gz` versions of every startup JavaScript chunk
and the main CSS file. They are listed under `assets.encodings` in
`build-manifest.json`, allowing the server to send precompressed content without
spending CPU on each request.

For **Apache**, the build copies a ready-to-use `.htaccess` to its root. It
requires Apache 2.4 with `AllowOverride FileInfo`, uses Brotli when `mod_brotli`
is enabled, and falls back to gzip through `mod_deflate`. It also applies the
`no-cache` and `immutable` policies above.

For **Nginx**, use
[`deploy/nginx/argenmap.conf.example`](../../../deploy/nginx/argenmap.conf.example)
as a template, adjust `server_name` and `root`, then validate before reloading:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

The template enables `gzip_static` for the generated `.gz` files. If the Nginx
Brotli module is installed, uncomment its four directives to prefer `.br`.

After deployment, test one path listed in `assets.javascript` inside
`build-manifest.json`:

```bash
curl -I -H 'Accept-Encoding: br, gzip' https://example/argenmap/assets/js/argenmap-runtime.HASH.min.js
```

The response should include `Content-Encoding: br` or `gzip`, `Vary:
Accept-Encoding`, and `Cache-Control: public, max-age=31536000, immutable` for
the hashed asset.

Deploy all files in `build/` atomically. Every build derives its PWA cache version
from the full published contents, including configuration and deferred plugins.

### Development publication

Publish this repository with a web server or a debug tool as LiveServer in Visual Studio Code, etc.

## Next: [Configuration](configuration.md)
