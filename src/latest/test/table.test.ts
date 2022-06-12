import * as fs from "node:fs";
import { join } from "node:path";
import { parseLatest } from "..";

const readMock = (filename: string) =>
  fs.readFileSync(join(__dirname, `./mocks/${filename}`), "utf-8");

const tableA = readMock("tableA.html");

describe("parseLatest", () => {
  it("matches snapshot", () => {
    expect(parseLatest(tableA)).toMatchSnapshot("table-a-snapshot");
  });
});
