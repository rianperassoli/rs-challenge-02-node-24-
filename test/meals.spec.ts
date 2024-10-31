import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import supertest from "supertest";
import { app } from "../src/app";

describe("Meals Routes", () => {
  const username = "user";
  const password = "password";
  let cookies: string[] = [];

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");

    await supertest(app.server)
      .post("/users")
      .send({
        username,
        password,
      })
      .expect(201);

    const authResponse = await supertest(app.server)
      .post("/auth")
      .send({
        username,
        password,
      })
      .expect(202);

    cookies = authResponse.get("Set-Cookie") || [];
  });

  it("should be able to create a new meal", async () => {
    await supertest(app.server)
      .post("/meals")
      .send({
        name: "Meal 1",
        description: "rice and beans",
        meal_date: new Date().toISOString(),
        diet: true,
      })
      .set("Cookie", cookies)
      .expect(201);
  });

  it("should be able to remove a meal", async () => {
    await supertest(app.server)
      .post("/meals")
      .send({
        name: "Meal 1",
        description: "rice and beans",
        meal_date: new Date().toISOString(),
        diet: true,
      })
      .set("Cookie", cookies)
      .expect(201);

    const mealsResponse = await supertest(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealId = mealsResponse.body.meals[0].id;

    await supertest(app.server)
      .delete(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .expect(200);
  });

  it("should be able to edit a meal", async () => {
    await supertest(app.server)
      .post("/meals")
      .send({
        name: "Meal 1",
        description: "rice and beans",
        meal_date: "2024-10-10 12:00:00",
        diet: false,
      })
      .set("Cookie", cookies)
      .expect(201);

    const mealsResponse = await supertest(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealId = mealsResponse.body.meals[0].id;

    await supertest(app.server)
      .put(`/meals/${mealId}`)
      .send({
        name: "Meal 2",
        description: "Great meal",
        meal_date: "2024-11-11 12:00:00",
        diet: true,
      })
      .set("Cookie", cookies)
      .expect(204);

    const mealUpdatedResponse = await supertest(app.server)
      .get(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(mealUpdatedResponse.body.meal.name).toEqual("Meal 2");
    expect(mealUpdatedResponse.body.meal.description).toEqual("Great meal");
    expect(
      new Date(mealUpdatedResponse.body.meal.meal_date).toISOString()
    ).toEqual(new Date("2024-11-11 12:00:00").toISOString());
    expect(!!mealUpdatedResponse.body.meal.diet).toEqual(true);
  });

  it("should be able to list all meals", async () => {
    await supertest(app.server)
      .post("/meals")
      .send({
        name: "Meal 1",
        description: "rice and beans",
        meal_date: "2024-10-10 12:00:00",
        diet: false,
      })
      .set("Cookie", cookies)
      .expect(201);
    await supertest(app.server)
      .post("/meals")
      .send({
        name: "Meal 2",
        description: "rice and beans",
        meal_date: "2024-10-10 12:00:00",
        diet: true,
      })
      .set("Cookie", cookies)
      .expect(201);
    await supertest(app.server)
      .post("/meals")
      .send({
        name: "Meal 3",
        description: "rice and beans",
        meal_date: "2024-10-10 12:00:00",
        diet: false,
      })
      .set("Cookie", cookies)
      .expect(201);

    const mealsResponse = await supertest(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    expect(mealsResponse.body.meals.length).toEqual(3);
  });

  it("should be able to get a specific meal", async () => {
    await supertest(app.server)
      .post("/meals")
      .send({
        name: "Meal 1",
        description: "rice and beans",
        meal_date: "2024-10-10 12:00:00",
        diet: true,
      })
      .set("Cookie", cookies)
      .expect(201);

    const mealsResponse = await supertest(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealId = mealsResponse.body.meals[0].id;

    await supertest(app.server)
      .get(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .expect(200);

    const mealUpdatedResponse = await supertest(app.server)
      .get(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(mealUpdatedResponse.body.meal.name).toEqual("Meal 1");
    expect(mealUpdatedResponse.body.meal.description).toEqual("rice and beans");
    expect(
      new Date(mealUpdatedResponse.body.meal.meal_date).toISOString()
    ).toEqual(new Date("2024-10-10 12:00:00").toISOString());
    expect(!!mealUpdatedResponse.body.meal.diet).toEqual(true);
  });

  it("should be able to get the summary", async () => {
    await supertest(app.server)
      .post("/meals")
      .send({
        name: "Meal 1",
        description: "rice and beans",
        meal_date: "2024-09-10 10:00:00",
        diet: false,
      })
      .set("Cookie", cookies)
      .expect(201);
    await supertest(app.server)
      .post("/meals")
      .send({
        name: "Meal 2",
        description: "rice and beans",
        meal_date: "2024-09-10 11:00:00",
        diet: true,
      })
      .set("Cookie", cookies)
      .expect(201);
    await supertest(app.server)
      .post("/meals")
      .send({
        name: "Meal 3",
        description: "rice and beans",
        meal_date: "2024-09-10 12:00:00",
        diet: true,
      })
      .set("Cookie", cookies)
      .expect(201);
    await supertest(app.server)
      .post("/meals")
      .send({
        name: "Meal 3",
        description: "rice and beans",
        meal_date: "2024-09-10 13:00:00",
        diet: false,
      })
      .set("Cookie", cookies)
      .expect(201);

    const mealsResponse = await supertest(app.server)
      .get("/meals/summary")
      .set("Cookie", cookies)
      .expect(200);

    expect(mealsResponse.body.summary.totalMeals).toEqual(4);
    expect(mealsResponse.body.summary.mealsOnDiet).toEqual(2);
    expect(mealsResponse.body.summary.mealsOnNonDiet).toEqual(2);
    expect(mealsResponse.body.summary.bestSequenceOnDiet).toEqual(2);
  });
});
