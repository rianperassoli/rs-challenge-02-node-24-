import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import supertest from "supertest";
import { app } from "../src/app";

describe("Auth Routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should be able to authenticate and user", async () => {
    const username = "user";
    const password = "password";

    await supertest(app.server)
      .post("/users")
      .send({
        username,
        password,
      })
      .expect(201);

    const response = await supertest(app.server)
      .post("/auth")
      .send({
        username,
        password,
      })
      .expect(202);

    const cookies = response.get("Set-Cookie") || [];

    expect(
      cookies.findIndex((cookie) => cookie.includes("userId="))
    ).greaterThanOrEqual(0);
  });
});
