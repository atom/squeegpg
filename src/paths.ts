import path from "path";

function resolveEmbeddedGpgDir() {
  const s = path.sep;
  return path.resolve(__dirname, "../gpg/bin")
    .replace(/[\\\/]app\.asar[\\\/]/, `${s}app.asar.unpacked${s}`);
}

export function getGpgDir() {
  if (process.env.LOCAL_GPG_DIRECTORY) {
    return path.resolve(process.env.LOCAL_GPG_DIRECTORY);
  } else {
    return resolveEmbeddedGpgDir();
  }
}

function getBinary(binaryName: string) {
  const base = path.join(getGpgDir(), "bin", binaryName);
  if (process.platform !== "win32") {
    return base;
  } else {
    return base + ".exe";
  }
}

export function getGpgAgentBinary() {
  return getBinary("gpg-agent");
}

export function getGpgBinary() {
  return getBinary("gpg");
}
