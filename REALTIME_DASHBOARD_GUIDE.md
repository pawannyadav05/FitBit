# ⚡ Real-Time Dashboard Sync Guide

This document explains the real-time communication architecture implemented in FitForge using **Socket.io**.

## 🔄 The Real-Time Lifecycle

The application uses a bidirectional event system to ensure that trainers and clients stay in sync without ever needing to refresh their browsers.

---

### 📤 1. User ➔ Trainer (Weight Update Request)
When a client submits a new weight for review:
1.  **Frontend:** The user clicks "Submit" in `dashboard-user.html`.
2.  **API:** A POST request is sent to `/api/user/request-update`.
3.  **Socket Emit:** The backend saves the data and then uses `req.io.to(trainerId).emit("newRequest", ...)` to signal the trainer.
4.  **Instant UI:** The Trainer's dashboard receives the `newRequest` event and immediately reloads the **"Pending Updates"** list.

---

### 📥 2. Trainer ➔ User (Approval & Progress)
When a trainer approves a pending weight:
1.  **Frontend:** The trainer clicks "Approve" in `dashboard-trainer.html`.
2.  **API:** A POST request is sent to `/api/trainer/approve/:id`.
3.  **Socket Emit:** The backend updates the user's current weight and emits `req.io.to(userId).emit("weightUpdated", ...)`.
4.  **Instant UI:** The User's dashboard receives the `weightUpdated` event and immediately re-calculates the **Progress Bar** and **BMI Status** on the screen.

---

### 🔑 Key Socket Events
| Event Name | Sender | Receiver | Purpose |
| :--- | :--- | :--- | :--- |
| `joinRoom` | Both | Server | Puts the user/trainer into a private room based on their ID. |
| `newRequest` | User (via Server) | Trainer | Notifies coach that a new weight is waiting for approval. |
| `weightUpdated` | Trainer (via Server) | User | Notifies client that their journey progress has been updated. |
| `sendMessage` | Both | Both | Handles the instant chat messaging. |

---

## 🛠️ Implementation Details
- **Backend:** `server.js` uses a middleware to attach the `io` instance to every request (`req.io`).
- **Frontend:** Both `user.js` and `trainer.js` initialize a socket connection on page load and join a "Room" unique to their User ID.

---
*FitForge Real-Time Architecture - Documented by Antigravity AI*
