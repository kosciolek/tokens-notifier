import { CheerioAPI, load } from "cheerio";
import { HTTPError } from "got";
import { topTokenApiClient, topTokenClient } from "../client";
import { getIsScam } from "./getIsScam";
import { Coin } from "./types";

const parseName = ($: CheerioAPI) => {
  const text = $(".coin_info_desktop .nested_header").text();
  return text;
};

const parsePrice = ($: CheerioAPI) => {
  const node = $(".contact_div .info_heading").filter((_, node) => {
    const text = load(node.cloneNode(true)).text();
    return text === "Price";
  });

  const text = node.next().text().trim();

  return text;
};

const parseMarketCap = ($: CheerioAPI) => {
  const node = $(".contact_div .info_heading").filter((_, node) => {
    const text = load(node.cloneNode(true)).text();
    return text === "Market Cap";
  });

  const text = node.next().text();
  return text;
};

const parseLiquidity = ($: CheerioAPI) => {
  const node = $(".contact_div .info_heading").filter((_, node) => {
    const text = load(node.cloneNode(true)).text();
    return text === "Liquidity";
  });

  const text = node.next().text();
  return text;
};

const parseLast = ($: CheerioAPI, label: "5m" | "1h" | "6h" | "24h") => {
  const node = $(".contact_div .info_heading").filter((_, node) => {
    const text = load(node.cloneNode(true)).text();
    return text === label;
  });

  const value$ = load(node.next().get());
  const isNegative = Boolean(value$("i.fa-caret-down").length);

  const text = value$.text();
  if (text === "--") return undefined;

  const digits = text.match(/[\d.]+/)![0];
  const number = Number(digits);
  return isNegative ? -number : number;
};

const parseChart = ($: CheerioAPI) =>
  $('a[href*="https://poocoin.app/tokens"]').get(0)?.attribs.href;

const parseSwap = ($: CheerioAPI) =>
  $('a[href*="https://pancakeswap.finance/swap"]').get(0)?.attribs.href;

const parseCoin = ($: CheerioAPI): Omit<Coin, "address" | "isScam"> => {
  const name = parseName($);
  const price = parsePrice($);
  const marketCap = parseMarketCap($);
  const liquidity = parseLiquidity($);
  const last5m = parseLast($, "5m");
  const last1h = parseLast($, "1h");
  const last6h = parseLast($, "6h");
  const last24h = parseLast($, "24h");
  const chart = parseChart($);
  const swap = parseSwap($);

  return {
    name,
    price,
    marketCap,
    liquidity,
    last5m,
    last1h,
    last6h,
    last24h,
    chart,
    swap,
  };
};

export const getCoin = async (address: string): Promise<Coin> => {
  const text = await topTokenClient.get(`address/${address}`).text();
  const $ = load(text);

  const parsed = parseCoin($);
  const isScam = await getIsScam(address);

  return { ...parsed, isScam, address };
};
