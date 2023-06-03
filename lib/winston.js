const path = require("path");
const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

// Create a Winston logger instance
const logger = winston.createLogger({
    transports: [
        // Success logs
        new DailyRotateFile({
            filename: path.join(
                process.cwd(),
                "logs",
                "winston",
                "successes",
                "sku-%DATE%-success.log"
            ),
            datePattern: "YYYY-DD-MM-HH",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
            level: "info",
        }),

        // Error logs
        new DailyRotateFile({
            filename: path.join(
                process.cwd(),
                "logs",
                "winston",
                "error",
                "sku-%DATE%-error.log"
            ),
            level: "error",
            datePattern: "YYYY-DD-MM-HH",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
        }),

        // Warning logs
        new DailyRotateFile({
            filename: path.join(
                process.cwd(),
                "logs",
                "winston",
                "warn",
                "sku-%DATE%-warn.log"
            ),
            datePattern: "YYYY-DD-MM-HH",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
            level: "warn",
        }),
    ],
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
});

const stream = {
    write: (message) => {
        const errCodes = ["400", "401", "403", "404", "500"];
        const successCodes = ["200", "201", "202", "203", "204"];
        const warningCodes = ["301", "302", "303", "304", "305"];

        console.log(message);

        const statusCode = message.split(" ")[8];
        const method = message.split(" ")[5];
        const url = message.split(" ")[6];
        const time = message.split(" ")[7];
        const ip = message.split(" ")[0];

        const log = {
            statusCode,
            method,
            url,
            time,
            ip,
        };

        // if (errCodes.includes(statusCode)) {
        //     logger.error(log);
        // } else if (successCodes.includes(statusCode)) {
        //     logger.info(log);
        // } else if (warningCodes.includes(statusCode)) {
        //     logger.warn(log);
        // }

        logger.info(log);
    },
};

module.exports = { logger, stream };
