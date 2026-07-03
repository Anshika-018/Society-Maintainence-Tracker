import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";

let mongod = null;

export const connectDB = async () => {
  try {
    let dbUrl = process.env.MONGODB_URI;

    if (dbUrl === "auto" || !dbUrl) {
      console.log("Initializing zero-config database storage...");
      
      // Ensure db-data directory exists
      const dbPath = path.resolve("./db-data");
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      console.log("Starting local automatic MongoDB server...");
      mongod = await MongoMemoryServer.create({
        instance: {
          dbPath: dbPath,
          storageEngine: "wiredTiger",
        },
      });
      dbUrl = mongod.getUri();
      console.log(`\n======================================================`);
      console.log(`Local automatic MongoDB server started!`);
      console.log(`Connection URI: ${dbUrl}`);
      console.log(`You can copy the URI above to connect using MongoDB Compass.`);
      console.log(`======================================================\n`);
    }

    const conn = await mongoose.connect(dbUrl, { dbName: "society-maintenance-tracker" });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop({ doCleanup: false });
    }
  } catch (error) {
    console.error("Error disconnecting database:", error);
  }
};
