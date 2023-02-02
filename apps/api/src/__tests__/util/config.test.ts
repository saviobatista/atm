import supertest from "supertest";
import config from "../../util/config";

describe("util/config", () => {
  it("contains valid settings", async () => {
    supertest(config).contains("server");
  });
});
