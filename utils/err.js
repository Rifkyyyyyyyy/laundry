// app.js
const logger = require('../logger');

// Fungsi log untuk success
const logSuccess = (message) => {
  logger.info(`Success: ${message}`);
};

// Fungsi log untuk warning
const logWarning = (message) => {
  logger.warn(`Warning: ${message}`);
};

// Fungsi log untuk error
const logError = (message) => {
  logger.error(`Error: ${message}`);
};

// Fungsi log untuk general info
const logInfo = (message) => {
  logger.info(`Info: ${message}`);
};

module.exports = {
    logError ,
    logInfo ,
    logWarning ,
    logSuccess
}