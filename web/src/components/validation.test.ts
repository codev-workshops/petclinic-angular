import { describe, expect, it } from "vitest";
import { validateField } from "./validation";

describe("validateField", () => {
  it("skips string validators for empty values but runs required", () => {
    expect(
      validateField("", { required: true, minLength: 2, pattern: "\\d+" }),
    ).toEqual(["required"]);
    expect(validateField("", { minLength: 2, pattern: "\\d+" })).toEqual([]);
  });
  it("anchors whole-string patterns", () => {
    expect(validateField("a1", { pattern: "^[a-zA-Z]*$" })).toEqual([
      "pattern",
    ]);
    expect(validateField("abc", { pattern: "^[a-zA-Z]*$" })).toEqual([]);
  });
  it("only applies required to objects and arrays", () => {
    expect(validateField({}, { required: true })).toEqual([]);
    expect(validateField([], { required: true })).toEqual(["required"]);
    expect(validateField({ id: 1 }, { minLength: 3, pattern: "x" })).toEqual(
      [],
    );
  });
});
