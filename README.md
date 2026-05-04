# FitForge: A Premium Trainer-Client Ecosystem

FitForge is a high-performance management system designed specifically for personal trainers and their clients. Built with a focus on **Data Integrity**, **Real-Time Communication**, and **Premium User Experience**, it bridges the gap between coaching and technology.

The application leverages a modern "Glassmorphic" design, using CSS variables and backdrop filters to create a sleek, futuristic interface that feels alive and interactive.

---

## 📑 Table of Contents
1. [Key Features](#-key-features)
2. [Technical Deep Dive](#-technical-deep-dive)
3. [Database Architecture](#-database-architecture)
4. [Real-Time Infrastructure](#-real-time-infrastructure)
5. [Security & RBAC](#-security--rbac)
6. [Tech Stack](#-tech-stack)
7. [Installation & Setup](#-installation--setup)

---

## 🚀 Key Features

### 🏋️ Client Dashboard (The Athlete)
*   **Journey Progress:** Real-time visual tracking of weight loss/gain goals with dynamic progress bars.
*   **Goal Insight:** Automated BMI calculation and color-coded health indicators based on standard health metrics.
*   **Active Plans:** Direct access to custom Diet and Workout plans assigned by the coach.
*   **Consistency Tracking:** A daily "Streak" system that rewards users for frequent check-ins.
*   **Instant Access:** A floating chat interface for direct, private communication with their trainer.

### 📋 Trainer Dashboard (The Coach)
*   **Analytics Overview:** Visual progress bars showing the aggregate success of their entire team.
*   **Client Management:** A centralized table to view client metrics, BMI status, and training history.
*   **The Approval Workflow:** A unique system where client weight updates are held in a "Pending" state until the trainer verifies and approves them.
*   **Plan Management:** One-click assignment of personalized workout and nutrition notes.

---

## ⚙️ Technical Deep Dive

### 🔥 The Activity & Streak Engine
Consistency is the hardest part of fitness. FitForge implements a custom server-side logic in `backend/routes/user.js` to handle this:
*   **Validation:** Every time a user requests an update, the backend calculates the difference between `Date.now()` and their `lastActivityDate`.
*   **Logic:**
    *   **Same-Day Update:** Keeps the current streak.
    *   **Next-Day Update:** Increments the streak by 1.
    *   **Missed Days (>48 hours):** Automatically resets the streak to 0 to encourage the user to start fresh.

---

## 🗄️ Database Architecture (MongoDB/Mongoose)

The data layer is built for relational efficiency within a NoSQL environment. We use **ObjectId References** to create a scalable relationship between users and their records.

### 👤 User Model
The core schema handles three distinct roles: `user`, `trainer`, and `admin`.
```javascript
{
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "trainer", "admin"] },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Link to Coach
    pendingRequest: { weight: Number }, // Buffer for Approval System
    streak: { type: Number, default: 0 },
    lastActivityDate: { type: Date }
}
```

### 💬 Message Model
Designed for lightweight storage and fast retrieval of chat histories.
```javascript
{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now }
}
```

---

## ⚡ Real-Time Infrastructure (Socket.io)

FitForge is not a static app. It uses **Bi-Directional Event Emitters** to ensure that information flows instantly between the trainer and client.

### Event Workflow:
1.  **Connection:** On login, the client connects to the Socket.io server and joins a private room named after their `UserID`.
2.  **Notification Flow:**
    *   **`sendMessage`:** When a message is sent, the server saves it to MongoDB and immediately emits `receiveMessage` to the receiver's private room.
    *   **`newRequest`:** When a client submits a weight update, the trainer gets an instant "Ping" to review the data.
    *   **`planUpdated`:** When a trainer saves a plan, the client's dashboard updates in real-time without a page refresh.

---

## 🛡️ Security & RBAC

We follow industry standards for data privacy and access control.
*   **JWT (JSON Web Tokens):** All communication between the frontend and backend is authenticated via a signed token.
*   **Custom Middleware:**
    *   `authMiddleware`: Verifies the token and attaches the user data to the request.
    *   `adminMiddleware`: A specialized gatekeeper that prevents trainers or clients from accessing administrative tools.
*   **Bcrypt Hashing:** Passwords are never stored in plain text; they are hashed with a salt factor of 10.

---

## 💻 Tech Stack

### Frontend
*   **Vanilla JS:** High-performance logic without the overhead of heavy frameworks.
*   **Glassmorphic CSS:** Modern UI using `backdrop-filter`, CSS Variables, and smooth gradients.
*   **Socket.io Client:** For real-time synchronization.

### Backend
*   **Node.js & Express:** Scalable API architecture.
*   **Mongoose:** Schema-based modeling for MongoDB.
*   **Socket.io:** The real-time websocket engine.
*   **JWT:** Secure token-based authentication.

---

## 🚀 Installation & Setup

### 1. Clone & Install
```bash
git clone https://github.com/pawannyadav05/FitForge.git
cd FitForge/backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the `/backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_super_secret_key
```

### 3. Run the App
```bash
# Start Backend
npm start

# Open Frontend
# Simply open /frontend/index.html in your browser
```

---

## 🎯 Final Thoughts
FitForge was built to solve the fragmentation in personal training. By combining secure data management with instant communication, it creates a professional environment where trainers can focus on what they do best: **getting results for their clients.**

*Built with passion for fitness and code.*
