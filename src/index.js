const {createLogger} = require("bunyan");

function getMw(config = {}) {
  const opts = getOpts(config);
  const logger = createLogger(opts);

  return createMW(logger)
}

function getOpts(config) {
  const opts = {};
  opts.level = config.level || "info";
  opts.name = config.name || "logger";

  return opts;
}

module.exports = getMw;
