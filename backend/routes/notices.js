import express from "express";
import {
  createNotice,
  getNotices,
  updateNotice,
  deleteNotice,
} from "../controllers/noticeController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, adminOnly, createNotice);
router.get("/", protect, getNotices);
router.patch("/:id", protect, adminOnly, updateNotice);
router.delete("/:id", protect, adminOnly, deleteNotice);

export default router;
