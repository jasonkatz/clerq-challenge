import supertest from "supertest";

import server from "../src/server";

describe("Service integration tests", () => {
  test("test endpoint returns alive message", async () => {
    const response = await supertest(server).get("/test");

    expect(response.status).toEqual(200);
    expect(response.text).toEqual("I am alive...");
  });
});
