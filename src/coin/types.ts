export interface Coin {
  chart: string;
  swap: string;
  price: string;
  marketCap: string;
  liquidity: string;
  last5m: number | null;
  last1h: number | null;
  last6h: number | null;
  last24h: number | null;
}
