import { CheerioAPI, load } from "cheerio";
import { topTokenClient } from "../client";
import { LatestRecord } from "./types";
import { parseAge as parseAgeGeneric, parseDollarPrefixed } from "../utils";

const parseName = (
  td$: CheerioAPI
): { shortName: string; longName: string } => {
  const wholeText = td$(".mobile_coin_font").text();
  const shortName = td$(".mobile_coin_font b").text();
  const longName = wholeText.replace(shortName, "");
  const longNameTrimmed = longName.trim();
  const shortNameTrimmed = shortName.trim();
  return { shortName: shortNameTrimmed, longName: longNameTrimmed };
};

const parseAddress = (td$: CheerioAPI): string => {
  const href = td$("a").attr("href")!;
  const address = href.match(/0x.*/)![0];
  return address;
};

const parseAge = (td$: CheerioAPI): { number: number; unit: string } => {
  const text = td$.text();
  return parseAgeGeneric(text);
};

const parseLast5m = (td$: CheerioAPI): number => {
  const isUp = Boolean(td$("[data-name=arrow-up]").length);
  const number = Number(
    td$
      .text()
      .trim()
      .match(/[\d.]+/)![0]
  );

  // Prevent -0
  if (number === 0) return 0;

  return isUp ? number : -number;
};

const parseLiquidity = (td$: CheerioAPI): number => {
  const text = td$.text();
  return parseDollarPrefixed(text);
};

const parseRow = (tr$: CheerioAPI): LatestRecord => {
  const getNthTd = (nth: number) =>
    load(tr$(`td:nth-child(${nth})`).clone().get(0)!);

  const { shortName, longName } = parseName(getNthTd(2));
  const address = parseAddress(getNthTd(2));
  const age = parseAge(getNthTd(4));
  const last5m = parseLast5m(getNthTd(5));
  const liquidity = parseLiquidity(getNthTd(10));

  return {
    name: {
      short: shortName,
      long: longName,
    },
    address,
    age,
    last5m,
    liquidity,
  };
};

export const parseLatest = (html: string) => {
  const $ = load(html);
  // Select only the first table; the second table is for mobiles
  const rows = $("app-toplist-newborn table:nth-child(1) tbody tr");
  const table = rows.map((_, row) => parseRow(load(row))).toArray();
  return table;
};

export const getLatest = async (): Promise<LatestRecord[]> => {
  const response = await topTokenClient.get("latest").text();
  const table = parseLatest(response);
  return table;
};
