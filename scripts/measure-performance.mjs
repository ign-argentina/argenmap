import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { StringDecoder } from "node:string_decoder";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "..");
const defaultBuildDirectory = path.join(projectDirectory, "build");
const MAP_READY_EVENT = "argenmap:map-ready";

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".otf", "font/otf"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".ttf", "font/ttf"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

function usage() {
  return `Uso: npm run measure:performance -- [opciones]

Opciones:
  --url URL                       Mide una publicación existente en vez de build/.
  --runs N                        Pares fría/caliente (por defecto: 3).
  --timeout MS                    Espera máxima para mapa listo (por defecto: 60000).
  --warmup MS                     Espera entre pasada fría y caliente (por defecto: 8000).
  --settle MS                     Espera para completar requests iniciados antes del mapa (por defecto: 1500).
  --output ARCHIVO                Guarda el informe completo como JSON.
  --chrome RUTA                   Ejecutable de Chrome/Chromium.
  --no-sandbox                    Desactiva el sandbox de Chrome (sólo CI/contenedores confiables).
  --ignore-certificate-errors     Sólo para entornos de prueba con certificados interceptados.
  --help                          Muestra esta ayuda.
`;
}

function readValue(argv, index, option) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Falta el valor de ${option}.`);
  }
  return value;
}

function positiveInteger(value, option, { allowZero = false } = {}) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < (allowZero ? 0 : 1)) {
    throw new Error(`${option} debe ser un numero entero ${allowZero ? "no negativo" : "positivo"}.`);
  }
  return parsed;
}

function parseArguments(argv) {
  const options = {
    runs: 3,
    timeoutMs: 60_000,
    warmupMs: 8_000,
    settleMs: 1_500,
    noSandbox: false,
    ignoreCertificateErrors: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    switch (argument) {
      case "--url":
        options.url = readValue(argv, index, argument);
        index += 1;
        break;
      case "--runs":
        options.runs = positiveInteger(readValue(argv, index, argument), argument);
        index += 1;
        break;
      case "--timeout":
        options.timeoutMs = positiveInteger(
          readValue(argv, index, argument),
          argument,
        );
        index += 1;
        break;
      case "--warmup":
        options.warmupMs = positiveInteger(
          readValue(argv, index, argument),
          argument,
          { allowZero: true },
        );
        index += 1;
        break;
      case "--settle":
        options.settleMs = positiveInteger(
          readValue(argv, index, argument),
          argument,
          { allowZero: true },
        );
        index += 1;
        break;
      case "--output":
        options.output = readValue(argv, index, argument);
        index += 1;
        break;
      case "--chrome":
        options.chrome = readValue(argv, index, argument);
        index += 1;
        break;
      case "--no-sandbox":
        options.noSandbox = true;
        break;
      case "--ignore-certificate-errors":
        options.ignoreCertificateErrors = true;
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      default:
        throw new Error(`Opcion desconocida: ${argument}`);
    }
  }

  return options;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function cacheControlFor(pathname, searchParams) {
  if (
    pathname === "/index.html" ||
    pathname === "/service-worker.js" ||
    pathname === "/manifest.webmanifest" ||
    /^\/src\/config\/.*\.json$/u.test(pathname)
  ) {
    return "no-cache";
  }
  if (
    /\.[0-9a-f]{12}\.min\.(?:js|css)$/iu.test(pathname) ||
    (searchParams.has("v") && /^\/src\/js\/.*\.(?:js|css)$/iu.test(pathname))
  ) {
    return "public, max-age=31536000, immutable";
  }
  return "public, max-age=3600";
}

async function startBuildServer(buildDirectory) {
  const root = path.resolve(buildDirectory);
  if (!(await exists(path.join(root, "index.html")))) {
    throw new Error(
      `No existe ${path.join(root, "index.html")}. Ejecuta primero npm run build.`,
    );
  }

  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url || "/", "http://localhost");
      const pathname = decodeURIComponent(requestUrl.pathname);
      const relativePath = pathname === "/" ? "index.html" : `.${pathname}`;
      const sourcePath = path.resolve(root, relativePath);
      if (sourcePath !== root && !sourcePath.startsWith(`${root}${path.sep}`)) {
        response.writeHead(403).end("Forbidden");
        return;
      }

      const sourceStats = await stat(sourcePath).catch(() => null);
      if (!sourceStats?.isFile()) {
        response.writeHead(404).end("Not found");
        return;
      }

      const acceptedEncodings = request.headers["accept-encoding"] || "";
      let responsePath = sourcePath;
      let contentEncoding;
      if (/\bbr\b/u.test(acceptedEncodings) && (await exists(`${sourcePath}.br`))) {
        responsePath = `${sourcePath}.br`;
        contentEncoding = "br";
      } else if (
        /\bgzip\b/u.test(acceptedEncodings) &&
        (await exists(`${sourcePath}.gz`))
      ) {
        responsePath = `${sourcePath}.gz`;
        contentEncoding = "gzip";
      }

      const [content, responseStats] = await Promise.all([
        readFile(responsePath),
        stat(responsePath),
      ]);
      const headers = {
        "Cache-Control": cacheControlFor(pathname, requestUrl.searchParams),
        "Content-Length": responseStats.size,
        "Content-Type":
          contentTypes.get(path.extname(sourcePath).toLowerCase()) ||
          "application/octet-stream",
        "Last-Modified": responseStats.mtime.toUTCString(),
      };
      if (contentEncoding) {
        headers["Content-Encoding"] = contentEncoding;
        headers.Vary = "Accept-Encoding";
      }
      response.writeHead(200, headers);
      response.end(request.method === "HEAD" ? undefined : content);
    } catch (error) {
      response.writeHead(500).end(error.message);
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  return {
    url: `http://127.0.0.1:${address.port}/index.html`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

function findChrome(explicitPath) {
  const candidates = [
    explicitPath,
    process.env.CHROME_BIN,
    "google-chrome",
    "google-chrome-stable",
    "chromium",
    "chromium-browser",
  ].filter(Boolean);

  for (const candidate of candidates) {
    const result = spawnSync(candidate, ["--version"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    if (!result.error && result.status === 0) {
      return { executable: candidate, version: result.stdout.trim() };
    }
  }
  throw new Error(
    "No se encontro Chrome/Chromium. Usa --chrome o define CHROME_BIN.",
  );
}

class CdpConnection {
  constructor(writer, reader) {
    this.writer = writer;
    this.reader = reader;
    this.decoder = new StringDecoder("utf8");
    this.buffer = "";
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Set();

    reader.on("data", (chunk) => this.handleData(chunk));
    reader.on("error", (error) => this.fail(error));
    reader.on("end", () => this.fail(new Error("Chrome cerro el canal CDP.")));
    writer.on("error", (error) => this.fail(error));
  }

  handleData(chunk) {
    if (process.env.ARGENMAP_CDP_DEBUG === "1") {
      process.stderr.write(`[CDP read ${chunk.length} bytes]\n`);
    }
    this.buffer += this.decoder.write(chunk);
    let separator = this.buffer.indexOf("\0");
    while (separator !== -1) {
      const rawMessage = this.buffer.slice(0, separator);
      this.buffer = this.buffer.slice(separator + 1);
      if (rawMessage) {
        this.handleMessage(JSON.parse(rawMessage));
      }
      separator = this.buffer.indexOf("\0");
    }
  }

  handleMessage(message) {
    if (message.id) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      clearTimeout(pending.timer);
      if (message.error) {
        pending.reject(
          new Error(`${pending.method}: ${message.error.message}`),
        );
      } else {
        pending.resolve(message.result || {});
      }
      return;
    }
    for (const listener of this.listeners) {
      listener(message);
    }
  }

  send(method, params = {}, sessionId, timeoutMs = 60_000) {
    const id = this.nextId;
    this.nextId += 1;
    const message = { id, method, params };
    if (sessionId) message.sessionId = sessionId;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timeout esperando la respuesta CDP de ${method}.`));
      }, timeoutMs);
      this.pending.set(id, { method, resolve, reject, timer });
      if (process.env.ARGENMAP_CDP_DEBUG === "1") {
        process.stderr.write(`[CDP write ${method}]\n`);
      }
      this.writer.write(`${JSON.stringify(message)}\0`, (error) => {
        if (error) {
          this.pending.delete(id);
          clearTimeout(timer);
          reject(error);
        }
      });
    });
  }

  onEvent(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  waitForEvent(method, sessionId, timeoutMs) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        unsubscribe();
        reject(new Error(`Timeout esperando ${method}.`));
      }, timeoutMs);
      const unsubscribe = this.onEvent((message) => {
        if (message.method !== method || message.sessionId !== sessionId) return;
        clearTimeout(timer);
        unsubscribe();
        resolve(message.params || {});
      });
    });
  }

  fail(error) {
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(error);
    }
    this.pending.clear();
  }
}

async function launchChrome(options) {
  const chrome = findChrome(options.chrome);
  const profileDirectory = await mkdtemp(
    path.join(tmpdir(), "argenmap-performance-"),
  );
  const args = [
    "--headless=new",
    "--remote-debugging-pipe",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-default-apps",
    "--disable-dev-shm-usage",
    "--disable-extensions",
    "--disable-gpu",
    "--disable-sync",
    "--metrics-recording-only",
    "--no-first-run",
    "--window-size=1440,900",
    `--user-data-dir=${profileDirectory}`,
  ];
  if (options.noSandbox || (process.getuid && process.getuid() === 0)) {
    args.push("--no-sandbox");
  }
  if (options.ignoreCertificateErrors) {
    args.push("--ignore-certificate-errors");
  }

  const child = spawn(chrome.executable, args, {
    stdio: ["ignore", "ignore", "pipe", "pipe", "pipe"],
  });
  const stderr = [];
  child.stderr.on("data", (chunk) => {
    stderr.push(chunk.toString("utf8"));
    if (stderr.length > 20) stderr.shift();
  });
  const connection = new CdpConnection(child.stdio[3], child.stdio[4]);
  child.once("error", (error) => connection.fail(error));
  child.once("exit", (code) => {
    if (code && connection.pending.size > 0) {
      connection.fail(
        new Error(`Chrome termino con codigo ${code}.\n${stderr.join("")}`),
      );
    }
  });

  return {
    chrome,
    connection,
    close: async () => {
      if (child.exitCode === null) {
        child.kill("SIGTERM");
        await new Promise((resolve) => {
          const timer = setTimeout(resolve, 3_000);
          child.once("exit", () => {
            clearTimeout(timer);
            resolve();
          });
        });
      }
      if (child.exitCode === null) child.kill("SIGKILL");
      await rm(profileDirectory, { recursive: true, force: true });
    },
  };
}

class NetworkTracker {
  constructor(connection, sessionId) {
    this.sessionId = sessionId;
    this.records = [];
    this.currentById = new Map();
    this.active = false;
    this.unsubscribe = connection.onEvent((message) => this.onEvent(message));
  }

  start() {
    this.records = [];
    this.currentById.clear();
    this.active = true;
  }

  onEvent(message) {
    if (!this.active || message.sessionId !== this.sessionId) return;
    const { method, params } = message;
    if (method === "Network.requestWillBeSent") {
      if (params.redirectResponse) {
        const redirected = this.currentById.get(params.requestId);
        if (redirected) {
          redirected.encodedBytes = params.redirectResponse.encodedDataLength || 0;
          redirected.finished = true;
        }
      }
      const record = {
        id: params.requestId,
        url: params.request.url,
        startTimestamp: params.timestamp,
        dataBytes: 0,
        responseBytes: 0,
        encodedBytes: 0,
        finished: false,
        cached: false,
      };
      this.records.push(record);
      this.currentById.set(params.requestId, record);
      return;
    }
    const record = this.currentById.get(params.requestId);
    if (!record) return;
    if (method === "Network.requestServedFromCache") {
      record.cached = true;
    } else if (method === "Network.responseReceived") {
      record.responseBytes = params.response.encodedDataLength || 0;
      record.cached =
        record.cached ||
        params.response.fromDiskCache === true ||
        params.response.fromPrefetchCache === true ||
        params.response.fromServiceWorker === true;
    } else if (method === "Network.dataReceived") {
      record.dataBytes += params.encodedDataLength || 0;
    } else if (method === "Network.loadingFinished") {
      record.encodedBytes = params.encodedDataLength || 0;
      record.finished = true;
    } else if (method === "Network.loadingFailed") {
      record.finished = true;
    }
  }

  summarize(cutoffTimestamp) {
    this.active = false;
    const relevant = this.records.filter(
      (record) => record.startTimestamp <= cutoffTimestamp,
    );
    return {
      transferredBytes: Math.round(
        relevant.reduce(
          (total, record) =>
            total +
            (record.finished
              ? record.encodedBytes
              : record.responseBytes + record.dataBytes),
          0,
        ),
      ),
      requestCount: relevant.length,
      cacheHitCount: relevant.filter((record) => record.cached).length,
      incompleteRequestCount: relevant.filter((record) => !record.finished).length,
    };
  }

  close() {
    this.unsubscribe();
  }
}

const collectorSource = `(() => {
  const state = { mapReady: null, longTasks: [], longTaskSupported: false };
  Object.defineProperty(globalThis, "__argenmapPerformance", {
    value: state,
    configurable: true,
  });
  const markMapReady = () => {
    if (state.mapReady === null) state.mapReady = performance.now();
  };
  window.addEventListener(${JSON.stringify(MAP_READY_EVENT)}, markMapReady, { once: true });
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        state.longTasks.push({ startTime: entry.startTime, duration: entry.duration });
      }
    });
    observer.observe({ type: "longtask", buffered: true });
    state.longTaskSupported = true;
  } catch {}
})();`;

async function navigate(connection, sessionId, url, timeoutMs) {
  const domContentLoaded = connection.waitForEvent(
    "Page.domContentEventFired",
    sessionId,
    timeoutMs,
  );
  const result = await connection.send("Page.navigate", { url }, sessionId);
  if (result.errorText) {
    throw new Error(`No se pudo navegar a ${url}: ${result.errorText}`);
  }
  await domContentLoaded;
}

async function evaluate(
  connection,
  sessionId,
  expression,
  timeoutMs = 15_000,
) {
  const result = await connection.send(
    "Runtime.evaluate",
    {
      expression,
      awaitPromise: true,
      returnByValue: true,
    },
    sessionId,
    timeoutMs,
  );
  if (result.exceptionDetails) {
    throw new Error(
      result.exceptionDetails.exception?.description ||
        result.exceptionDetails.text ||
        "Error evaluando metricas en la pagina.",
    );
  }
  return result.result?.value;
}

async function collectPageMetrics(connection, sessionId, timeoutMs) {
  return evaluate(
    connection,
    sessionId,
    `(async () => {
      const state = globalThis.__argenmapPerformance;
      const timeout = ${timeoutMs};
      const started = performance.now();
      while (state?.mapReady === null &&
             document.documentElement.dataset.argenmapMapReady !== "true") {
        if (performance.now() - started > timeout) {
          throw new Error("Timeout esperando ${MAP_READY_EVENT}.");
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      if (state.mapReady === null) state.mapReady = performance.now();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const navigation = performance.getEntriesByType("navigation")[0];
      const longTasks = state.longTasks.filter(
        (entry) => entry.startTime <= state.mapReady,
      );
      return {
        domContentLoadedMs: navigation.domContentLoadedEventEnd,
        mapReadyMs: state.mapReady,
        nowMs: performance.now(),
        longTaskSupported: state.longTaskSupported,
        longTasks,
      };
    })()`,
    timeoutMs + 5_000,
  );
}

function metricTimestamp(metrics, name) {
  return metrics.metrics.find((metric) => metric.name === name)?.value;
}

async function measureNavigation(context, scenario, run) {
  const { connection, sessionId, tracker, options, targetUrl } = context;
  tracker.start();
  await navigate(connection, sessionId, targetUrl, options.timeoutMs);
  const pageMetrics = await collectPageMetrics(
    connection,
    sessionId,
    options.timeoutMs,
  );
  const performanceMetrics = await connection.send(
    "Performance.getMetrics",
    {},
    sessionId,
  );
  const currentTimestamp = metricTimestamp(performanceMetrics, "Timestamp");
  if (!currentTimestamp) {
    throw new Error("Chrome no devolvio el reloj monotono de Performance.");
  }
  const cutoffTimestamp =
    currentTimestamp - (pageMetrics.nowMs - pageMetrics.mapReadyMs) / 1000;
  await new Promise((resolve) => setTimeout(resolve, options.settleMs));
  const network = tracker.summarize(cutoffTimestamp);
  const durations = pageMetrics.longTasks.map((entry) => entry.duration);

  return {
    scenario,
    run,
    domContentLoadedMs: Number(pageMetrics.domContentLoadedMs.toFixed(1)),
    mapReadyMs: Number(pageMetrics.mapReadyMs.toFixed(1)),
    transferredBytes: network.transferredBytes,
    requestCount: network.requestCount,
    cacheHitCount: network.cacheHitCount,
    incompleteRequestCount: network.incompleteRequestCount,
    longTasks: {
      supported: pageMetrics.longTaskSupported,
      count: durations.length,
      totalDurationMs: Number(
        durations.reduce((total, duration) => total + duration, 0).toFixed(1),
      ),
      maxDurationMs: Number(Math.max(0, ...durations).toFixed(1)),
    },
  };
}

async function clearBrowserState(context) {
  const { connection, sessionId, origin, options } = context;
  await navigate(connection, sessionId, "about:blank", options.timeoutMs);
  await connection.send("Network.clearBrowserCache", {}, sessionId);
  await connection.send(
    "Storage.clearDataForOrigin",
    { origin, storageTypes: "all" },
    sessionId,
  );
  await connection
    .send("ServiceWorker.stopAllWorkers", {}, sessionId)
    .catch(() => undefined);
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function summarizeRuns(runs, scenario) {
  const selected = runs.filter((run) => run.scenario === scenario);
  return {
    domContentLoadedMs: Number(
      median(selected.map((run) => run.domContentLoadedMs)).toFixed(1),
    ),
    mapReadyMs: Number(
      median(selected.map((run) => run.mapReadyMs)).toFixed(1),
    ),
    transferredBytes: Math.round(
      median(selected.map((run) => run.transferredBytes)),
    ),
    longTaskCount: Number(
      median(selected.map((run) => run.longTasks.count)).toFixed(1),
    ),
    longTaskTotalDurationMs: Number(
      median(selected.map((run) => run.longTasks.totalDurationMs)).toFixed(1),
    ),
    longTaskMaxDurationMs: Number(
      median(selected.map((run) => run.longTasks.maxDurationMs)).toFixed(1),
    ),
  };
}

function improvement(cold, hot) {
  const result = {};
  for (const key of Object.keys(cold)) {
    result[key] = cold[key]
      ? Number((((cold[key] - hot[key]) / cold[key]) * 100).toFixed(1))
      : null;
  }
  return result;
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

function printReport(report) {
  console.table(
    report.runs.map((run) => ({
      corrida: run.run,
      cache: run.scenario === "cold" ? "fria" : "caliente",
      "DCL (ms)": run.domContentLoadedMs,
      "mapa listo (ms)": run.mapReadyMs,
      transferido: formatBytes(run.transferredBytes),
      requests: run.requestCount,
      "hits cache": run.cacheHitCount,
      "tareas largas": run.longTasks.count,
      "tareas largas total (ms)": run.longTasks.totalDurationMs,
    })),
  );
  console.log("Medianas:");
  console.log(
    `  Fria: DCL ${report.summary.cold.domContentLoadedMs} ms; mapa ${report.summary.cold.mapReadyMs} ms; ${formatBytes(report.summary.cold.transferredBytes)}.`,
  );
  console.log(
    `  Caliente: DCL ${report.summary.hot.domContentLoadedMs} ms; mapa ${report.summary.hot.mapReadyMs} ms; ${formatBytes(report.summary.hot.transferredBytes)}.`,
  );
}

async function runBenchmark(options) {
  let localServer;
  let browser;
  try {
    if (options.url) {
      const configuredUrl = new URL(options.url);
      if (!["http:", "https:"].includes(configuredUrl.protocol)) {
        throw new Error("--url debe usar http o https.");
      }
    } else {
      localServer = await startBuildServer(defaultBuildDirectory);
    }
    const targetUrl = options.url || localServer.url;
    const origin = new URL(targetUrl).origin;
    console.log("Iniciando Chrome/Chromium...");
    browser = await launchChrome(options);
    const { connection } = browser;
    const { targetId } = await connection.send(
      "Target.createTarget",
      { url: "about:blank" },
      undefined,
      options.timeoutMs,
    );
    const { sessionId } = await connection.send("Target.attachToTarget", {
      targetId,
      flatten: true,
    });
    await Promise.all([
      connection.send("Page.enable", {}, sessionId),
      connection.send("Network.enable", {}, sessionId),
      connection.send("Performance.enable", {}, sessionId),
      connection.send("Runtime.enable", {}, sessionId),
      connection.send("ServiceWorker.enable", {}, sessionId).catch(() => undefined),
    ]);
    await connection.send(
      "Network.setCacheDisabled",
      { cacheDisabled: false },
      sessionId,
    );
    await connection.send(
      "Page.addScriptToEvaluateOnNewDocument",
      { source: collectorSource },
      sessionId,
    );

    const tracker = new NetworkTracker(connection, sessionId);
    const context = {
      connection,
      sessionId,
      tracker,
      options,
      origin,
      targetUrl,
    };
    const runs = [];
    for (let run = 1; run <= options.runs; run += 1) {
      console.log(`Corrida ${run}/${options.runs}: cache fria...`);
      await clearBrowserState(context);
      runs.push(await measureNavigation(context, "cold", run));
      if (options.warmupMs > 0) {
        console.log(`Corrida ${run}/${options.runs}: preparando cache caliente...`);
        await new Promise((resolve) => setTimeout(resolve, options.warmupMs));
      }
      console.log(`Corrida ${run}/${options.runs}: cache caliente...`);
      runs.push(await measureNavigation(context, "hot", run));
    }
    tracker.close();

    const cold = summarizeRuns(runs, "cold");
    const hot = summarizeRuns(runs, "hot");
    const browserVersion = await connection.send("Browser.getVersion");
    const report = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      target: targetUrl,
      environment: {
        node: process.version,
        chromeExecutable: browser.chrome.executable,
        chromeVersion: browser.chrome.version,
        browserProduct: browserVersion.product,
        protocolVersion: browserVersion.protocolVersion,
      },
      configuration: {
        runs: options.runs,
        timeoutMs: options.timeoutMs,
        warmupMs: options.warmupMs,
        settleMs: options.settleMs,
        viewport: "1440x900",
        localBuildServer: !options.url,
      },
      measurement: {
        transferredBytes:
          "CDP encoded bytes for requests initiated no later than map ready",
        longTasks: "Long Tasks API entries started no later than map ready",
      },
      runs,
      summary: {
        statistic: "median",
        cold,
        hot,
        improvementPercent: improvement(cold, hot),
      },
    };
    printReport(report);

    if (options.output) {
      const outputPath = path.resolve(projectDirectory, options.output);
      await mkdir(path.dirname(outputPath), { recursive: true });
      await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
      console.log(`Informe JSON: ${outputPath}`);
    }
    return report;
  } finally {
    await browser?.close();
    await localServer?.close();
  }
}

async function main() {
  try {
    const options = parseArguments(process.argv.slice(2));
    if (options.help) {
      process.stdout.write(usage());
      return;
    }
    await runBenchmark(options);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

await main();
