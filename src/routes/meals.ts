import { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { knex } from "../database";
import { checkUserIdExists } from "../middlewares/check-session-id-exist";

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [checkUserIdExists],
    },
    async (request) => {
      const { userId } = request.cookies;

      const meals = await knex("meals")
        .where("user_id", userId)
        .select()
        .orderBy("meal_date", "desc");

      return { meals };
    }
  );

  app.get(
    "/:id",
    {
      preHandler: [checkUserIdExists],
    },
    async (request) => {
      const getMealsParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getMealsParamsSchema.parse(request.params);

      const { userId } = request.cookies;

      const meal = await knex("meals")
        .where({
          user_id: userId,
          id,
        })
        .first();

      return {
        meal,
      };
    }
  );

  app.delete(
    "/:id",
    {
      preHandler: [checkUserIdExists],
    },
    async (request, reply) => {
      const getMealsParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getMealsParamsSchema.parse(request.params);

      const { userId } = request.cookies;

      await knex("meals").delete().where({ id, user_id: userId });

      return reply.status(200).send();
    }
  );

  app.get(
    "/summary",
    {
      preHandler: [checkUserIdExists],
    },
    async (request) => {
      const { userId } = request.cookies;

      const summaryMeals = await knex("meals")
        .select(["meal_date", "diet"])
        .where("user_id", userId)
        .orderBy("meal_date", "desc");

      let currentSequence = 0;

      const summary = summaryMeals.reduce(
        (acc, meal) => {
          const { diet } = meal;

          acc.totalMeals++;
          acc.mealsOnDiet += diet ? 1 : 0;
          acc.mealsOnNonDiet += !diet ? 1 : 0;

          currentSequence = diet ? currentSequence + 1 : 0;

          if (acc.bestSequenceOnDiet < currentSequence) {
            acc.bestSequenceOnDiet = currentSequence;
          }

          return acc;
        },
        {
          totalMeals: 0,
          mealsOnDiet: 0,
          mealsOnNonDiet: 0,
          bestSequenceOnDiet: 0,
        }
      );

      return { summary };
    }
  );

  app.put(
    "/:id",
    {
      preHandler: [checkUserIdExists],
    },
    async (request, reply) => {
      const getMealsParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getMealsParamsSchema.parse(request.params);

      const createMealBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        meal_date: z.string().optional(),
        diet: z.boolean().optional(),
      });

      const dataToUpdate = createMealBodySchema.parse(request.body);

      const { userId } = request.cookies;

      const meal = await knex("meals")
        .select()
        .where({ id, user_id: userId })
        .first();

      if (!meal) {
        return reply.status(404).send();
      }

      const newData = {
        name: dataToUpdate?.name ?? meal.name,
        description: dataToUpdate?.description ?? meal.description,
        meal_date: dataToUpdate?.meal_date
          ? new Date(dataToUpdate.meal_date).toISOString()
          : meal.meal_date,
        diet: dataToUpdate?.diet !== null ? dataToUpdate.diet : meal.diet,
        updated_at: new Date().toISOString(),
      };

      await knex("meals").update(newData).where({ id, user_id: userId });

      return reply.status(204).send();
    }
  );

  app.post(
    "/",
    {
      preHandler: [checkUserIdExists],
    },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        meal_date: z.string(),
        diet: z.boolean(),
      });

      const { name, description, meal_date, diet } = createMealBodySchema.parse(
        request.body
      );

      const { userId } = request.cookies;

      await knex("meals").insert({
        id: randomUUID(),
        name,
        description,
        meal_date: new Date(meal_date).toISOString(),
        diet,
        user_id: userId,
      });

      return reply.status(201).send();
    }
  );
}
