const uuid = require("uuid/v4");

function generateReqId() {
  return uuid();
}

function wrapObj(obj) {
  return Object.assign({}, {reqId}, obj);
}

function getLogger(logger, reqId) {
  const info = (obj) => logger.info(wrapObj(obj, reqId)); 
  const debug = (obj) => logger.debug(wrapObj(obj, reqId)); 
  const error = (obj) => logger.error(wrapObj(obj, reqId)); 

  return {
    info,
    debug,
    error
  };
}

function logCompletion(logger, reqInfo) {
  const endTime = new Date().toUTCString();
  const obj = {
    "start": reqInfo.start,
    "end": endTime,
    "taken": (new Date(endTime) - new Date(reqInfo.start))
  };

  logger.info(obj);
}

function createMiddleware(logger) {
  return async(ctx, next) => {
    const reqId = generateReqId();
    const loggerObj = getLogger(logger, reqId);
    ctx.logger = loggerObj;
    ctx.reqInfo = {
      "start": new Date().toUTCString(),
      "reqId": reqId
    };

    await next();
    logCompletion(loggerObj, ctx.reqInfo);

    return next();
  };
}

module.exports = createMiddleware;
