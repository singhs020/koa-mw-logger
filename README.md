# koa-mw-logger

[![NPM](https://nodei.co/npm/koa-mw-logger.png?downloads=true)](https://www.npmjs.com/package/koa-mw-logger/)

Koa middleware for logging

## What it does
- Every time a request is received, a request id will forwarded or generated and attached to the ctx. It reads the following header keys for re-using the request id: *x-request-id*, *x-amzn-RequestId* and *requestId*.
- At the completion of the request, it will log the completion of the request with some useful information like request headers, response status code and message, any custom log context attached to it etc.
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
  "recordHeaders": false // whether to extract and record request headers from the request object or not. Default value is false It will also obfuscate some headers from logging them.
  "excludePaths": [] // strings to match against the path. If the path includes those strings, the log will not be printed.
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

## Graphql Partial Errors
If you are using the middleware with a Graphql server implemented using Koa, the partial errors from resolvers are also logged by this middleware. The response in case of the partial error is returned as 200 with errors in the body for a graphql API. The middleware will look for a key `errors` in the response and will log it in `error` object.

## Support or Contact
Having trouble with koa-mw-logger or have any questions? Please raise an issue.
