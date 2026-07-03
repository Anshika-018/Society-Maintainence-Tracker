# 🏢 Society Maintenance Tracker
A modern, community-first web application designed to streamline apartment society management. Residents can easily raise maintenance complaints with photos, track their status, and view announcements, while administrators have a centralized overview to prioritize, update workflows, configure overdue thresholds, and broadcast notices.
---
## ✨ Features
### 👤 For Residents
- **Raise Complaints**: Create complaints with descriptions, category tags, and optional photo uploads.
- **Track Progress**: Real-time status tracking (Open 🟧, In Progress 🟨, Resolved 🟩) and priority labels (Low, Medium, High).
- **Interactive Notice Board**: Read society-wide pinned announcements with priority badges.
- **Profile Management**: Update flat details, phone number, and name.
- **Auto-Logout**: Sessions automatically log out on browser close for security (`sessionStorage`).
### 🔑 For Admins
- **Interactive Dashboard**: Visual analytics dashboard featuring charts (complaints by category) and a status distribution overview.
- **Workflow Management**: Set progress status, assign priority, and manually toggle overdue states.
- **Notice Board Publisher**: Post, pin, edit, and delete announcements.
- **Global Settings**: Configure automatic overdue age thresholds (e.g. flag unresolved issues older than 7 days).
---
## 🛠️ Tech Stack
### Frontend
- **Framework**: React with Vite
- **Routing**: TanStack Router (Type-safe routing)
- **Styling**: TailwindCSS v4 (Custom OKLCH Mauve/Plum theme)
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Interactive charts)
- **Components**: Shadcn UI & Radix UI primitives
### Backend
- **Runtime**: Node.js & Express
- **Database**: MongoDB (via Mongoose)
- **Zero-Config Storage**: Integrated `mongodb-memory-server` (automatic persistent local database on Windows/macOS/Linux without needing MongoDB installed locally).
- **Authentication**: JWT (JSON Web Tokens) & Bcryptjs password hashing
- **File Uploads**: Multer (Local disk storage)
---
## 🚀 Getting Started
### 📋 Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/)
---
### 🔧 Installation & Setup
1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/society-maintenance-tracker.git
   cd society-maintenance-tracker
   ```
2. **Configure Environment Variables**
   The backend environment variables are already set up to run zero-config out of the box using a local embedded database. If you wish to customize it, you can create a `.env` file inside the `backend` folder:
   ```env
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key
   MONGODB_URI=auto  # Set to a remote MongoDB connection string to use a cloud database (e.g. MongoDB Atlas)
   ```
3. **Install Backend Dependencies & Run**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *Note: On the first launch, the backend will automatically initialize a fresh database and run the auto-seed script.*
4. **Install Frontend Dependencies & Run**
   In a new terminal window:
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.
---

## 👥 User Account Setup
Since demo credentials and pre-filled inputs are removed to ensure a clean state, you can test the application by registering your own custom accounts:
|
 Role 
|
 Email 
|
 Password 
|
|
---
|
---
|
---
|
|
**
Admin
**
|
`admin@demo.com`
|
`Admin123!`
|
|
**
Resident
**
|
`resident@demo.com`
|
`Resident123!`
|
1. **Create a Resident Account**: Go to the **Register** page, fill in your details (flat, phone, email, and a password containing at least 8 characters, one symbol, and one digit).
2. **Create an Admin Account**: Switch the registration toggle to **Admin** on the Register page to set up an administrative account.
---
## 📂 Project Structure
```
society-maintenance-tracker/
├── Frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Shared UI components (StatCard, badges, buttons)
│   │   ├── routes/           # Pages & TanStack file-system routing
│   │   ├── lib/              # State store, schemas, utilities, and types
│   │   └── styles.css        # Tailwind v4 theme configurations
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # Express REST API
│   ├── config/               # DB connection & seed scripts
│   ├── controllers/          # Request handlers
│   ├── routes/               # API endpoints
│   ├── models/               # Mongoose schemas
│   ├── uploads/              # Local storage for complaint photo attachments
│   └── server.js             # Server entrypoint
│
└── README.md
```
---
## 📄 License
This project is licensed under the MIT License.
