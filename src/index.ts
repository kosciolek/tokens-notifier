import { InvalidArgumentError, Option, program } from "commander";
import { getCoin } from "./coin";
import { logger } from "./logger";
import { getTrending } from "./trending";
import { sleep, sortBy } from "./utils";
import { sendTelegramNotification } from "./notifications/telegram";
import { Deduplicator } from "./deduplicator";
import { filterCoins, filterRecords } from "./trending/filter";
import { Coin } from "./coin/types";

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
      .default(60)
  )
  .addOption(
    new Option("-n, --notifications <type>", "Where to send notifications?")
      .makeOptionMandatory()
      .choices(["telegram"])
  )
  .addOption(
    new Option(
      "--telegram-token <token>",
      "The telegram bot token. https://core.telegram.org/bots/api"
    )
  )
  .addOption(
    new Option(
      "--telegram-chat-id <chat-id>",
      "The telegram chat id. Mandatory if `notifications=telegram`"
    )
  )
  .addOption(
    new Option(
      "-t, --notification-timeout <seconds>",
      "Do not notify about the same coin more often than N seconds."
    )
      .default(3600)
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

      /* There's usually 40+ coins, fetch them in a few rounds instead of all at once */
      const getInRounds = async (addresses: string[]) => {
        const perRound = 8;
        const rounds = Math.ceil(addresses.length / perRound);
        const coins: (Coin | undefined)[] = [];

        for (let i = 0; i < rounds; i++) {
          const slicedAddresses = addresses.slice(
            i * perRound,
            i * perRound + perRound
          );
          const fetched = await Promise.all(
            slicedAddresses.map((address) => getCoin(address))
          );
          coins.push(...fetched);
        }
        return coins;
      };

      while (true) {
        const trending = await getTrending();
        const filteredRecords = filterRecords(trending);
        const coins = await getInRounds(
          filteredRecords.map((record) => record.address)
        );
        const withoutUndefined = coins.filter(
          (coin) => coin !== undefined
        ) as Coin[];
        const filteredCoins = filterCoins(withoutUndefined);
        const sorted = sortBy(filteredCoins, (coin) => coin.last1h);
        const deduped = sorted.filter(({ address }) => {
          return deduplicator.isFresh(address);
        });
        const top = deduped.slice(0, 1);
        top.forEach(({ address }) => deduplicator.hit(address));

        logger.info(
          `Trending | All: ${trending.length} | Filtered ${filteredCoins.length} | Deduplicated: ${deduped.length}`
        );

        if (top.length)
          sendTelegramNotification({
            chatId: telegramChatId,
            coins: top,
            token: telegramToken,
          });

        logger.info(`Sleeping for ${interval} seconds.`);
        await sleep(interval * 1000);
      }
    }
  )
  .parseAsync();
