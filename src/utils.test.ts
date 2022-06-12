import { parseDollarPrefixed, parseAge } from "./utils";

describe("parseDollarPrefixed", () => {
  it("$5", () => {
    expect(parseDollarPrefixed("$5")).toBe(5);
  });

  it("$-5", () => {
    expect(parseDollarPrefixed("$-5")).toBe(-5);
  });

  it("$3.14", () => {
    expect(parseDollarPrefixed("$3.14")).toBe(3.14);
  });

  it("$-3.14", () => {
    expect(parseDollarPrefixed("$-3.14")).toBe(-3.14);
  });

  it("$3,123.14", () => {
    expect(parseDollarPrefixed("$3123.14")).toBe(3123.14);
  });

  it("$-3,123.14", () => {
    expect(parseDollarPrefixed("$-3123.14")).toBe(-3123.14);
  });

  it("$0.14", () => {
    expect(parseDollarPrefixed("$0.14")).toBe(0.14);
  });

  it("$-0.14", () => {
    expect(parseDollarPrefixed("$-0.14")).toBe(-0.14);
  });
});

describe("parseAge", () => {
  it("3 days", () => {
    expect(parseAge("3 days")).toEqual({
      number: 3,
      unit: "days",
    });
  });

  it("3days", () => {
    expect(parseAge("3days")).toEqual({
      number: 3,
      unit: "days",
    });
  });

  it("Today", () => {
    expect(parseAge("Today")).toEqual({
      number: 24,
      unit: "h",
    });
  });
});
