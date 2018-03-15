import fs from "fs-extra";
import path from "path";

import ConfigurationFile from "./configuration-file";
import {IOptions} from "./options";

export default class Home {
  public static async inferNative() {
    const checkDir = async (maybeBase?: string, ...rest: string[]) => {
      if (maybeBase === undefined || maybeBase === "") {
        return {ok: false, path: ""};
      }

      const fullDir = path.join(maybeBase, ...rest);
      try {
        const st = await fs.stat(fullDir);
        return {ok: st.isDirectory(), path: fullDir};
      } catch (e) {
        return {ok: false, path: fullDir};
      }
    };

    const gnupgHome = await checkDir(process.env.GNUPGHOME);
    if (gnupgHome.ok) {
      return gnupgHome.path;
    }

    if (process.platform === "win32") {
      // gpg 2.x on Windows
      const appData = await checkDir(process.env.APPDATA, "gnupg");
      if (appData.ok) {
        return appData.path;
      }

      return null;
    } else {
      // gpg 1.x on Windows, all gpgs on other OSes
      const userHome = await checkDir(process.env.HOME, ".gnupg");
      if (userHome.ok) {
        return userHome.path;
      }

      return null;
    }
  }

  private bootstrapped: boolean;

  public constructor(private readonly dir: string, private readonly opts: IOptions) {
    this.bootstrapped = false;
  }

  public async ready() {
    if (this.bootstrapped) {
      return;
    }

    const nativeDir = await Home.inferNative();

    await Promise.all([
      this.templateGpgConf(nativeDir),
      this.templateGpgAgentConf(nativeDir),
    ]);

    this.bootstrapped = true;
  }

  private templateGpgConf(_nativeDir: string | null) {
    // Reference:
    // https://www.gnupg.org/documentation/manuals/gnupg/GPG-Configuration-Options.html

    const agentBin = path.resolve(__dirname, "../gpg/bin/gpg-agent");

    return ConfigurationFile.generate(path.join(this.dir, "gpg.conf"), (cf) => {
      cf.banner("Static options");

      cf.set("batch", "Do not allow interactive commands");
      cf.set("no-tty", "Ensure the tty is never used for output");
      cf.set("display-charset utf-8",
        "Output informational strings like user IDs as UTF-8.\n" +
        "Implies utf8-strings, which interprets command-line arguments as UTF-8.");
      cf.set("disable-dirmngr", "Disable the use of dirmngr for keyserver interactions, because we don't bundle it.");
      cf.set("no-autostart", "Do not start the gpg-agent or dirmngr processes on demand.");
      cf.set("exit-on-status-write-error",
        "Terminate the process immediately on errors writing to the status file descriptor.");
      cf.set("no-greeting", "Suppress the initial copyright message.");

      cf.banner("Options templated for each homedir");

      cf.set(`agent-program ${agentBin}`, "Use the bundled gpg-agent binary.");

      if (this.opts.debugging) {
        cf.banner("Enabled by {debugging: true}");

        cf.set("verbose", "Output more information during processing.");
      }
    });
  }

  private templateGpgAgentConf(_nativeDir: string | null) {
    // Reference:
    // https://www.gnupg.org/documentation/manuals/gnupg/Agent-Options.html

    return ConfigurationFile.generate(path.join(this.dir, "gpg-agent.conf"), (cf) => {
      cf.banner("Static options");

      cf.set("no-detach", "Remain attached to stdout and stderr.");
      cf.set("extra-socket none", "This agent should never be used by remote machines.");

      if (this.opts.debugging) {
        cf.banner("Enabled by {debugging: true}");

        cf.set("debug-all", "Enable all debugging flags.");
        cf.set("debug-pinentry", "Extra debug information relating to pinentry communication.");
        cf.set(`log-file ${this.logPath("gpg-agent")}`, "Append logging information here.");
      }
    });
  }

  private logPath(component: string) {
    return path.join(this.dir, "logs", `${component}.log`);
  }
}
