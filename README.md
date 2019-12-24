# koa-mw-logger
Koa middleware for logging

## How to use
```
const Koa = require("koa");
const getLogger = require("koa-mw-logger");

const app = Koa();

app.use(getLogger());
```
