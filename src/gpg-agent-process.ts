import {spawn} from "child_process";
import path from "path";

import {getGpgAgentBinary} from "./paths";

export default class GpgAgentProcess {
  constructor(private readonly home: Home) {
    //
  }
}
