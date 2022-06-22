export interface TrendingRecord {
  address: string;
  last1h: number | undefined;
  liquidity: number;
  age: {
    number: number;
    unit: string;
  };
}
