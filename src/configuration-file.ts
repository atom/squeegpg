import fs from "fs-extra";

function encomment(raw: string) {
  return raw.split(/\n/).map((line) => `# ${line}`).join("\n");
}

export default class ConfigurationFile {
  public static generate(filePath: string, fn: (cf: ConfigurationFile) => void) {
    return new Promise((resolve, reject) => {
      const cf = new ConfigurationFile(filePath, reject, resolve);
      fn(cf);
      cf.end();
    });
  }

  private stream: fs.WriteStream;

  private constructor(filePath: string, onError: (err: Error) => void, onFinish: () => void) {
    this.stream = fs.createWriteStream(filePath, {mode: 0o600});
    this.stream.setDefaultEncoding("utf8");

    this.stream.on("error", onError);
    this.stream.on("finish", onFinish);

    this.stream.write("# Generated automatically by squeegpg\n");
  }

  public set(setting: string, description: string) {
    this.stream.write("\n" + encomment(description) + "\n" + setting + "\n");
  }

  public banner(text: string) {
    this.stream.write("\n###############################################################################");
    this.comment(text);
  }

  public comment(text: string) {
    this.stream.write("\n" + encomment(text) + "\n");
  }

  public end() {
    this.stream.end();
  }
}
