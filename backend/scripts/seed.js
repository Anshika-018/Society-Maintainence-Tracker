import { connectDB, disconnectDB } from "../config/db.js";
import { seedDatabase } from "../config/seed.js";

const run = async () => {
  try {
    await connectDB();
    await seedDatabase();
  } catch (error) {
    console.error("Seeding runner failed:", error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

run();
