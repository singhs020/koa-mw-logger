const {"v4": uuid} = require("uuid");

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
    "request": reqInfo.request,
    "response": reqInfo.response
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

function getResLog(res) {
  return {
    "status": res.status,
    "message": res.message
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

    // Add response properties
    const info = Object.assign({}, ctx.reqInfo, {"response": getResLog(ctx.response)});

    return logCompletion(loggerObj, info);
  };
}

module.exports = createMiddleware;
