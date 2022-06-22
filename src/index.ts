import { InvalidArgumentError, Option, program } from "commander";
import { getCoin } from "./coin";
import { filterLatest, filterTrending } from "./filters";
import { getLatest } from "./latest";
import { logger } from "./logger";
import { getTrending } from "./trending";
import { sleep, sortBy } from "./utils";
import { sendTelegramNotification } from "./notifications/telegram";
import { Deduplicator } from "./deduplicator";

const getMatchingCoins = () => {};

program
  .allowExcessArguments(false)
  .addOption(
    new Option(
      "-i, --interval <seconds>",
      "The interval at which the tokens will be checked and notifications sent. In seconds."
    )
      .makeOptionMandatory()
      .argParser((value) => {
        const number = Number(value);
        if (isNaN(number)) throw new InvalidArgumentError("Not a number.");
        return number;
      })
  )
  .addOption(
    new Option("-n, --notifications <type>", "Where to send notifications?")
      .makeOptionMandatory()
      .choices(["telegram"])
  )
  .addOption(
    new Option(
      "--telegram-token <token>",
      "The telegram bot token. Mandatory if `notifications=telegram` https://core.telegram.org/bots/api"
    )
  )
  .addOption(
    new Option(
      "-t, --notification-timeout <seconds>",
      "Do not notify about the same coin more often than N seconds."
    )
      .default(2 * 3600)
      .argParser((value) => {
        const number = Number(value);
        if (isNaN(number)) throw new InvalidArgumentError("Not a number.");
        return number;
      })
  )
  .action(
    async ({
      interval,
      telegramChatId,
      telegramToken,
      notificationTimeout,
    }) => {
      const deduplicator = new Deduplicator(notificationTimeout);

      const getMatchingLatest = async () => {
        const latest = await getLatest();
        const filtered = filterLatest(latest);
        const deduped = filtered.filter(({ address }) => {
          if (deduplicator.isFresh(address)) {
            deduplicator.hit(address);
            return true;
          }
          return false;
        });

        logger.info(
          `Latest | All: ${latest.length} | Filtered ${filtered.length} | Deduplicated: ${deduped.length}`
        );

        const coins = await Promise.all(
          deduped.map((record) => getCoin(record.address))
        );

        return sortBy(coins, (coin) => coin.last5m).slice(0, 2);
      };

      const getMatchingTrending = async () => {
        const trending = await getTrending();
        const filtered = filterTrending(trending);
        const deduped = filtered.filter(({ address }) => {
          if (deduplicator.isFresh(address)) {
            deduplicator.hit(address);
            return true;
          }
          return false;
        });

        logger.info(
          `Latest | All: ${trending.length} | Filtered ${filtered.length} | Deduplicated: ${deduped.length}`
        );

        const coins = await Promise.all(
          deduped.map((record) => getCoin(record.address))
        );

        return sortBy(coins, (coin) => coin.last1h).slice(0, 2);
      };

      while (true) {
        const latest = await getMatchingLatest();
        if (latest.length)
          sendTelegramNotification({
            chatId: telegramChatId,
            coins: latest,
            token: telegramToken,
            type: "latest",
          });
        else {
          const trending = await getMatchingTrending();
          sendTelegramNotification({
            chatId: telegramChatId,
            coins: trending,
            token: telegramToken,
            type: "trending",
          });
        }

        logger.info(`Sleeping for ${interval} seconds.`);
        await sleep(interval * 1000);
      }
    }
  )
  .parseAsync();
