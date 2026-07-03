import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getSettings);
router.patch("/", protect, adminOnly, updateSettings);

export default router;
