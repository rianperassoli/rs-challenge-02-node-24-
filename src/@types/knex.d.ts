import { Knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    meals: {
      id: string;
      user_id: string;
      name: string;
      description: string;
      meal_date: string;
      diet: boolean;
      created_at: string;
      update_at: string;
    };
    users: {
      id: string;
      username: string;
      password: string;
      created_at: string;
      updated_at: string;
    };
  }
}
