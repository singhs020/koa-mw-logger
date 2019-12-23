const {createLogger} = require("bunyan");

const createMw = require("./middleware");

function getOpts(config) {
  const opts = {};
  opts.level = config.level || "info";
  opts.name = config.name || "logger";

  return opts;
}

function getMw(config = {}) {
  const opts = getOpts(config);
  const logger = createLogger(opts);

  return createMw(logger);
}

module.exports = getMw;
