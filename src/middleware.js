const { v4: uuid } = require("uuid");

const headersToObfuscate = [
  "authorization",
  "x-apigateway-context",
  "x-apigateway-event",
  "x-forwarded-for",
];

function getReqId(headers) {
  return (
    headers["x-request-id"] ||
    headers["x-amzn-RequestId"] ||
    headers["requestId"] ||
    uuid()
  );
}

function wrapObj(reqId, data = {}) {
  if (Array.isArray(data) || typeof data !== "object") {
    return {
      message: "the data must be an object",
    };
  }
  return Object.assign({}, { reqId }, data);
}

function getLogger(logger, reqId) {
  const info = (obj) => logger.info(wrapObj(reqId, obj));
  const debug = (obj) => logger.debug(wrapObj(reqId, obj));
  const error = (obj) => logger.error(wrapObj(reqId, obj));

  return {
    info,
    debug,
    error,
  };
}

function logCompletion(logger, reqInfo, isError = false) {
  const endTime = new Date().toUTCString();
  const obj = {
    start: reqInfo.start,
    end: endTime,
    taken: new Date(endTime) - new Date(reqInfo.start),
    reqId: reqInfo.reqId,
    request: reqInfo.request,
    response: reqInfo.response,
    error: reqInfo.error || {},
    customCtx: reqInfo.customCtx,
  };

  isError === true ? logger.error(obj) : logger.info(obj);
}

function obfuscateHeaders(headers = {}) {
  const obfuscateObj = {};

  headersToObfuscate.forEach((key) => {
    if (headers[key]) obfuscateObj[key] = "OBFUSCATE";
  });

  return Object.assign({}, headers, obfuscateObj);
}

function getReqLog(req, mwOpts) {
  return {
    url: req.href,
    method: req.method,
    query: req.query || {},
    type: req.type,
    ip: mwOpts.recordIp === true ? req.ip : "Ip recording is not enabled",
    headers:
      mwOpts.recordHeaders === true
        ? obfuscateHeaders(req.headers)
        : "Header Recording is not enabled",
  };
}

function getResLog(res) {
  return {
    status: res.status,
    message: res.message,
  };
}

function addCustomLogCtx(ctx, obj) {
  if (Array.isArray(obj) || typeof obj !== "object") {
    ctx.reqInfo.customCtx = {
      ...ctx.reqInfo.customCtx,
      message:
        "cannot append custom context from one of the calls as it is not an object",
    };
    return;
  }

  ctx.reqInfo.customCtx = {
    ...ctx.reqInfo.customCtx,
    ...obj,
  };
}

function parseJsonString(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

function createMiddleware(logger, mwOpts = {}) {
  return async (ctx, next) => {
    const reqId = getReqId(ctx.headers);
    const loggerObj = getLogger(logger, reqId);
    let isError = false;

    ctx.logger = loggerObj;
    ctx.reqInfo = {
      start: new Date().toUTCString(),
      reqId: reqId,
      request: getReqLog(ctx.request, mwOpts),
      customCtx: {},
    };
    ctx.addCustomLogCtx = (obj) => addCustomLogCtx(ctx, obj);

    try {
      await next();

      // add error details if request is a bad request (HTTP Status 400)
      if (ctx.status === 400) {
        ctx.reqInfo.error = ctx.body;
      }

      const body =
        typeof ctx.body === "string" ? parseJsonString(ctx.body) : null;
      // catch Graphql errors in case of partial errors
      if (body && Array.isArray(body.errors)) {
        ctx.reqInfo.error = { errors: body.errors };
        isError = true;
      }
    } catch (err) {
      isError = true;
      ctx.status = 500;
      ctx.message = "Internal Server Error";
      ctx.reqInfo.error = {
        type: err.constructor.name,
        message: err.message,
        stack: err.stack,
      };
    } finally {
      const info = Object.assign({}, ctx.reqInfo, {
        response: getResLog(ctx.response),
      });

      const printLog =
        Array.isArray(mwOpts.excludePaths) && mwOpts.excludePaths.length > 0
          ? !mwOpts.excludePaths.some((item) => ctx.path.includes(item))
          : true;

      if (printLog) {
        logCompletion(loggerObj, info, isError);
      }
    }
  };
}

module.exports = createMiddleware;
