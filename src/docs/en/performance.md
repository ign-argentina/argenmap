# Reproducible performance measurements

The repository includes a Chromium-based tool that compares Argenmap startup
with a cold and warm cache in the same browser session. It records:

* `DOMContentLoaded` from navigation start;
* the `argenmap:map-ready` event;
* encoded bytes transferred by requests started no later than that event;
* long-task count, total duration, and maximum duration through the Long Tasks
  API.

## Measure the local build

Node.js 20 or newer and Chrome/Chromium are required:

```bash
npm run build
npm run measure:performance -- --output performance-report.json
```

The command temporarily serves `build/` with the documented cache headers and
uses its pre-generated Brotli or gzip files, so the byte count represents the
compressed transfer. It is not intended to be a production server.

Every run performs these steps:

1. navigates away from the site and clears the HTTP cache, service workers,
   Cache Storage, and other origin data;
2. measures a cold-cache load;
3. leaves the page open during the warmup period so deferred service-worker and
   secondary-cache work can finish;
4. navigates again without clearing browser state and measures a warm-cache
   load.

The summary uses the median. The JSON report retains every sample, the selected
options, and the Node, Chrome, and diagnostic-protocol versions.

## Measure a deployment

```bash
npm run measure:performance -- \
  --url https://example/argenmap/index.html \
  --runs 5 \
  --output performance-production.json
```

Main options:

| Option | Default | Usage |
| --- | ---: | --- |
| `--runs` | `3` | Number of cold/warm pairs. |
| `--timeout` | `60000` | Maximum milliseconds to wait for map ready. |
| `--warmup` | `8000` | Wait between the cold and warm measurements. |
| `--settle` | `1500` | Wait for requests started before map ready to finish. |
| `--chrome` | automatic detection | Chrome or Chromium path. `CHROME_BIN` is also supported. |
| `--output` | none | JSON file for the complete report. |

Use `--no-sandbox` only in trusted CI or containers where Chromium cannot start
its sandbox, and never combine it with an untrusted URL.
`--ignore-certificate-errors` is only for test environments with intercepted
certificates.

## Compare results

Compare reports produced on the same machine, Chrome version, viewport,
Argenmap configuration, and network conditions. External CDNs and map tiles add
variance, so several runs and their median are more useful than one sample.
Requests and long tasks are filtered at the `map-ready` boundary; `--settle`
only lets requests that started before that boundary finish.
