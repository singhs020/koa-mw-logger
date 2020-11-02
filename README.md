# koa-mw-logger

![Travis badge](https://travis-ci.org/singhs020/koa-mw-logger.svg?branch=master) [![Known Vulnerabilities](https://snyk.io/test/github/singhs020/koa-mw-logger/badge.svg)](https://snyk.io/test/github/singhs020/koa-mw-logger)

[![NPM](https://nodei.co/npm/koa-mw-logger.png?downloads=true)](https://www.npmjs.com/package/koa-mw-logger/)

Koa middleware for logging

## What it does
- Every time a request is received, a request id will forwarded or generated and attached to the ctx. It reds the following header keys for re-using the request id: *x-request-id*, *x-amzn-RequestId* and *requestId*.
- At the completion of the request, it will log the completion of the request with some useful information.
- It will also attach a logger instance at the ctx. It can be used to log the objects. Every call to the logging the object will be appended by the request id generated during the start of the request.
- Appends a function called addCustomLogCtx to add additional info to the final log statement.

## How to use
```
const Koa = require("koa");
const getLogger = require("koa-mw-logger");

const app = Koa();

app.use(getLogger());
```

to use it in a handler
```
async function handler(ctx, next) {
  const logger = ctx.logger;
  logger.info({"message": "logging something"});

  // to append custom log context to final staetment

  ctx.addCustomLogCtx = {
    "foo": "bar"
  };
}
```

## Config
There is an option to pass in the config as per the following structure to define some properties of logger.

```
// config structure
{
  "name": "foo", // name of the logger
  "recordIp": false // whether to extract and record ip from the request object or not. Default value is false.
}

```

```
const Koa = require("koa");
const getLogger = require("koa-mw-logger");

const config = {
  "name": "test"
};

const app = Koa();

app.use(getLogger(config));
```

## Support or Contact
Having trouble with koa-mw-logger or have any questions? Please raise an issue.
