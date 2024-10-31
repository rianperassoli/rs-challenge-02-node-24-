import fastify from "fastify";
import cookie from "@fastify/cookie";
import { mealsRoutes } from "./routes/meals";
import { usersRoutes } from "./routes/users";
import { authRoutes } from "./routes/auth";

export const app = fastify();

app.register(cookie);
app.register(authRoutes, { prefix: "auth" });
app.register(usersRoutes, { prefix: "users" });
app.register(mealsRoutes, { prefix: "meals" });
