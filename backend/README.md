# Society Maintainence Tracker - Society Maintenance Tracker Backend

This is the Node.js + Express + MongoDB backend for the **Society Maintainence Tracker Society Maintenance Tracker** application. It implements role-based authentication, notice board CRUD, complaint lifecycles with history tracking, email alerts, and an admin dashboard.

---

## 🚀 Key Features

1. **Zero-Configuration Run-Anywhere Database**: By default, the database boots up automatically on a local, portable MongoDB memory server. No database installations are required. Data is persisted directly to `backend/db-data/`.
2. **Self-Seeding on Startup**: On clean boot, if the database is detected as empty, it automatically populates itself with default demo users, notices, and complaints.
3. **Role-Based Access Control**: Strict role validation (Resident vs. Admin) for API endpoints using JWT authentication.
4. **Nodemailer Alerts**: Sends automatic email updates to residents when a complaint status changes or when an important notice is posted. Automatically initializes Ethereal test accounts for preview links if no SMTP credentials are provided.

---

## 🛠️ Setup & Running

Follow these steps to run the backend from a clean clone:

### 1. Install Dependencies
Navigate to the `backend/` directory and install the necessary npm packages:
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` or let the default `.env` run out-of-the-box (it is pre-configured for automatic MongoDB starting and Ethereal email simulation):
```bash
cp .env.example .env
```

### 3. Start the Server
Start the backend Express server:
```bash
npm start
```
Upon start, you will see output confirming the local database has launched, printed its connection URI (which you can paste into MongoDB Compass to inspect the database), auto-seeded default data, generated Ethereal email credentials, and initialized on port `5000`.

---

## 📝 Seeding Mock Data (Optional)
If you wish to manually reset and re-seed the database at any point, run:
```bash
npm run seed
```
This drops existing collections and creates:
- **Admin**: `admin@demo.com` (Password: `demo1234`)
- **Resident**: `resident@demo.com` (Password: `demo1234`)
- **Notices**: 2 announcements (one marked important).
- **Complaints**: 3 complaints in different lifecycle stages (Open, In Progress, Resolved).

---

## 📊 Database Schema (MongoDB/Mongoose)

### 1. User
Represents a resident or an administrator.
- `id` (virtual, mapped from `_id`)
- `name` (String, required)
- `email` (String, required, unique, lowercased)
- `password_hash` (String, required)
- `role` (String, enum: `["resident", "admin"]`, default: `"resident"`)
- `flat` (String, optional)
- `phone` (String, optional)

### 2. Complaint
Tracks maintenance issues raised by residents.
- `id` (virtual)
- `resident_id` (ObjectId, ref: `User`, required)
- `category` (String, enum: `["Plumbing", "Electrical", "Housekeeping", "Security", "Elevator", "Common Area", "Other"]`)
- `description` (String, required)
- `photo_url` (String, default: `null`)
- `priority` (String, enum: `["Low", "Medium", "High"]`, default: `"Low"`)
- `status` (String, enum: `["Open", "In Progress", "Resolved"]`, default: `"Open"`)
- `manual_overdue` (Boolean, default: `false`)
- `createdAt` (Date, automatically managed)
- `updatedAt` (Date, automatically managed)

### 3. ComplaintHistory
Tracks status transitions and priority adjustments.
- `id` (virtual)
- `complaint_id` (ObjectId, ref: `Complaint`, required)
- `changed_by` (ObjectId, ref: `User`, required)
- `action` (String, required — e.g., `"Complaint raised"`, `"Status → In Progress"`, `"Priority set to High"`, `"Flagged as overdue"`)
- `old_status` (String, required)
- `new_status` (String, required)
- `note` (String, optional)
- `timestamp` (Date, default: `Date.now`)

### 4. Notice
An announcement posted on the notice board.
- `id` (virtual)
- `posted_by` (ObjectId, ref: `User`, required)
- `title` (String, required)
- `body` (String, required)
- `is_important` (Boolean, default: `false`)
- `created_at` (Date, automatically managed)

### 5. Setting
Global app configuration values.
- `key` (String, required, unique)
- `value` (Mixed, required)

---

## 📡 API Reference Documentation

All request bodies must be sent in `application/json` format (unless specified otherwise).

### Authentication

#### Register a New User
* **URL**: `/api/auth/register`
* **Method**: `POST`
* **Auth Required**: No
* **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123",
    "role": "resident", 
    "flat": "C-104",
    "phone": "+91 98765 43210"
  }
  ```
* **Response**: `201 Created`
  ```json
  {
    "token": "eyJhbGciOi...",
    "role": "resident",
    "user": {
      "id": "6a47f68c1...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "flat": "C-104",
      "phone": "+91 98765 43210",
      "role": "resident"
    }
  }
  ```

#### Login User
* **URL**: `/api/auth/login`
* **Method**: `POST`
* **Auth Required**: No
* **Request Body**:
  ```json
  {
    "email": "resident@demo.com",
    "password": "demo1234"
  }
  ```
* **Response**: `200 OK`
  ```json
  {
    "token": "eyJhbGciOi...",
    "role": "resident",
    "user": {
      "id": "6a47f68c1...",
      "name": "Anaya Patel",
      "email": "resident@demo.com",
      "flat": "B-204",
      "phone": "+91 90000 00000",
      "role": "resident"
    }
  }
  ```

#### Update Profile
* **URL**: `/api/auth/profile`
* **Method**: `PATCH`
* **Auth Required**: Yes (Any user)
* **Request Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Request Body**:
  ```json
  {
    "name": "Anaya S. Patel",
    "flat": "B-205",
    "phone": "+91 90000 11111"
  }
  ```
* **Response**: `200 OK`
  ```json
  {
    "ok": true,
    "user": {
      "id": "6a47f68c1...",
      "name": "Anaya S. Patel",
      "email": "resident@demo.com",
      "flat": "B-205",
      "phone": "+91 90000 11111",
      "role": "resident"
    }
  }
  ```

---

### Complaints

#### Raise a Complaint
* **URL**: `/api/complaints`
* **Method**: `POST`
* **Auth Required**: Yes (Resident only)
* **Request Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Request Body**: Send as `multipart/form-data`:
  - `category` (String, required)
  - `description` (String, required)
  - `photo` (File, optional image attachment)
* **Response**: `201 Created`
  ```json
  {
    "ok": true,
    "complaint": {
      "id": "6a47f7316e...",
      "residentId": "6a47f68c1e...",
      "residentName": "Anaya Patel",
      "residentFlat": "B-204",
      "category": "Plumbing",
      "description": "Pipe leaking under kitchen sink.",
      "photo": "http://localhost:5000/uploads/photo-1700000000.jpg",
      "status": "Open",
      "priority": "Medium",
      "manualOverdue": false,
      "createdAt": "2026-07-03T18:00:00.000Z",
      "updatedAt": "2026-07-03T18:00:00.000Z",
      "history": [
        {
          "at": "2026-07-03T18:00:00.000Z",
          "actorName": "Anaya Patel",
          "action": "Complaint raised",
          "note": "Complaint raised by resident"
        }
      ],
      "isOverdue": false
    }
  }
  ```

#### Fetch My Complaints
* **URL**: `/api/complaints/mine`
* **Method**: `GET`
* **Auth Required**: Yes (Resident only)
* **Request Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Response**: `200 OK`
  ```json
  [
    {
      "id": "6a47f7316e...",
      "residentId": "6a47f68c1e...",
      "residentName": "Anaya Patel",
      "residentFlat": "B-204",
      "category": "Plumbing",
      "description": "Pipe leaking under kitchen sink.",
      "photo": null,
      "status": "Open",
      "priority": "Medium",
      "manualOverdue": false,
      "createdAt": "2026-07-03T18:00:00.000Z",
      "updatedAt": "2026-07-03T18:00:00.000Z",
      "history": [...],
      "isOverdue": false
    }
  ]
  ```

#### Fetch Complaint Details (Includes History)
* **URL**: `/api/complaints/:id`
* **Method**: `GET`
* **Auth Required**: Yes (Any authorized user)
* **Request Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Response**: `200 OK` (Returns the mapped complaint object, including full nested timeline history list sorted chronologically).

#### Fetch All Complaints (Admin Dashboard Queue)
* **URL**: `/api/complaints`
* **Method**: `GET`
* **Auth Required**: Yes (Admin only)
* **Request Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Query Parameters** (Optional):
  - `category` (Filter by category)
  - `status` (Filter by status)
  - `date_start` (Filter by date greater/equal)
  - `date_end` (Filter by date less/equal)
* **Response**: `200 OK`
  Returns an array of complaints sorted with **Overdue complaints first**, then sorted by `createdAt` descending.

#### Update Complaint Status
* **URL**: `/api/complaints/:id/status`
* **Method**: `PATCH`
* **Auth Required**: Yes (Admin only)
* **Request Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Request Body**:
  ```json
  {
    "status": "In Progress",
    "note": "Plumber scheduled for tomorrow morning."
  }
  ```
* **Response**: `200 OK`
  Returns the updated complaint object, writes a new history log entry, and emails the resident.
  *Note: Resolved complaints reject status edits.*

#### Update Complaint Priority
* **URL**: `/api/complaints/:id/priority`
* **Method**: `PATCH`
* **Auth Required**: Yes (Admin only)
* **Request Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Request Body**:
  ```json
  {
    "priority": "High"
  }
  ```
* **Response**: `200 OK`
  Returns the updated complaint and writes a timeline history entry.

#### Toggle Manual Overdue Flag
* **URL**: `/api/complaints/:id/manual-overdue`
* **Method**: `PATCH`
* **Auth Required**: Yes (Admin only)
* **Request Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Response**: `200 OK`
  Toggles the `manualOverdue` flag on the complaint and appends a history log entry.

---

### Notices

#### Create Notice
* **URL**: `/api/notices`
* **Method**: `POST`
* **Auth Required**: Yes (Admin only)
* **Request Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Request Body**:
  ```json
  {
    "title": "Water Shutdown",
    "body": "Temporary shutoff for repairs.",
    "important": true
  }
  ```
* **Response**: `201 Created`
  Returns the created notice. If `important` is `true`, it automatically broadcasts email notifications to all registered residents.

#### Fetch Notice Board
* **URL**: `/api/notices`
* **Method**: `GET`
* **Auth Required**: Yes (Any user)
* **Request Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Response**: `200 OK`
  Returns notices sorted with **Important/Pinned notices first**, then sorted by `createdAt` descending.

#### Update Notice
* **URL**: `/api/notices/:id`
* **Method**: `PATCH`
* **Auth Required**: Yes (Admin only)
* **Request Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Request Body**:
  ```json
  {
    "title": "Updated Notice Title",
    "body": "Updated details.",
    "important": false
  }
  ```
* **Response**: `200 OK`

#### Delete Notice
* **URL**: `/api/notices/:id`
* **Method**: `DELETE`
* **Auth Required**: Yes (Admin only)
* **Request Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Response**: `200 OK`
  ```json
  {
    "ok": true,
    "message": "Notice deleted successfully"
  }
  ```

---

### Settings & Dashboard

#### Get Global Settings
* **URL**: `/api/settings`
* **Method**: `GET`
* **Auth Required**: Yes (Any user)
* **Request Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Response**: `200 OK`
  ```json
  {
    "overdueDays": 7
  }
  ```

#### Update Overdue Threshold Setting
* **URL**: `/api/settings`
* **Method**: `PATCH`
* **Auth Required**: Yes (Admin only)
* **Request Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Request Body**:
  ```json
  {
    "overdueDays": 5
  }
  ```
* **Response**: `200 OK`
  ```json
  {
    "ok": true,
    "settings": {
      "overdueDays": 5
    }
  }
  ```

#### Fetch Admin Dashboard Analytics
* **URL**: `/api/dashboard`
* **Method**: `GET`
* **Auth Required**: Yes (Admin only)
* **Request Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Response**: `200 OK`
  ```json
  {
    "countsByStatus": {
      "Open": 1,
      "In Progress": 1,
      "Resolved": 1
    },
    "countsByCategory": {
      "Plumbing": 1,
      "Electrical": 1,
      "Housekeeping": 0,
      "Security": 0,
      "Elevator": 1,
      "Common Area": 0,
      "Other": 0
    },
    "overdueCount": 1,
    "totalCount": 3
  }
  ```
