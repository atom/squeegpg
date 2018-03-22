import {execFile, ExecOptionsWithStringEncoding, ExecOptionsWithBufferEncoding} from "child_process";

import {getGpgBinary} from "./paths";
import {IEnv} from "./options";

export interface IGpgOptions {
  readonly env?: IEnv;
  readonly stdin?: string | Buffer;
  readonly stdinEncoding?: string;
  readonly outputBufferSize?: number;
  readonly outputEncoding?: string;
}

export interface IGpgStringResult {
  code: number;
  stdout: string;
  stderr: string;
};

export interface IGpgBufferResult {
  code: number;
  stdout: Buffer;
  stderr: Buffer;
}

interface CodedError {
  code?: string | number;
};

export default class GpgProcess {
  // public static exec(args: string[], homeDir: string, options: { outputEncoding: "buffer" } & IGpgOptions): Promise<IGpgBufferResult>;
  public static exec(args: string[], homeDir: string, options: { outputEncoding: BufferEncoding } & IGpgOptions): Promise<IGpgStringResult> {
    const gpgBin = getGpgBinary();
    const gpgArgs = ["--homedir", homeDir, ...args];
    const gpgEnv = Object.assign(
      {},
      process.env,
      options.env,
    );
    const gpgOptions: ExecOptionsWithStringEncoding = {
      env: gpgEnv,
      encoding: options.outputEncoding || "utf8",
      maxBuffer: options.outputBufferSize || 10 * 1024 * 1024,
    };

    return new Promise((resolve, reject) => {
      const child = execFile(
        gpgBin,
        gpgArgs,
        gpgOptions,
        (err, stdout, stderr) => {
          if (!err) {
            resolve({code: 0, stdout, stderr});
            return;
          }

          const coded = err as CodedError;
          if (typeof coded.code === "number") {
            reject({code: coded.code, stdout, stderr});
          }

          reject(err);
        }
      );

      if (options.stdin) {
        child.stdin.end(options.stdin, options.stdinEncoding);
      }
    });
  }
}
