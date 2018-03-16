import {assert} from "chai";

import Gpg from "../src/gpg";
import {createTempDir} from "./helpers";

describe("GpgProcess", () => {
  it("spawns a gpg processes", async () => {
    const homeDir = await createTempDir();
    const context = new Gpg(homeDir);

    const result = await context.exec(["--version"]);

    assert.strictEqual(0, result.code);
    assert.isNull(result.signal);
    assert.match(result.stdout, /gpg \(GnuPG\) [\d.]+/);
    assert.strictEqual(result.stderr, "");
  });
});
