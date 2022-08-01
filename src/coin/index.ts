import { CheerioAPI, load } from "cheerio";
import got, { HTTPError } from "got";
import { topTokenClient } from "../client";
import { logger } from "../logger";
import { Coin, KnownNetwork } from "./types";
import { isKnownNetwork } from "./utils";

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

const parseNetwork = ($: CheerioAPI): Coin["network"] => {
  const text = $(".coin_info_desktop .vote_telegram_div").prev().text();
  const networkMatch = text.match(/Network: (.*)/);
  if (!networkMatch) return undefined;

  const network = networkMatch[1];

  if (network.includes("Ethereum (ETH)")) return "ethereum";
  if (network.includes("Binance Smart Chain (BSC)")) return "binance";

  logger.warn(`Unknown network: ${network}`);
  return network;
};

const parseChart = ($: CheerioAPI) =>
  $('a[href*="https://poocoin.app/tokens"]').get(0)?.attribs.href;

const parseSwap = ($: CheerioAPI) =>
  $('a[href*="https://pancakeswap.finance/swap"]').get(0)?.attribs.href;

const parseCoin = (
  $: CheerioAPI
): Omit<Coin, "address" | "isScam" | "buyFee" | "sellFee"> => {
  const name = parseName($);
  const price = parsePrice($);
  const marketCap = parseMarketCap($);
  const liquidity = parseLiquidity($);
  const last5m = parseLast($, "5m");
  const last1h = parseLast($, "1h");
  const last6h = parseLast($, "6h");
  const last24h = parseLast($, "24h");
  const network = parseNetwork($);
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
    network,
    chart,
    swap,
  };
};

export const getMisc = async (
  address: string,
  network: KnownNetwork
): Promise<Pick<Coin, "buyFee" | "sellFee" | "isScam">> => {
  const networkMap: Record<KnownNetwork, string> = {
    binance: "bsc2",
    ethereum: "eth",
  };

  const networkId = networkMap[network];

  try {
    const response = await got
      .get(
        `https://aywt3wreda.execute-api.eu-west-1.amazonaws.com/default/IsHoneypot?chain=${networkId}&token=${address}`
      )
      .json<{
        IsHoneypot: boolean;
        Error: any;
        MaxTxAmount: number;
        MaxTxAmountBNB: number;
        BuyTax: number;
        SellTax: number;
        BuyGas: number;
        SellGas: number;
      }>();

    return {
      buyFee: response.BuyTax,
      sellFee: response.SellTax,
      isScam: response.IsHoneypot,
    };
  } catch {
    return {
      buyFee: undefined,
      sellFee: undefined,
      isScam: true,
    };
  }
};

export const getCoin = async (address: string): Promise<Coin | undefined> => {
  const html = await topTokenClient.get(`address/${address}`).text();
  const $ = load(html);
  const parsed = parseCoin($);

  if (!isKnownNetwork(parsed.network)) {
    logger.warn(
      "Skipping a coin due to an unknown network.",
      address,
      parsed.network
    );
    return undefined;
  }

  const misc = await getMisc(address, parsed.network);

  return { ...parsed, ...misc, address };
};
