export interface LatestRecord {
  name: {
    short: string;
    long: string;
  };
  address: string;
  age: {
    number: number;
    unit: string;
  };
  last5m: number | undefined;
  liquidity: number;
}
