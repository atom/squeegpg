import {assert} from "chai";
import hello from "../src/index";

describe("hello", () => {
  it("returns a string", () => {
    assert.strictEqual(hello(), "I'm alive");
  });
});
