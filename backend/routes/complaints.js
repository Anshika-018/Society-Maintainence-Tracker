import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getComplaints,
  updateComplaintStatus,
  updateComplaintPriority,
  toggleManualOverdue,
} from "../controllers/complaintController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `photo-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeType && extName) {
    return cb(null, true);
  }
  cb(new Error("Only images (jpeg, jpg, png, webp) are allowed"));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});

router.post("/", protect, upload.single("photo"), createComplaint);
router.get("/mine", protect, getMyComplaints);
router.get("/:id", protect, getComplaintById);
router.get("/", protect, adminOnly, getComplaints);
router.patch("/:id/status", protect, adminOnly, updateComplaintStatus);
router.patch("/:id/priority", protect, adminOnly, updateComplaintPriority);
router.patch("/:id/manual-overdue", protect, adminOnly, toggleManualOverdue);

export default router;
