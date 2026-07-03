import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Complaint from "../models/Complaint.js";
import ComplaintHistory from "../models/ComplaintHistory.js";
import Notice from "../models/Notice.js";
import Setting from "../models/Setting.js";

export const seedDatabase = async () => {
  try {
    console.log("Auto-seeding default database records...");
    
    // Clear existing
    await User.deleteMany();
    await Complaint.deleteMany();
    await ComplaintHistory.deleteMany();
    await Notice.deleteMany();
    await Setting.deleteMany();

    console.log("Creating default settings...");
    await Setting.create({ key: "overdueDays", value: "7" });

    console.log("Creating default users...");
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash("demo1234", salt);
    const residentPasswordHash = await bcrypt.hash("demo1234", salt);

    const admin = await User.create({
      name: "Admin User",
      email: "admin@demo.com",
      password_hash: adminPasswordHash,
      role: "admin",
      flat: "Office",
      phone: "+91 99999 88888",
    });

    const resident = await User.create({
      name: "Resident User",
      email: "resident@demo.com",
      password_hash: residentPasswordHash,
      role: "resident",
      flat: "B-204",
      phone: "+91 90000 00000",
    });

    console.log("Users created: admin@demo.com / resident@demo.com");
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Auto-seeding failed:", error);
  }
};
