import cron from "node-cron";

const BACKEND_URL = process.env.BACKEND_URL || "https://unified-org-backend.onrender.com";

export const startCronJobs = () => {
  // Run every 14 minutes to prevent Render free tier from sleeping (sleeps after 15 mins)
  cron.schedule("*/14 * * * *", async () => {
    try {
      console.log(`[Cron] Pinging server at ${BACKEND_URL} to keep it awake...`);
      const response = await fetch(BACKEND_URL);
      if (response.ok) {
        console.log("[Cron] Ping successful.");
      } else {
        console.error(`[Cron] Ping failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("[Cron] Error pinging server:", error);
    }
  });

  console.log("⌚ Cron jobs initialized.");
};
