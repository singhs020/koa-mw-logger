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
const next = stub().resolves();
const nextError = stub().rejects({"message": "Test"});
const request = {
  "href": "foo",
  "method": "Get",
  "type": "test",
  "ip": "ipTest"
};
const response = {
  "status": 200,
  "message": "OK"
};
const ctx = {
  "request": request,
  "response": response
};
const clock = useFakeTimers();

describe("The middleware", () => {
  after(() => {
    clock.restore();
  });

  describe("when the request is complete", () => {
    before(async() => {
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
          "ip": request.ip,
          "method": request.method,
          "query": {},
          "type": request.type,
          "url": request.href
        },
        "response": {
          "status": response.status,
          "message": response.message
        },
        "start": new Date().toUTCString(),
        "taken": 0
      });
    });
  });

  describe("when there is an error in the request", () => {
    before(async() => {
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
          "ip": request.ip,
          "method": request.method,
          "query": {},
          "type": request.type,
          "url": request.href
        },
        "response": {
          "status": response.status,
          "message": response.message
        },
        "start": new Date().toUTCString(),
        "taken": 0
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
