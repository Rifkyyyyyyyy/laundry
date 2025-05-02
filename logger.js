// logger.js
const winston = require('winston');

// Format untuk log
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  let levelColor;
  switch(level) {
    case 'info':
      levelColor = '\x1b[32m'; // Green
      break;
    case 'warn':
      levelColor = '\x1b[33m'; // Yellow
      break;
    case 'error':
      levelColor = '\x1b[31m'; // Red
      break;
    default:
      levelColor = '\x1b[37m'; // Default White
  }
  return `${timestamp} [${levelColor}${level}\x1b[39m]: ${message}`;
});

// Membuat logger dengan Winston
const logger = winston.createLogger({
  level: 'info', // Level default adalah info, bisa diubah ke level yang lebih tinggi seperti warn atau error
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Custom timestamp format
    winston.format.colorize(), // Mewarnai level log
    logFormat
  ),
  transports: [
    // Output log ke console (terminal)
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat)
    })
  ]
});

module.exports = logger;
