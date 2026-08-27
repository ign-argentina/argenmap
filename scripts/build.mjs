import { createHash } from "node:crypto";
import {
  access,
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { transform } from "esbuild";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "..");
const outputDirectory = path.join(projectDirectory, "build");

const initialScripts = [
  "src/js/utils/dependencies/dependency-loader.js",
  "src/js/utils/bootstrap-native.js",
  "src/js/utils/constants/constants.js",
  "src/js/entities.js",
  "src/js/utils/functions/functions.js",
  "src/js/components/url-interaction/URLInteraction.js",
  "src/js/components/context-menu/context-menu.js",
  "src/js/components/user-message/user-message.js",
  "src/js/app.js",
  "src/js/components/styles/styles.js",
  "src/js/components/login/login.js",
  "src/js/components/UI/UserInterface.js",
  "src/js/components/about/about.js",
  "src/js/components/pwa/pwa.js",
];

const initialStyles = [
  "src/styles/css/main.css",
  "src/styles/css/dashboard.css",
];

function fromProject(relativePath) {
  return path.join(projectDirectory, relativePath);
}

function fromOutput(relativePath) {
  return path.join(outputDirectory, relativePath);
}

function shortHash(content) {
  return createHash("sha256").update(content).digest("hex").slice(0, 12);
}

async function hashOutputFiles(relativePaths) {
  const hash = createHash("sha256");

  for (const relativePath of [...relativePaths].sort()) {
    hash.update(relativePath);
    hash.update(await readFile(fromOutput(relativePath)));
  }

  return hash.digest("hex").slice(0, 12);
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

async function minifyApplicationAssets() {
  const sourceDirectory = fromOutput("src");
  const files = await listFiles(sourceDirectory);

  for (const filePath of files) {
    const relativePath = path.relative(outputDirectory, filePath);
    const extension = path.extname(filePath);
    const isJavaScript = extension === ".js";
    const isCss = extension === ".css";
    const isThirdParty = relativePath.split(path.sep).includes("plugins");
    const isAlreadyMinified = filePath.endsWith(".min.js");

    if ((!isJavaScript && !isCss) || isThirdParty || isAlreadyMinified) {
      continue;
    }

    const source = await readFile(filePath, "utf8");
    const result = await transform(source, {
      loader: isJavaScript ? "js" : "css",
      minifyIdentifiers: false,
      minifySyntax: true,
      minifyWhitespace: true,
      legalComments: "inline",
      target: isJavaScript ? "es2018" : undefined,
    });
    await writeFile(filePath, result.code);
  }
}

async function createInitialJavaScriptBundle() {
  const sources = await Promise.all(
    initialScripts.map((file) => readFile(fromProject(file), "utf8")),
  );
  const result = await transform(sources.join("\n;\n"), {
    loader: "js",
    minifyIdentifiers: false,
    minifySyntax: true,
    minifyWhitespace: true,
    legalComments: "inline",
    target: "es2018",
  });
  const fileName = `argenmap.${shortHash(result.code)}.min.js`;
  const relativePath = path.posix.join("assets", "js", fileName);

  await mkdir(path.dirname(fromOutput(relativePath)), { recursive: true });
  await writeFile(fromOutput(relativePath), result.code);
  return relativePath;
}

async function createInitialCssBundle() {
  const sources = await Promise.all(
    initialStyles.map((file) => readFile(fromProject(file), "utf8")),
  );
  const result = await transform(sources.join("\n"), {
    loader: "css",
    minify: true,
    legalComments: "inline",
  });
  const fileName = `argenmap.${shortHash(result.code)}.min.css`;
  // Preserve the original directory depth so relative font and image URLs
  // continue to resolve without rewriting application configuration.
  const relativePath = path.posix.join("src", "styles", "css", fileName);

  await writeFile(fromOutput(relativePath), result.code);
  return relativePath;
}

function removeTag(html, tag) {
  if (!html.includes(tag)) {
    throw new Error(`No se encontro en index.html la etiqueta esperada: ${tag}`);
  }
  return html.replace(tag, "");
}

function replaceTag(html, currentTag, replacementTag) {
  if (!html.includes(currentTag)) {
    throw new Error(`No se encontro en index.html la etiqueta esperada: ${currentTag}`);
  }
  return html.replace(currentTag, replacementTag);
}

function configuredReleaseVersion() {
  const explicitVersion = process.env.ARGENMAP_VERSION?.trim();
  if (explicitVersion) {
    return explicitVersion;
  }

  const tag = process.env.CI_COMMIT_TAG?.trim();
  if (tag) {
    return tag;
  }

  const githubRef = process.env.GITHUB_REF_NAME?.trim();
  const githubSha = process.env.GITHUB_SHA?.trim().slice(0, 12);
  if (githubRef && process.env.GITHUB_REF_TYPE !== "tag" && githubSha) {
    return `${githubRef}-${githubSha}`;
  }

  const ciRef = process.env.CI_COMMIT_REF_NAME?.trim();
  const ciSha = process.env.CI_COMMIT_SHA?.trim().slice(0, 12);
  if (ciRef && ciSha) {
    return `${ciRef}-${ciSha}`;
  }

  return githubSha || ciSha || null;
}

function normalizeReleaseVersion(version) {
  return version.replace(/[^a-z0-9._-]/giu, "-");
}

async function createProductionHtml(javaScriptBundle, cssBundle, version) {
  let html = await readFile(fromProject("index.html"), "utf8");

  html = replaceTag(
    html,
    '  <meta name="argenmap-build" content="development">',
    '  <meta name="argenmap-build" content="production">',
  );
  html = html.replace(
    '  <meta name="argenmap-build" content="production">',
    `  <meta name="argenmap-build" content="production">\n  <meta name="argenmap-version" content="${version}">`,
  );

  html = removeTag(
    html,
    '  <script defer src="src/js/utils/dependencies/dependency-loader.js"></script>\n',
  );
  html = removeTag(
    html,
    '  <script defer src="src/js/utils/bootstrap-native.js"></script>\n',
  );
  html = replaceTag(
    html,
    '  <script defer src="src/js/utils/constants/constants.js"></script>',
    `  <script defer src="${javaScriptBundle}"></script>`,
  );

  for (const script of initialScripts.slice(3)) {
    html = removeTag(html, `  <script defer src="${script}"></script>\n`);
  }

  html = replaceTag(
    html,
    '  <link rel="stylesheet" href="src/styles/css/main.css" >',
    `  <link rel="stylesheet" href="${cssBundle}">`,
  );
  html = removeTag(
    html,
    '  <link href="src/styles/css/dashboard.css" rel="stylesheet" >\n',
  );

  html = html.replace(/<!--(?!\[if)[\s\S]*?-->/g, "");
  html = html.replace(/^\s*\n/gm, "");
  await writeFile(fromOutput("index.html"), html);
}

async function ensureRuntimeConfiguration() {
  for (const fileName of ["data.json", "preferences.json"]) {
    const configuredFile = fromOutput(path.join("src", "config", fileName));
    if (!(await exists(configuredFile))) {
      await cp(
        fromOutput(path.join("src", "config", "default", fileName)),
        configuredFile,
      );
    }
  }
}

async function ensureConfiguredFavicon() {
  const preferencesPath = fromOutput("src/config/preferences.json");
  const preferences = JSON.parse(await readFile(preferencesPath, "utf8"));
  const favicon = preferences.favicon;

  if (
    typeof favicon !== "string" ||
    favicon.trim() === "" ||
    /^(?:[a-z]+:)?\/\//iu.test(favicon) ||
    favicon.startsWith("data:")
  ) {
    return;
  }

  const relativeFavicon = favicon
    .split(/[?#]/, 1)[0]
    .replace(/^[/\\]+/u, "");
  const faviconPath = path.resolve(outputDirectory, relativeFavicon);
  if (!faviconPath.startsWith(`${outputDirectory}${path.sep}`)) {
    throw new Error(`La ruta configurada para el favicon no es segura: ${favicon}`);
  }
  if (await exists(faviconPath)) {
    return;
  }

  await mkdir(path.dirname(faviconPath), { recursive: true });
  await cp(
    fromOutput("src/styles/images/favicon.ico"),
    faviconPath,
  );
}

async function removeBundledSources() {
  for (const relativePath of [...initialScripts, ...initialStyles]) {
    const filePath = fromOutput(relativePath);
    if (await exists(filePath)) {
      await unlink(filePath);
    }
  }
}

async function verifyLocalHtmlAssets() {
  const html = await readFile(fromOutput("index.html"), "utf8");
  const assetReferences = [
    ...html.matchAll(/(?:src|href)="([^"]+)"/g),
  ].map((match) => match[1]);

  for (const reference of assetReferences) {
    if (
      reference.startsWith("http://") ||
      reference.startsWith("https://") ||
      reference.startsWith("#")
    ) {
      continue;
    }

    const assetPath = fromOutput(reference.split(/[?#]/, 1)[0]);
    if (!(await exists(assetPath))) {
      throw new Error(`El build referencia un recurso inexistente: ${reference}`);
    }
  }
}

function createServiceWorkerSource(version, precacheFiles) {
  return `"use strict";

const VERSION = ${JSON.stringify(version)};
const CACHE_PREFIX = "argenmap-pwa-";
const APP_CACHE = \`${"${CACHE_PREFIX}"}app-\${VERSION}\`;
const RUNTIME_CACHE = \`${"${CACHE_PREFIX}"}runtime-\${VERSION}\`;
const PRECACHE_URLS = ${JSON.stringify(precacheFiles.map((file) => `./${file}`), null, 2)};
const PRECACHE_URLS_ABSOLUTE = new Set(
  PRECACHE_URLS.map((url) => new URL(url, self.registration.scope).href),
);
const CONFIGURATION_PATHS = new Set([
  new URL("./src/config/data.json", self.registration.scope).pathname,
  new URL("./src/config/preferences.json", self.registration.scope).pathname,
]);
const TRUSTED_STATIC_CDNS = new Set([
  "cdnjs.cloudflare.com",
  "cdn.jsdelivr.net",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith(CACHE_PREFIX) &&
                key !== APP_CACHE &&
                key !== RUNTIME_CACHE,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreSearch: false });
  return cached || fetch(request);
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const update = fetch(request).then((response) => {
    if (response.ok || response.type === "opaque") {
      cache.put(request, response.clone());
    }
    return response;
  });

  if (cached) {
    update.catch(() => undefined);
    return cached;
  }

  return update;
}

async function navigationFromActiveVersion(request) {
  const cache = await caches.open(APP_CACHE);
  const shell = await cache.match("./index.html");

  return shell || fetch(request);
}

function isLocalStaticAsset(url) {
  return /\\.(?:css|js|mjs|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf)$/iu.test(
    url.pathname,
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(navigationFromActiveVersion(request));
    return;
  }

  if (url.origin === self.location.origin) {
    if (CONFIGURATION_PATHS.has(url.pathname)) {
      event.respondWith(networkFirst(request));
      return;
    }

    if (PRECACHE_URLS_ABSOLUTE.has(url.href)) {
      event.respondWith(cacheFirst(request));
      return;
    }

    if (isLocalStaticAsset(url)) {
      event.respondWith(staleWhileRevalidate(request));
    }
    return;
  }

  if (
    TRUSTED_STATIC_CDNS.has(url.hostname) &&
    ["font", "image", "script", "style"].includes(request.destination)
  ) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
`;
}

async function createProductionServiceWorker(
  javaScriptBundle,
  cssBundle,
  version,
) {
  const candidates = [
    "index.html",
    "manifest.webmanifest",
    javaScriptBundle,
    cssBundle,
    "src/config/data.json",
    "src/config/preferences.json",
    "src/js/components/context-menu/context-menu.css",
    "src/js/components/user-message/user-message.css",
    "src/styles/images/favicon.ico",
    "src/styles/images/loading.svg",
    "src/styles/images/noimage.webp",
    "src/styles/images/pwa/icon-192.png",
    "src/styles/images/pwa/icon-512.png",
    "src/styles/images/pwa/icon-maskable-192.png",
    "src/styles/images/pwa/icon-maskable-512.png",
  ];
  const precacheFiles = [];

  for (const relativePath of candidates) {
    if (await exists(fromOutput(relativePath))) {
      precacheFiles.push(relativePath);
    }
  }

  await writeFile(
    fromOutput("service-worker.js"),
    createServiceWorkerSource(version, precacheFiles),
  );

  return { version, precacheFiles };
}

async function directorySize(directory) {
  const files = await listFiles(directory);
  const sizes = await Promise.all(files.map((file) => stat(file)));
  return sizes.reduce((total, file) => total + file.size, 0);
}

async function build() {
  if (path.dirname(outputDirectory) !== projectDirectory) {
    throw new Error("La carpeta de salida no es segura.");
  }

  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });
  await cp(fromProject("src"), fromOutput("src"), {
    recursive: true,
    filter: (source) => {
      const relativePath = path.relative(projectDirectory, source);
      const docsDirectory = path.join("src", "docs");
      const isDocumentation =
        relativePath === docsDirectory ||
        relativePath.startsWith(`${docsDirectory}${path.sep}`);
      return (
        (!isDocumentation ||
          relativePath === docsDirectory ||
          relativePath === path.join(docsDirectory, "features.md")) &&
        path.extname(source) !== ".map"
      );
    },
  });
  await cp(fromProject("dist"), fromOutput("dist"), { recursive: true });
  await cp(fromProject("LICENSE"), fromOutput("LICENSE"));
  await cp(fromProject("README.md"), fromOutput("README.md"));
  await cp(
    fromProject("manifest.webmanifest"),
    fromOutput("manifest.webmanifest"),
  );

  await ensureRuntimeConfiguration();
  await ensureConfiguredFavicon();
  await minifyApplicationAssets();
  const [javaScriptBundle, cssBundle] = await Promise.all([
    createInitialJavaScriptBundle(),
    createInitialCssBundle(),
  ]);
  const filesForContentVersion = (await listFiles(outputDirectory))
    .map((filePath) =>
      path.relative(outputDirectory, filePath).split(path.sep).join("/"),
    )
    .filter((relativePath) => relativePath !== "service-worker.js");
  const version = normalizeReleaseVersion(
    configuredReleaseVersion() ||
      `content-${await hashOutputFiles(filesForContentVersion)}`,
  );
  await createProductionHtml(javaScriptBundle, cssBundle, version);
  await removeBundledSources();
  await verifyLocalHtmlAssets();
  const pwa = await createProductionServiceWorker(
    javaScriptBundle,
    cssBundle,
    version,
  );

  const manifest = {
    entrypoint: "index.html",
    assets: {
      javascript: javaScriptBundle,
      css: cssBundle,
    },
    pwa: {
      manifest: "manifest.webmanifest",
      serviceWorker: "service-worker.js",
      cacheVersion: pwa.version,
      releaseVersion: version,
      precache: pwa.precacheFiles,
    },
  };
  await writeFile(
    fromOutput("build-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  const bytes = await directorySize(outputDirectory);
  console.log(`Build de produccion creado en build/ (${(bytes / 1024 / 1024).toFixed(2)} MiB).`);
  console.log(`JavaScript inicial: ${javaScriptBundle}`);
  console.log(`CSS inicial: ${cssBundle}`);
}

await build();
