const { app, sessionStore } = require("./src/app.js");
const { sequelize } = require("./src/models");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Authenticate DB connection
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    await sequelize.sync();
    // await sequelize.sync({ force: true });

    // Sync Session Store table
    sessionStore.sync();
    console.log("✅ Database models synchronized.");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    process.exit(1);
  }
}

startServer();
