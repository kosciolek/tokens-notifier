import { InvalidArgumentError, Option, program } from "commander";
import { getCoin } from "./coin";
import { filterLatest, filterTrending } from "./filters";
import { getLatest } from "./latest";
import { logger } from "./logger";
import { getTrending } from "./trending";
import { generateTimestampedFilename, sleep } from "./utils";
import * as fs from "node:fs";
import { sendTelegramNotification } from "./notifications/telegram";
import { Deduplicator } from "./deduplicator";

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
      "--telegram-chat-id <chat-id>",
      "The telegram chat id. Mandatory if `notifications=telegram`"
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
      notifications,
      telegramChatId,
      telegramToken,
      notificationTimeout,
    }) => {
      const deduplicator = new Deduplicator(notificationTimeout);

      while (true) {
        const latest = await getLatest();
        const filtered = filterLatest(latest);

        if (filtered.length) {
          const coins = await Promise.all(
            filtered.map((record) => getCoin(record.address))
          );

          const dedupedCoins = coins.filter(({ address }) => {
            if (deduplicator.isFresh(address)) {
              deduplicator.hit(address);
              return true;
            }

            return false;
          });

          const filePath = generateTimestampedFilename("tokens.txt");
          logger.info(
            `Matching coins found in latest: ${filtered.length}, new: ${dedupedCoins.length}, writing to ${filePath}`
          );
          fs.writeFileSync(filePath, JSON.stringify(dedupedCoins, null, 2));
          if (notifications === "telegram")
            sendTelegramNotification({
              chatId: telegramChatId,
              coins: dedupedCoins,
              token: telegramToken,
              type: "latest",
            });
        } else {
          logger.info("No matching coins found in trending.");
          const trending = await getTrending();
          const filtered = filterTrending(trending);
          if (filtered.length) {
            const coins = await Promise.all(
              filtered.map((record) => getCoin(record.address))
            );

            const dedupedCoins = coins.filter(({ address }) => {
              if (deduplicator.isFresh(address)) {
                deduplicator.hit(address);
                return true;
              }

              return false;
            });

            const filePath = generateTimestampedFilename("tokens.txt");
            logger.info(
              `Matching coins found in trending: ${filtered.length}, new: ${dedupedCoins.length}, writing to ${filePath}`
            );
            fs.writeFileSync(filePath, JSON.stringify(dedupedCoins, null, 2));

            if (notifications === "telegram")
              sendTelegramNotification({
                chatId: telegramChatId,
                coins: dedupedCoins,
                token: telegramToken,
                type: "trending",
              });
          } else {
            logger.info(`No matching coins found in latest.`);
          }
        }

        logger.info(`Sleeping for ${interval} seconds.`);
        await sleep(interval * 1000);
      }
    }
  )
  .parseAsync();
