import supertest from "supertest";

import server from "../src/server";

describe("Service integration tests", () => {
  test("test endpoint returns alive message", async () => {
    const response = await supertest(server).get("/test");

    expect(response.status).toEqual(200);
    expect(response.text).toEqual("I am alive...");
  });

  test("settlement endpoint returns 501", async () => {
    const response = await supertest(server).get(
      "/merchant/test-merchant/settlement/DATE"
    );

    expect(response.status).toEqual(501);
    expect(response.text).toEqual("Not yet implemented");
  });
});
