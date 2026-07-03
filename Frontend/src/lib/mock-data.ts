import type { Complaint, Notice, Settings, User } from "./types";

const now = Date.now();
const days = (n: number) => new Date(now - n * 86400_000).toISOString();

export const SEED_USERS: User[] = [
  {
    id: "u-admin",
    name: "Priya Menon",
    email: "admin@demo.com",
    password: "demo1234",
    flat: "A-101",
    phone: "+91 90000 00001",
    role: "admin",
  },
  {
    id: "u-res-1",
    name: "Rahul Sharma",
    email: "resident@demo.com",
    password: "demo1234",
    flat: "B-204",
    phone: "+91 90000 00002",
    role: "resident",
  },
];

export const SEED_COMPLAINTS: Complaint[] = [
  {
    id: "c-001",
    residentId: "u-res-1",
    residentName: "Rahul Sharma",
    residentFlat: "B-204",
    category: "Plumbing",
    description: "Kitchen sink drain is blocked; water is backing up into the basin.",
    photo: null,
    status: "In Progress",
    priority: "High",
    manualOverdue: false,
    createdAt: days(9),
    updatedAt: days(2),
    history: [
      { at: days(9), actorName: "Rahul Sharma", action: "Complaint raised" },
      {
        at: days(6),
        actorName: "Priya Menon",
        action: "Priority set to High",
        note: "Water is entering the neighbouring flat.",
      },
      {
        at: days(2),
        actorName: "Priya Menon",
        action: "Status → In Progress",
        note: "Plumber scheduled for tomorrow morning.",
      },
    ],
  },
  {
    id: "c-002",
    residentId: "u-res-1",
    residentName: "Rahul Sharma",
    residentFlat: "B-204",
    category: "Elevator",
    description: "Elevator in B-wing makes a loud grinding noise between floors 3 and 4.",
    photo: null,
    status: "Open",
    priority: "Medium",
    manualOverdue: false,
    createdAt: days(3),
    updatedAt: days(3),
    history: [{ at: days(3), actorName: "Rahul Sharma", action: "Complaint raised" }],
  },
  {
    id: "c-003",
    residentId: "u-res-1",
    residentName: "Rahul Sharma",
    residentFlat: "B-204",
    category: "Housekeeping",
    description: "Stairwell on the 4th floor was not cleaned for the past three days.",
    photo: null,
    status: "Resolved",
    priority: "Low",
    manualOverdue: false,
    createdAt: days(20),
    updatedAt: days(15),
    history: [
      { at: days(20), actorName: "Rahul Sharma", action: "Complaint raised" },
      {
        at: days(15),
        actorName: "Priya Menon",
        action: "Status → Resolved",
        note: "Housekeeping team rotated the schedule.",
      },
    ],
  },
];

export const SEED_NOTICES: Notice[] = [
  {
    id: "n-001",
    title: "Water tank cleaning — Saturday 8 AM to 12 PM",
    body: "The overhead tanks will be cleaned this Saturday. Please store enough water for the morning.",
    important: true,
    authorName: "Priya Menon",
    createdAt: days(1),
  },
  {
    id: "n-002",
    title: "Diwali celebration in the courtyard",
    body: "Join us on Sunday evening at 7 PM for lights, snacks, and music. All families welcome.",
    important: false,
    authorName: "Priya Menon",
    createdAt: days(4),
  },
];

export const SEED_SETTINGS: Settings = { overdueDays: 7 };
