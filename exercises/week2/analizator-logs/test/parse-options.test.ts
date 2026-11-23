import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseOptions } from "../src/parse-options.ts";

describe("parseOptions", () => {
  it("возвращает значения по умолчанию", () => {
    assert.deepEqual(parseOptions(["access.log"]), {
      file: "access.log",
      top: 5,
      json: false,
    });
  });

  it("принимает аргументы в любом порядке", () => {
    assert.deepEqual(parseOptions(["--top", "3", "access.log", "--json"]), {
      file: "access.log",
      top: 3,
      json: true,
    });
  });

  it("бросает ошибку без файла", () => {
    assert.throws(() => parseOptions([]), /Usage/);
  });

  it("бросает ошибку на лишний аргумент", () => {
    assert.throws(() => parseOptions(["a.log", "b.log"]), /Unexpected argument: b\.log/);
  });

  it("бросает ошибку на неизвестную опцию", () => {
    assert.throws(() => parseOptions(["a.log", "--foo"]));
  });

  for (const value of ["0", "-1", "1.5", "abc", "1e100"]) {
    it(`отклоняет --top ${value}`, () => {
      assert.throws(() => parseOptions(["a.log", `--top=${value}`]), /positive integer/);
    });
  }
});
