import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import readline from "node:readline/promises";

const execFileAsync = promisify(execFile);
const semanticTagPattern = /^v(\d+)\.(\d+)\.(\d+)$/;

async function git(...args) {
  const { stdout } = await execFileAsync("git", args, { encoding: "utf8" });
  return stdout.trim();
}

function isReleaseBranch(branch) {
  return branch === "master" || /^(?:hotfix|release)(?:$|[/-])/u.test(branch);
}

function parseSemanticTag(tag) {
  const match = semanticTagPattern.exec(tag);
  return match
    ? { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) }
    : null;
}

async function tagAtHead() {
  const tags = await git("tag", "--points-at", "HEAD", "--sort=-v:refname");
  return tags
    .split("\n")
    .map((tag) => tag.trim())
    .find((tag) => parseSemanticTag(tag));
}

async function latestSemanticTag() {
  const tags = await git("tag", "-l", "--sort=-v:refname");
  return tags
    .split("\n")
    .map((tag) => tag.trim())
    .find((tag) => parseSemanticTag(tag));
}

function incrementTag(tag, releaseType) {
  const version = parseSemanticTag(tag) || { major: 0, minor: 0, patch: 0 };
  if (releaseType === "major") {
    return `v${version.major + 1}.0.0`;
  }
  if (releaseType === "minor") {
    return `v${version.major}.${version.minor + 1}.0`;
  }
  return `v${version.major}.${version.minor}.${version.patch + 1}`;
}

async function askReleaseType() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      "No se puede crear un tag sin una terminal interactiva. " +
        "Use ARGENMAP_VERSION=vMAJOR.MINOR.PATCH o ejecute el comando en una terminal.",
    );
  }

  const input = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    while (true) {
      const answer = (await input.question(
        "Tipo de release (major, minor o patch): ",
      ))
        .trim()
        .toLowerCase();
      if (["major", "minor", "patch"].includes(answer)) {
        return answer;
      }
      console.log("Valor inválido. Indique major, minor o patch.");
    }
  } finally {
    input.close();
  }
}

async function resolveReleaseVersion() {
  const currentTag = await tagAtHead();
  if (currentTag) {
    return currentTag;
  }

  const latestTag = await latestSemanticTag();
  const releaseType = await askReleaseType();
  const nextTag = incrementTag(latestTag, releaseType);
  await git("tag", nextTag);
  console.log(`Tag creado: ${nextTag}`);
  return nextTag;
}

async function main() {
  const branch = await git("branch", "--show-current");
  const version = isReleaseBranch(branch)
    ? await resolveReleaseVersion()
    : `develop-${await git("rev-parse", "--short", "HEAD")}`;

  console.log(`Build ${branch}: ARGENMAP_VERSION=${version}`);
  const build = spawn("npm", ["run", "build"], {
    stdio: "inherit",
    env: { ...process.env, ARGENMAP_VERSION: version },
  });
  build.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    }
    process.exitCode = code ?? 1;
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});