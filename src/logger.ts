import winston, { createLogger } from "winston";

export const logger = createLogger({
  transports: [
    new winston.transports.File({
      filename: "logs.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
      ),
    }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});
