const pino = require("pino");

const createMw = require("./middleware");

function getOpts(config) {
  const opts = {};
  opts.name = config.name || "mw-logger";
  opts.recordIp = config.recordIp || false;
  
  return {
    "loggerOpts": {
      "name": opts.name
    },
    "mwOpts": {
      "recordIp": opts.recordIp
    }
  };
}

function getMw(config = {}) {
  const {loggerOpts, mwOpts} = getOpts(config);
  const logger = pino(loggerOpts);
  
  return createMw(logger, mwOpts);
}

module.exports = getMw;
