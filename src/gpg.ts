import Home from "./home";
import {applyDefaults, Options} from "./options";

export default class Gpg {
  private readonly home: Home;

  constructor(homeDir: string, options: Options = {}) {
    const opts = applyDefaults(options);
    this.home = new Home(homeDir, opts);
  }
}
