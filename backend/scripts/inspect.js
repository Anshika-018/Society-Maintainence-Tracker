import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB, disconnectDB } from "../config/db.js";
import User from "../models/User.js";
import Complaint from "../models/Complaint.js";
import ComplaintHistory from "../models/ComplaintHistory.js";
import Notice from "../models/Notice.js";
import Setting from "../models/Setting.js";

dotenv.config();

const inspect = async () => {
  try {
    await connectDB();

    const usersCount = await User.countDocuments();
    const complaintsCount = await Complaint.countDocuments();
    const historiesCount = await ComplaintHistory.countDocuments();
    const noticesCount = await Notice.countDocuments();
    const settingsCount = await Setting.countDocuments();

    console.log("\n--- COLLECTION COUNTS ---");
    console.log("Users:", usersCount);
    console.log("Complaints:", complaintsCount);
    console.log("Histories:", historiesCount);
    console.log("Notices:", noticesCount);
    console.log("Settings:", settingsCount);
    console.log("-------------------------\n");

    if (usersCount > 0) {
      const users = await User.find();
      console.log("Raw Users:", JSON.stringify(users, null, 2));
    }

    if (complaintsCount > 0) {
      const complaints = await Complaint.find();
      console.log("Raw Complaints:", JSON.stringify(complaints, null, 2));
    }

    if (noticesCount > 0) {
      const notices = await Notice.find();
      console.log("Raw Notices:", JSON.stringify(notices, null, 2));
    }

  } catch (error) {
    console.error("Inspection failed:", error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

inspect();
