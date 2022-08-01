import { Coin } from "../coin/types";
import { TrendingRecord } from "./types";

// Incomplete, I don't know what other time units they use
const trendingUnits = {
  minute: "min",
  hour: "h",
  seconds: "s",
  days: "days",
  months: "months",
  today: "today",
  presale: "presale",
};

export const filterRecords = (records: TrendingRecord[]) =>
  records
    .filter((record) => {
      if (
        [
          trendingUnits.hour,
          trendingUnits.seconds,
          trendingUnits.minute,
          trendingUnits.presale,
        ].includes(record.age.unit.toLowerCase())
      )
        return false;
      /* 
        It seems like sub-day values dont show up in trending, and 1 day is Today, which  we treat as 24h
        so all other possibilities are >= 2 days
        */
      return true;
    })
    .filter(({ last1h }) => last1h !== undefined && last1h > 3);

export const filterCoins = (coins: Coin[]) =>
  coins
    .filter(({ last5m }) => last5m !== undefined && last5m >= 0)
    .filter(({ last1h }) => last1h !== undefined && last1h > 3)
    .filter(({ sellFee }) => sellFee !== undefined && sellFee < 3)
    .filter(({ buyFee }) => buyFee !== undefined && buyFee < 3)
    .filter(({ chart }) => chart !== undefined)
    .filter(({ swap }) => swap !== undefined)
    .filter(({ isScam }) => !isScam);
