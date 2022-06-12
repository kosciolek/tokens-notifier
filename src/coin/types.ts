export interface Coin {
  chart: string;
  swap: string;
  price: string;
  marketCap: number;
  liquidity: number;
  last5m: number | null;
  last1h: number | null;
  last6h: number | null;
  last24h: number | null;
}
