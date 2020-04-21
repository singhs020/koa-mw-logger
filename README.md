# koa-mw-logger

![Travis badge](https://travis-ci.org/singhs020/koa-mw-logger.svg?branch=master) 

[![NPM](https://nodei.co/npm/koa-mw-logger.png?downloads=true)](https://www.npmjs.com/package/koa-mw-logger/)

Koa middleware for logging

## What it does
- Every time a request is received, a request id will be generated and attached to the ctx.
- At the completion of the request, it will log the completion of the request with some useful information.
- It will also attach a logger instance at the ctx. It can be used to log the objects. Every call to the logging the object will be appended by the request id generated during the start of the request.

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
}
```

## Config
There is an option to pass in the config as per the following structure to define some properties of logger.

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
