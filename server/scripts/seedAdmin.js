require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../src/models/User");

const seedAdmin = async () => {
  let hadError = false;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");

    const existingAdmin = await User.findOne({ email: "admin@repairdesk.local" });

    if (existingAdmin) {
      console.log("Admin user already exists. No new admin created.");
    } else {
      const hashedPassword = await bcrypt.hash("Admin@123", 10);

      await User.create({
        name: "RepairDesk Admin",
        email: "admin@repairdesk.local",
        password: hashedPassword,
        role: "admin"
      });

      console.log("Admin user created successfully.");
    }
  } catch (error) {
    console.error("Error seeding admin user:", error.message);
    hadError = true;
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }

  if (hadError) {
    process.exit(1);
  }
};

seedAdmin();