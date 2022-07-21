import { CheerioAPI, load } from "cheerio";
import { topTokenClient } from "../client";
import { TrendingRecord } from "./types";
import { parseDollarPrefixed, parseAge as parseAgeGeneric } from "../utils";

const parseAddress = (td$: CheerioAPI): string => {
  const href = td$("a").attr("href")!;
  const address = href.match(/0x.*/)![0];
  return address;
};

const parseAge = (td$: CheerioAPI): { number: number; unit: string } => {
  const text = td$.text().trim();
  return parseAgeGeneric(text);
};

const parseLast1h = (td$: CheerioAPI): number => {
  const isNegative = Boolean(td$("i.fa-caret-up").length);
  const number = Number(
    td$
      .text()
      .trim()
      .match(/[\d.]+/)![0]
  );
  return isNegative ? -number : number;
};

const parseLiquidity = (td$: CheerioAPI): number => {
  const text = td$.text();
  return parseDollarPrefixed(text);
};

const parseRow = (tr$: CheerioAPI): TrendingRecord => {
  const getNthTd = (nth: number) =>
    load(tr$(`td:nth-child(${nth})`).clone().get(0)!);

  const address = parseAddress(getNthTd(2));
  const age = parseAge(getNthTd(9));
  const last1h = parseLast1h(getNthTd(5));
  const liquidity = parseLiquidity(getNthTd(8));

  return {
    address,
    age,
    last1h,
    liquidity,
  };
};

export const parseTrending = (html: string): TrendingRecord[] => {
  const $ = load(html);

  const highlights = $("#highlights");
  const next$ = load(highlights.next().clone().get());
  // The last tr is "Show more" button, omit it
  const rows = next$("tbody tr:not(:last-child)");

  const trending = rows
    .map((_, row) => parseRow(load(row.cloneNode(true))))
    .toArray();

  return trending;
};

export const getTrending = async (): Promise<TrendingRecord[]> => {
  const response = await topTokenClient.get("trending").text();
  const trending = parseTrending(response);
  return trending;
};
