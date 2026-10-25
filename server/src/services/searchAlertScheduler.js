const cron = require("node-cron");

const {
  processJobAlerts,
} = require("./searchAlertService");

const startSearchAlertScheduler = () => {
  // Every 10 minutes
  cron.schedule("*/10 * * * *", async () => {
    console.log(
      "Running FELG search alert engine..."
    );

    await processJobAlerts();
  });

  console.log(
    "FELG search alert scheduler started."
  );
};

module.exports = {
  startSearchAlertScheduler,
};