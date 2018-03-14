import {assert} from "chai";
import path from "path";

import Home from "../src/home";

describe("home", () => {
  let original: {GNUPGHOME?: string, APPDATA?: string, HOME?: string};

  beforeEach(() => {
    original = {
      GNUPGHOME: process.env.GNUPGHOME,
      APPDATA: process.env.APPDATA,
      HOME: process.env.HOME,
    };

    delete process.env.GNUPGHOME;
    delete process.env.APPDATA;
    delete process.env.HOME;
  });

  afterEach(() => {
    if (original.GNUPGHOME) { process.env.GNUPGHOME = original.GNUPGHOME; }
    if (original.APPDATA) { process.env.APPDATA = original.APPDATA; }
    if (original.HOME) { process.env.HOME = original.HOME; }
  });

  describe("bootstrapping location", () => {
    const directDir = path.join(__dirname, "fixtures/gpg21home");
    const dotParentDir = path.join(__dirname, "fixtures/dot-parent");
    const parentDir = path.join(__dirname, "fixtures/parent");
    const wrongDir = path.join(__dirname, "fixtures/gpg10home");

    it("bootstraps from an explicitly set $GNUPGHOME", async () => {
      process.env.GNUPGHOME = directDir;
      process.env.HOME = wrongDir;
      process.env.APPDATA = wrongDir;

      assert.strictEqual(await Home.inferNative(), directDir);
    });

    if (process.platform === "win32") {
      it("bootstraps from a well-known location in $APPDATA", async () => {
        process.env.APPDATA = parentDir;
        process.env.HOME = wrongDir;
        assert.strictEqual(await Home.inferNative(), path.join(parentDir, "gnupg"));
      });
    } else {
      it("bootstraps from a well-known location in $HOME", async () => {
        process.env.HOME = dotParentDir;
        process.env.APPDATA = wrongDir;
        assert.strictEqual(await Home.inferNative(), path.join(dotParentDir, ".gnupg"));
      });
    }
  });

  describe("with a native 1.x installation", () => {
    it("copies the keyring");
    it("symlinks the public keyring");
    it("symlinks the trustdb");
  });

  describe("with a native 2.1+ installation", () => {
    it("symlinks the private-keys directory");
    it("symlinks the public keyring");
    it("symlinks the trustdb");
  });

  describe("gpg configuration", () => {
    it("sets controlled defaults");
    it("disables the keyserver");
  });

  describe("gpg-agent configuration", () => {
    it("sets the pinentry program");
    it("enables debugging if requested");
  });
});
