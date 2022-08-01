export const knownNetworks = ["ethereum", "binance"] as const;

export type KnownNetwork = typeof knownNetworks[number];
export interface Coin {
  address: string;
  name: string;
  chart: string | undefined;
  swap: string | undefined;
  price: string;
  marketCap: string;
  liquidity: string;
  last5m: number | undefined;
  last1h: number | undefined;
  last6h: number | undefined;
  last24h: number | undefined;
  isScam: boolean;
  buyFee: number | undefined;
  sellFee: number | undefined;
  network: KnownNetwork | string | undefined;
}
