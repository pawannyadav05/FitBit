# FitForge: Better Health, Together.

FitForge is a management system built for personal trainers who want a simple, professional way to keep their clients on track. Instead of messy spreadsheets or endless WhatsApp messages, FitForge puts everything in one place: weight tracking, workout plans, and real-time chat.

The app uses a "Glassmorphic" design, giving it a modern, premium feel that keeps users motivated while they track their progress.

---

## 🛠 What's inside?

### For the Clients (The Athletes)
*   **Track Your Journey:** See exactly how much weight you’ve lost (or gained) with a visual progress bar. 
*   **Health at a Glance:** The app automatically calculates your BMI and gives you a health status (Normal, Overweight, etc.) so you know where you stand.
*   **Stay Organized:** Access your custom Diet and Workout plans the moment your trainer assigns them.
*   **Live Chat:** Need a quick tip or feeling unmotivated? Use the floating chat to talk to your coach instantly via Socket.io.

### For the Trainers (The Coaches)
*   **Client Overview:** A single dashboard to see all your clients. No more digging through papers to find someone's goal weight.
*   **Approval System:** We added a "Pending Request" system. When a client updates their weight, it doesn't change until you verify it—keeping your data clean and accurate.
*   **Plan Assignment:** Quickly drop in workout or diet notes for any specific client.
*   **Analytics:** See a "Team Success" bar that shows how close your entire group is to hitting their collective goals.

---

## 💻 The Tech Behind It
We wanted the app to be fast and secure, so we used:
*   **Frontend:** Clean Vanilla JS, HTML5, and CSS3. No heavy frameworks, just fast performance and beautiful Glassmorphism.
*   **Backend:** Node.js & Express.
*   **Database:** MongoDB (for flexible data storage).
*   **Real-time:** Socket.io for that "instant" chat feel.
*   **Security:** JWT (JSON Web Tokens) to make sure everyone's data stays private.

---

## 🚀 Getting it running on your machine

### 1. Grab the code
```bash
git clone https://github.com/pawannyadav05/FitForge.git
```

### 2. Setup the Backend
Navigate to the backend folder, install the goodies, and start the engine:
```bash
cd backend
npm install
npm start
```

### 3. Open the Frontend
Since the frontend is built with pure JS/HTML, you can just open `frontend/index.html` in your favorite browser. (I recommend using **Live Server** in VS Code).

---

## 📝 A Quick Note on BMI Logic
The app uses the standard health markers:
*   **Underweight:** < 18.5
*   **Normal:** 18.5 - 24.9
*   **Overweight:** 25 - 29.9
*   **Obese:** > 30

---

*Built with passion for fitness and code.*
