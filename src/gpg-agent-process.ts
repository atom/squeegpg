import {spawn} from "child_process";

import {getGpgAgentBinary} from "./paths";

export default class GpgAgentProcess {
  constructor(private readonly home: Home) {
    //
  }
}
