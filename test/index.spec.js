const {expect} = require("chai");

const getLoggerMw = require("../src");

const config = {
  "name": "foo"
};

describe("The middleware", () => {
  describe("when config is passed", () => {
    it("should return a async function", () => {
      const mw = getLoggerMw(config);
      expect(typeof mw).to.equal("function");
    });
  });

  describe("when config is not passed", () => {
    it("should return a async function", () => {
      const mw = getLoggerMw();
      expect(typeof mw).to.equal("function");
    });
  });
});
