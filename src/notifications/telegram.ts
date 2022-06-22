import { Telegraf } from "telegraf";
import { Coin } from "../coin/types";

const formatCoin = (coin: Coin, type: "latest" | "trending") =>
  `
_„${coin.name}” IS RISING 🚀_
*Price*: ${coin.price}
*Liquidity*: ${coin.liquidity}
*Market cap*: ${coin.marketCap}
${
  type === "latest"
    ? `*Last 5m*: ${coin.last5m ?? "--"}%`
    : `*Last 1h*: ${coin.last1h ?? "--"}%`
}
${coin.chart ? `*Poocoin chart*: ${coin.chart}` : ""}
${coin.swap ? `*Pancake swap*: ${coin.swap}` : ""}
`.trim();

const format = (coins: Coin[], type: "latest" | "trending") =>
  `
${coins.map((coin) => formatCoin(coin, type)).join("\n-------------\n")}
`.trim();

export const sendTelegramNotification = async ({
  token,
  chatId,
  type,
  coins,
}: {
  token: string;
  chatId: string;
  coins: Coin[];
  type: "latest" | "trending";
}) => {
  const bot = new Telegraf(token);
  await bot.telegram.sendMessage(chatId, format(coins, type), {
    parse_mode: "Markdown",
    disable_web_page_preview: true,
  });
};
