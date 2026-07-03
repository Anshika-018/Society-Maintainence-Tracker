import { z } from "zod";
import { CATEGORIES, PRIORITIES, STATUSES } from "./types";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export const registerSchema = z
  .object({
    role: z.enum(["resident", "admin"]),
    name: z.string().trim().min(2, "Name is too short").max(80),
    flat: z.string().trim().max(12, "Flat number is too long").optional(),
    phone: z.string().trim().min(6, "Enter a valid phone number").max(20),
    email: z.string().trim().email("Enter a valid email").max(255),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[0-9]/, "Password must contain at least one digit")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol")
      .max(100),
  })
  .refine(
    (data) => data.role === "admin" || (data.flat && data.flat.trim().length > 0),
    {
      message: "Flat number is required",
      path: ["flat"],
    },
  );

export const complaintSchema = z.object({
  category: z.enum(CATEGORIES as [string, ...string[]]),
  description: z
    .string()
    .trim()
    .min(10, "Please describe the issue in at least 10 characters")
    .max(1000, "Description is too long"),
  photo: z.string().nullable().optional(),
});

export const statusUpdateSchema = z.object({
  status: z.enum(STATUSES as [string, ...string[]]),
  note: z.string().trim().max(500).optional(),
});

export const prioritySchema = z.object({
  priority: z.enum(PRIORITIES as [string, ...string[]]),
});

export const noticeSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(120),
  body: z.string().trim().min(10, "Notice body is too short").max(2000),
  important: z.boolean(),
});

export const settingsSchema = z.object({
  overdueDays: z.coerce.number().int().min(1).max(90),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  flat: z.string().trim().min(1).max(12),
  phone: z.string().trim().min(6).max(20),
});
