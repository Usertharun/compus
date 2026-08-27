import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  // Enable Lakebase Postgres and services for project compus
  auth: true,
  dataApi: true,
});
