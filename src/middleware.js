const uuid = require("uuid/v4");

function generateReqId() {
  return uuid();
}

function wrapObj(reqId, data = {}) {
  if (Array.isArray(data) || typeof data !== "object") {
    return {
      "message": "the data must be an object"
    };
  }
  return Object.assign({}, {reqId}, data);
}


function getLogger(logger, reqId) {
  const info = (obj) => logger.info(wrapObj(reqId, obj)); 
  const debug = (obj) => logger.debug(wrapObj(reqId, obj)); 
  const error = (obj) => logger.error(wrapObj(reqId, obj)); 

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
    "taken": (new Date(endTime) - new Date(reqInfo.start)),
    "reqId": reqInfo.reqId,
    "request": reqInfo.request
  };

  logger.info(obj);
}

function getReqLog(req) {
  return {
    "url": req.href,
    "method": req.method,
    "query": req.query || {},
    "type": req.type,
    "ip": req.ip
  };
}

function createMiddleware(logger) {
  return async(ctx, next) => {
    const reqId = generateReqId();
    const loggerObj = getLogger(logger, reqId);
    ctx.logger = loggerObj;
    ctx.reqInfo = {
      "start": new Date().toUTCString(),
      "reqId": reqId,
      "request": getReqLog(ctx.request)
    };

    await next();

    return logCompletion(loggerObj, ctx.reqInfo);
  };
}

module.exports = createMiddleware;
