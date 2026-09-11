const bcrypt = require("bcrypt");
const Admin = require("./src/models/Admin");
const sequelize = require("./src/config/database");

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const count = await Admin.count();

    if (count === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);

      await Admin.create({
        name: "Super Admin",
        email: "mailforroughwork@gmail.com",
        password: hashedPassword,
      });

      console.log("✅ Success! Admin created.");
      console.log("Email: mailforroughwork@gmail.com");
      console.log("Password: admin123");
    } else {
      console.log("⚠️ Admin user already exists. Skipping seed.");
    }
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    process.exit();
  }
}

seed();
