const pino = require("pino");

const createMw = require("./middleware");

function getOpts(config) {
  const opts = {};
  opts.name = config.name || "mw-logger";

  return opts;
}

function getMw(config = {}) {
  const opts = getOpts(config);
  const logger = pino(opts);

  return createMw(logger);
}

module.exports = getMw;
