# koa-mw-logger
Koa middleware for logging

## How to use
```
const Koa = require("koa");
const getLogger = require("koa-mw-logger");

const app = Koa();

app.use(getLogger());
```

## Config
There is an option to pass in the config as per the following structure to define some properties of logger.
