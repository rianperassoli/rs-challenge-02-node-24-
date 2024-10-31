import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import supertest from "supertest";
import { app } from "../src/app";

describe("Users Routes", () => {
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

  it("should be able to create a new user", async () => {
    await supertest(app.server)
      .post("/users")
      .send({
        username: "user",
        password: "password",
      })
      .expect(201);
  });

  it("should be able to get a specific user", async () => {
    const username = "user";
    const password = "password";

    await supertest(app.server)
      .post("/users")
      .send({
        username,
        password,
      })
      .expect(201);

    const userResponse = await supertest(app.server)
      .get(`/users/${username}`)
      .expect(200);

    expect(userResponse.body.user.username).toEqual(username);
    expect(userResponse.body.user.password).toEqual(password);
  });
});
