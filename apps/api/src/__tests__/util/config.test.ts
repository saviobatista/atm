import config from "../../util/config";

describe("util/config", () => {
  it("contains valid settings", async () => {
    expect(config).toHaveProperty("server");
  });
});
