export interface TrendingRecord {
  address: string;
  last1h: number;
  liquidity: number;
  age: {
    number: number;
    unit: string;
  };
}
