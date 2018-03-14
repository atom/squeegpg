import path from "path";

export enum Compression {Zip, Tar}

export interface IPlatform {
  checksum: string;
  tarball: string;
  compression: Compression;
}

export interface IPlatformTable {
  [platform: string]: IPlatform | undefined;
}

export default {
  nativeTag: "v0.0.1",
  outputDir: path.join(__dirname, "../gpg"),
  platforms: {
    darwin: {
      checksum: "",
      tarball: "gnupg-macos.tar.gz",
      compression: Compression.Tar,
    },
    linux: {
      checksum: "",
      tarball: "gnupg-linux.tar.gz",
      compression: Compression.Tar,
    },
    win32: {
      checksum: "",
      tarball: "gnupg-windows.zip",
      compression: Compression.Zip,
    },
  } as IPlatformTable,
};
