import { InvalidArgumentError, Option, program } from "commander";
import { getCoin } from "./coin";
import { filterLatest, filterTrending } from "./filters";
import { getLatest } from "./latest";
import { logger } from "./logger";
import { getTrending } from "./trending";
import { generateTimestampedFilename, sleep } from "./utils";
import * as fs from "node:fs";
import { notify } from "./notifications";

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
      .preset("local")
      .choices(["silent", "system", "telegram"])
  )
  .action(async ({ interval, notifications }) => {
    while (true) {
      const latest = await getLatest();
      const filtered = filterLatest(latest);

      if (filtered.length) {
        const coins = await Promise.all(
          filtered.map((record) => getCoin(record.address))
        );

        const filePath = generateTimestampedFilename("tokens.txt");
        logger.info(
          `Matching coins found in latest: ${filtered.length}, writing to ${filePath}`
        );
        fs.writeFileSync(filePath, JSON.stringify(coins, null, 2));
        if (notifications === "system")
          notify("latest", filtered.length, filePath);
      } else {
        logger.info("No matching coins found in trending, checking latest");
        const trending = await getTrending();
        const filtered = filterTrending(trending);
        if (filtered.length) {
          const coins = await Promise.all(
            filtered.map((record) => getCoin(record.address))
          );

          const filePath = generateTimestampedFilename("tokens.txt");
          logger.info(
            `Matching coins found in trending: ${filtered.length}, writing to ${filePath}`
          );
          fs.writeFileSync(filePath, JSON.stringify(coins, null, 2));
          if (notifications === "system")
            notify("trending", filtered.length, filePath);
        }
      }

      logger.info(`Sleeping for ${interval} seconds.`);
      await sleep(interval * 1000);
    }
  })
  .parseAsync();
