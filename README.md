# FitForge: Modern Trainer-Client Management System

FitForge is a high-performance, glassmorphic web application designed for personal trainers and their clients. It streamlines weight tracking, plan assignment, and real-time communication with a premium user experience.

## 🚀 Key Features

### 🏋️ User Dashboard
- **Journey Progress:** Real-time visual tracking of weight loss goals.
- **Goal Insight:** AI-style feedback on how close you are to your target.
- **BMI Calculation:** Automatic BMI categorization (Normal, Overweight, etc.) with color-coded health indicators.
- **Active Plans:** View Diet and Workout plans assigned by your trainer.
- **Real-time Chat:** Floating chat interface for direct communication with your coach via Socket.io.

### 📋 Trainer Dashboard
- **Team Success Analytics:** Visual progress bar showing aggregate client goal achievement.
- **Client Management Table:** Complete overview of all clients, including their weight, goal, and **BMI Status**.
- **Plan Assignment:** Easily assign custom Diet and Exercise plans to specific users.
- **Pending Requests:** Approve or Reject client weight update requests for data integrity.

### 🛡️ Security & RBAC
- **JWT Authentication:** Secure token-based access for all routes.
- **Role-Based Access Control (RBAC):** Strict separation between Admin, Trainer, and User roles.
- **Admin Lockdown:** Hardcoded admin creation for maximum system security.

## 🛠️ Technology Stack
- **Frontend:** Vanilla JS, HTML5, CSS3 (Glassmorphism & CSS Variables)
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Real-time:** Socket.io
- **Icons/Avatars:** Dicebear API, FontAwesome

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   npm start
   ```

3. **Frontend Setup:**
   Open `frontend/login.html` in your browser (recommend using a Live Server).

## 📊 BMI Logic
- **Underweight:** < 18.5
- **Normal:** 18.5 - 24.9
- **Overweight:** 25 - 29.9
- **Obese:** > 30

---
*Modernized by Antigravity AI*
