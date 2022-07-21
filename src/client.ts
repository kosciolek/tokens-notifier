import got from "got";

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36",
};

export const topTokenClient = got.extend({
  prefixUrl: "https://top100token.com/",
  headers,
});

export const topTokenApiClient = got.extend({
  prefixUrl: "https://api.top100token.com/",
  headers,
});
