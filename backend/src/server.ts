import app from "./app";
import { env } from "./config/env";
import { startCronJobs } from "./utils/cron";

app.listen(env.PORT, () => {
  console.log(
    `🚀 Server running at http://localhost:${env.PORT}`
  );
  startCronJobs();
});