import fs from "fs-extra";
import path from "path";

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
}
