import { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { knex } from "../database";

export async function usersRoutes(app: FastifyInstance) {
  app.get("/:username", async (request, reply) => {
    const getUsersParamsSchema = z.object({
      username: z.string(),
    });

    const { username } = getUsersParamsSchema.parse(request.params);

    const user = await knex("users").where({ username }).first();

    return { user };
  });

  app.post("/", async (request, reply) => {
    const createUserBodySchema = z.object({
      username: z.string(),
      password: z.string(),
    });

    const { username, password } = createUserBodySchema.parse(request.body);

    await knex("users").insert({
      id: randomUUID(),
      username,
      password,
    });

    return reply.status(201).send();
  });
}
