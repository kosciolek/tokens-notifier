import { LatestRecord } from "./latest/types";
import { TrendingRecord } from "./trending/types";

// Incomplete, I don't know what other time units they use
const latestUnits = {
  minute: "min",
  hour: "h",
  // not sure
  days: "d",
  // not sure
  seconds: "s",
};

export const filterLatest = (records: LatestRecord[]) =>
  records
    .filter((record) => {
      if (record.age.unit === latestUnits.minute) return false;
      if (record.age.number === 1 && record.age.unit === latestUnits.hour)
        return false;
      return true;
    })
    .filter(({ last5m }) => last5m !== undefined && last5m >= 10)
    .filter((record) => record.liquidity >= 3000);

// Incomplete, I don't know what other time units they use
const trendingUnits = {
  minute: "min",
  hour: "h",
  seconds: "s",
  days: "days",
  months: "months",
  today: "Today",
  presale: "Presale",
};

export const filterTrending = (records: TrendingRecord[]) =>
  records
    .filter((record) => {
      if (
        [
          trendingUnits.hour,
          trendingUnits.seconds,
          trendingUnits.minute,
          trendingUnits.presale,
        ].includes(record.age.unit)
      )
        return false;
      /* 
      It seems like sub-day values dont show up in trending, and 1 day is Today, which  we treat as 24h
      so all other possibilities are >= 2 days
      */
      return true;
    })
    .filter(({ last1h }) => last1h !== undefined && last1h >= 10)
    .filter((record) => record.liquidity >= 20000);
