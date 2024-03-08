/* eslint-disable no-shadow */
const winston = require('winston');

const replacer = (key, value) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

const { format, transports } = winston;
const {
  combine, timestamp, json, colorize, printf,
} = format;

const logFormat = combine(
  timestamp(),
  json({ replacer }),
);

const consoleFormat = combine(
  colorize(),
  timestamp(),
  printf(({
    level, message, timestamp, ...meta
  }) => {
    let formattedMessage = `${timestamp} ${level}: ${message}`;
    if (Object.keys(meta).length) {
      try {
        formattedMessage += ` ${JSON.stringify(meta, replacer)}`;
      } catch (exc) {
        console.error('Error stringify meta', exc, meta);
      }
    }
    return formattedMessage;
  }),
);

const logger = winston.createLogger({
  format: logFormat,
  transports: [
    new transports.File({ filename: 'logs/combined.log' }),
    new transports.File({
      filename: 'logs/errors.log',
      level: 'error',
    }),
    new transports.Console({ format: consoleFormat }),
  ],
});

module.exports = { logger };
