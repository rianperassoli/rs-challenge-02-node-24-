import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";

export async function authRoutes(app: FastifyInstance) {
  app.post("/", async (request, reply) => {
    let userId = request.cookies.userId;

    if (userId) {
      return reply.status(202).send({
        success: "Authorized!",
      });
    }

    const createAuthBodySchema = z.object({
      username: z.string(),
      password: z.string(),
    });

    const { username, password } = createAuthBodySchema.parse(request.body);

    const user = await knex("users").where({ username, password }).first();

    if (!user) {
      return reply.status(401).send({
        error: "Unauthorized.",
      });
    }

    userId = user.id;

    reply.setCookie("userId", userId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return reply.status(202).send({
      success: "Authorized!",
    });
  });
}
