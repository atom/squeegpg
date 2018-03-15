import {assert} from "chai";
import fs from "fs-extra";
import path from "path";
import {createTempDir} from "./helpers";

import Home from "../src/home";
import {defaultOptions} from "../src/options";

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

  describe("configuration", () => {
    it("creates a default gpg.conf", async () => {
      const dir = await createTempDir();
      const h = new Home(dir, defaultOptions);
      await h.ready();

      const gpgConf = await fs.readFile(path.join(dir, "gpg.conf"), {encoding: "utf8"});

      assert.match(gpgConf, /batch/);
      assert.match(gpgConf, /no-tty/);
      assert.match(gpgConf, /display-charset\s+utf-8/);
      assert.match(gpgConf, /disable-dirmngr/);
      assert.match(gpgConf, /no-autostart/);
      assert.match(gpgConf, /exit-on-status-write-error/);
      assert.match(gpgConf, /no-greeting/);

      const agentBin = path.resolve(__dirname, "../gpg/bin/gpg-agent");
      assert.match(gpgConf, new RegExp(`agent-program\\s+${agentBin}`));
    });

    it("creates a default gpg-agent.conf", async () => {
      const dir = await createTempDir();
      const h = new Home(dir, defaultOptions);
      await h.ready();

      const gpgAgentConf = await fs.readFile(path.join(dir, "gpg-agent.conf"), {encoding: "utf8"});

      assert.match(gpgAgentConf, /no-detach/);
      assert.match(gpgAgentConf, /extra-socket\s+none/);

      // TODO: test pinentry-program
      // const pinentryBin = path.join(dir, "pinentry.sh");
      // assert.match(gpgAgentConf, new RegExp(`pinentry-program\\s+${pinentryBin}`));
    });

    it("enables debug logging if requested", async () => {
      const dir = await createTempDir();
      const h = new Home(dir, {debugging: true});
      await h.ready();

      const [gpgConf, gpgAgentConf] = await Promise.all(
        ["gpg.conf", "gpg-agent.conf"]
          .map((confFile) => path.join(dir, confFile))
          .map((confPath) => fs.readFile(confPath, {encoding: "utf8"})),
      );

      assert.match(gpgConf, /verbose/);

      assert.match(gpgAgentConf, /debug-all/);
      assert.match(gpgAgentConf, /debug-pinentry/);

      const logFile = path.join(dir, "logs/gpg-agent.log");
      assert.match(gpgAgentConf, new RegExp(`log-file ${logFile}`));
    });

    describe("with a native homedir", () => {
      it("inherits selected options");

      it("overrides most options");
    });
  });
});
