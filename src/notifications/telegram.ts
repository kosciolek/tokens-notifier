import { Telegraf } from "telegraf";
import { Coin } from "../coin/types";

const formatCoin = (coin: Coin) =>
  `
_„${coin.name}” IS RISING 🚀_
*Price*: ${coin.price}
*Liquidity*: ${coin.liquidity}
*Market cap*: ${coin.marketCap}
*Last 1h*: ${coin.last1h}%
*Poocoin chart*: ${coin.chart}
*Pancake swap*: ${coin.swap}
`.trim();

const format = (coins: Coin[]) =>
  `
${coins.map((coin) => formatCoin(coin)).join("\n-------------\n")}
`.trim();

export const sendTelegramNotification = async ({
  token,
  chatId,
  coins,
}: {
  token: string;
  chatId: string;
  coins: Coin[];
}) => {
  const bot = new Telegraf(token);
  await bot.telegram.sendMessage(chatId, format(coins), {
    parse_mode: "Markdown",
    disable_web_page_preview: true,
  });
};
