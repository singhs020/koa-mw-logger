const {expect} = require("chai");
const {stub, spy, useFakeTimers} = require("sinon");
const proxyquire = require("proxyquire");

proxyquire.noCallThru();
proxyquire.noPreserveCache();

const createLoggerMw = proxyquire("../src/middleware", {
  "uuid": {"v4": stub().returns("foo:bar")}
});

const logger = {
  "info": spy(),
  "error": spy()
};
const mw = createLoggerMw(logger);
const mwWithOpts = createLoggerMw(logger, {"recordIp": true, "recordHeaders": true});
const next = stub().resolves();
const nextError = stub().rejects({"message": "Test"});
const request = {
  "href": "foo",
  "method": "Get",
  "type": "test",
  "ip": "ipTest",
  "headers": {}
};
const response = {
  "status": 200,
  "message": "OK"
};
const ctx = {
  "headers": request.headers,
  "request": request,
  "response": response
};
const clock = useFakeTimers();

describe("The Middleware", () => {
  after(() => {
    clock.restore();
  });

  describe("The middleware without options", () => {

    describe("when the request is complete", () => {
      before(async() => {
        logger.info.resetHistory();
        logger.error.resetHistory();
        await mw(ctx, next);
      });
  
      it("should attach a logger with ctx", () => {
        expect(ctx.logger).to.be.exist;
      });
  
      it("should log well transformed object on request compeletion", () => {
        expect(logger.info.firstCall.args[0]).to.deep.equal({
          "end": new Date().toUTCString(),
          "reqId": "foo:bar",
          "error": {},
          "request": {
            "ip": "Ip recording is not enabled",
            "method": request.method,
            "query": {},
            "type": request.type,
            "url": request.href,
            "headers": "Header Recording is not enabled"
          },
          "response": {
            "status": response.status,
            "message": response.message
          },
          "start": new Date().toUTCString(),
          "taken": 0,
          "customCtx": {}
        });
      });
    });

    describe("when the request is complete and customCtx was attached to the request", () => {
      before(async() => {
        logger.info.resetHistory();
        logger.error.resetHistory();
        const next = () => Promise.resolve()
        .then(() => {
          ctx.addCustomLogCtx({"custom": true});
          ctx.addCustomLogCtx("custom");
        });
        await mw(ctx, next);
      });
  
      it("should log well transformed object on request compeletion", () => {
        expect(logger.info.firstCall.args[0]).to.deep.equal({
          "end": new Date().toUTCString(),
          "reqId": "foo:bar",
          "error": {},
          "request": {
            "ip": "Ip recording is not enabled",
            "method": request.method,
            "query": {},
            "type": request.type,
            "url": request.href,
            "headers": "Header Recording is not enabled"
          },
          "response": {
            "status": response.status,
            "message": response.message
          },
          "start": new Date().toUTCString(),
          "taken": 0,
          "customCtx": {
            "custom": true,
            "message": "cannot append custom context from one of the calls as it is not an object"
          }
        });
      });
    });
  
    describe("when there is an error in the request", () => {
      before(async() => {
        logger.info.resetHistory();
        logger.error.resetHistory();
        await mw(ctx, nextError);
      });
  
      it("should attach a logger with ctx", () => {
        expect(ctx.logger).to.be.exist;
      });
  
      it("should log well transformed object on request compeletion", () => {
        expect(logger.error.firstCall.args[0]).to.deep.equal({
          "end": new Date().toUTCString(),
          "reqId": "foo:bar",
          "error": {
             "message": "Test",
             "stack": undefined,
             "type": "Object",
          },
          "request": {
            "ip": "Ip recording is not enabled",
            "method": request.method,
            "query": {},
            "type": request.type,
            "url": request.href,
            "headers": "Header Recording is not enabled"
          },
          "response": {
            "status": response.status,
            "message": response.message
          },
          "start": new Date().toUTCString(),
          "taken": 0,
          "customCtx": {}
        });
      });
    });
  
    describe("when the attached logger is used", () => {
      beforeEach(async() => {
        logger.info.resetHistory();
        logger.error.resetHistory();
        await mw(ctx, next);
      });
  
      describe("when the logged data is valid", () => {
        it("should log the data", () => {
          ctx.logger.error({"foo": "bar"});
          expect(logger.error.calledOnce).to.be.true;
        });
      });
  
      describe("when the logged data is invalid", () => {
        it("should log the data", () => {
          ctx.logger.error("test");
          expect(logger.error.calledWith({
            "message": "the data must be an object"
          })).to.be.true;
        });
      });
  
      describe("when the logged data is null or undefined", () => {
        it("should log the data", () => {
          ctx.logger.error();
          expect(logger.error.calledOnce).to.be.true;
        });
      });
    });
  });
  
  describe("The middleware with options", () => {
    describe("when the request is complete", () => {
      before(async() => {
        logger.info.resetHistory();
        logger.error.resetHistory();
        await mwWithOpts(ctx, next);
      });
  
      it("should attach a logger with ctx", () => {
        expect(ctx.logger).to.be.exist;
      });
  
      it("should log well transformed object on request compeletion", () => {
        expect(logger.info.firstCall.args[0]).to.deep.equal({
          "end": new Date().toUTCString(),
          "reqId": "foo:bar",
          "error": {},
          "request": {
            "ip": request.ip,
            "method": request.method,
            "query": {},
            "type": request.type,
            "url": request.href,
            "headers": {}
          },
          "response": {
            "status": response.status,
            "message": response.message
          },
          "start": new Date().toUTCString(),
          "taken": 0,
          "customCtx": {}
        });
      });
    });

    describe("when the request has authorization header", () => {
      before(async() => {
        logger.info.resetHistory();
        logger.error.resetHistory();
        ctx.request.headers = {
          "authorization": "foo:bar"
        };
        await mwWithOpts(ctx, next);
      });

      after(async() => {
        logger.info.resetHistory();
        logger.error.resetHistory();
        ctx.request.headers = {};
        await mwWithOpts(ctx, next);
      });
  
      it("should log well transformed object on request compeletion", () => {
        expect(logger.info.firstCall.args[0]).to.deep.equal({
          "end": new Date().toUTCString(),
          "reqId": "foo:bar",
          "error": {},
          "request": {
            "ip": request.ip,
            "method": request.method,
            "query": {},
            "type": request.type,
            "url": request.href,
            "headers": {
              "authorization": "OBFUSCATE"
            }
          },
          "response": {
            "status": response.status,
            "message": response.message
          },
          "start": new Date().toUTCString(),
          "taken": 0,
          "customCtx": {}
        });
      });
    });
  });  
});

