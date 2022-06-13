import { CheerioAPI, load } from "cheerio";
import { client } from "../client";
import { parseDollarPrefixed } from "../utils";
import { Coin } from "./types";

const createPooChartLink = (address: string) =>
  `https://poocoin.app/tokens/${address}`;
const createPancakeSwapLink = (address: string) =>
  `https://pancakeswap.finance/swap?outputCurrency=${address}`;

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
  if (text === "--") return null;

  const digits = text.match(/[\d.]+/)![0];
  const number = Number(digits);
  return isNegative ? -number : number;
};

const parseCoin = ($: CheerioAPI) => {
  const price = parsePrice($);
  const marketCap = parseMarketCap($);
  const liquidity = parseLiquidity($);
  const last5m = parseLast($, "5m");
  const last1h = parseLast($, "1h");
  const last6h = parseLast($, "6h");
  const last24h = parseLast($, "24h");

  return {
    price,
    marketCap,
    liquidity,
    last5m,
    last1h,
    last6h,
    last24h,
  };
};

export const getCoin = async (address: string): Promise<Coin> => {
  const text = await client.get(`address/${address}`).text();
  const $ = load(text);

  const parsed = parseCoin($);

  return {
    ...parsed,
    chart: createPooChartLink(address),
    swap: createPancakeSwapLink(address),
  };
};
