// API_BASE is now defined globally in js/config.js
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
const storedUser = JSON.parse(localStorage.getItem("user"));
const user = storedUser || {};
const socket = io(API_BASE);
let activeTrainer = null;
let hasLoadedChatHistory = false;

if (!token) {
    window.location.href = "login.html";
}

if (role !== "user") {
    alert("Access Denied");
    window.location.href = "login.html";
}

if (user._id) {
    socket.emit("joinRoom", user._id);
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

function attachLogout() {
    document.querySelectorAll(".logout").forEach((element) => {
        element.addEventListener("click", logout);
    });
}

async function loadUser() {
    try {
        const res = await fetch(`${API_BASE}/api/user/me`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.ok) {
            const dbUser = await res.json();
            Object.assign(user, dbUser);
            localStorage.setItem("user", JSON.stringify(user));
        }
    } catch (err) {
        console.error("Failed to fetch fresh user data:", err);
    }

    const userName = user.name || "User";
    const userEmail = user.email || "No email";
    const membershipStatus = user.membershipStatus || "Active";
    const height = user.height ?? null;
    const currentWeight = Number(user.weight ?? user.currentWeight ?? 0);
    const targetWeight = Number(user.goalWeight ?? user.targetWeight ?? 0);
    const startWeight = Number(user.startWeight ?? currentWeight);

    document.getElementById("userName").innerText = userName;
    document.getElementById("userId").innerText = userEmail;
    document.getElementById("membershipStatus").innerText = membershipStatus;
    const streak = user.streak ?? 0;
    document.getElementById("streak").innerText = streak;
    
    const journeyBar = document.getElementById("journeyBar");
    const journeyPercent = document.getElementById("journeyPercent");
    const goalInsightText = document.getElementById("goalInsightText");

    if (currentWeight && targetWeight && startWeight) {
        // Progress is based on how much of the start-to-goal gap has been covered.
        const totalDist = Math.abs(startWeight - targetWeight);
        const coveredDist = Math.abs(startWeight - currentWeight);
        
        let progress = 0;
        if (totalDist > 0) {
            progress = (coveredDist / totalDist) * 100;
        }

        progress = Math.max(0, Math.min(100, progress));

        if (journeyBar) journeyBar.style.width = progress + "%";
        if (journeyPercent) journeyPercent.innerText = Math.round(progress) + "%";

        const diff = Math.abs(currentWeight - targetWeight).toFixed(1);
        if (progress >= 100) {
             if (goalInsightText) goalInsightText.innerHTML = `<strong style="color: var(--accent);">Goal Reached!</strong> 🏆`;
        } else {
             if (goalInsightText) goalInsightText.innerHTML = `You are <strong style="color: #fff;">${diff}kg</strong> away from your target goal.`;
        }
    } else {
        if (goalInsightText) goalInsightText.innerText = "Set your target weight to track your journey.";
    }

    document.getElementById("height").innerText = height ?? "Not set";
    document.getElementById("weight").innerText = currentWeight ?? "Not set";
    document.getElementById("goal").innerText = targetWeight ?? "Not set";
    document.getElementById("streak").innerText = streak;

    if (height && currentWeight) {
        const bmiValue = (currentWeight / ((height / 100) ** 2));
        const bmiStr = bmiValue.toFixed(2);
        document.getElementById("bmi").innerText = bmiStr;

        let status = "";
        let color = "var(--text-dim)";

        if (bmiValue < 18.5) {
            status = "Underweight";
            color = "#ffcc00";
        } else if (bmiValue >= 18.5 && bmiValue < 25) {
            status = "Normal Weight";
            color = "#00ff88";
        } else if (bmiValue >= 25 && bmiValue < 30) {
            status = "Overweight";
            color = "#ff8800";
        } else {
            status = "Obese";
            color = "#ff4444";
        }

        const bmiStatusEl = document.getElementById("bmiStatus");
        bmiStatusEl.innerText = status;
        bmiStatusEl.style.color = color;
        bmiStatusEl.style.fontWeight = "700";
    } else {
        document.getElementById("bmi").innerText = "Not set";
        document.getElementById("bmiStatus").innerText = "Based on profile";
    }

    if (currentWeight && targetWeight) {
        // This older bar is still in the page for compatibility with the existing layout.
        const progress = Math.min((currentWeight / targetWeight) * 100, 100);
        document.getElementById("progressBar").style.width = progress + "%";
    } else {
        document.getElementById("progressBar").style.width = "0%";
    }

    const dietPlan = user.dietPlan || "No diet plan assigned yet.";
    const workoutPlan = user.workoutPlan || "No workout plan assigned yet.";

    document.getElementById("dietPlanDisplay").innerText = dietPlan;
    document.getElementById("workoutPlanDisplay").innerText = workoutPlan;
}

function toggleChat() {
    const wrapper = document.querySelector('.dashboard-wrapper');
    const isOpening = !wrapper.classList.contains('chat-open');
    wrapper.classList.toggle('chat-open');

    if (isOpening && !activeTrainer) {
        const box = document.getElementById("chatMessages");
        box.innerHTML = `<div style="background:rgba(255,255,255,0.08);color:white;padding:14px 20px;border-radius:20px;">No trainer is available for chat right now.</div>`;
        return;
    }

    if (isOpening && activeTrainer && !hasLoadedChatHistory) {
        loadChatHistory(activeTrainer._id);
    }
}

function sendMessage() {
    const input = document.getElementById("chatInput");
    const text = input.value.trim();

    if (!text) {
        return;
    }

    if (!activeTrainer?._id) {
        alert("No trainer is available for chat right now.");
        return;
    }

    if (!user._id) {
        alert("User session is missing. Please log in again.");
        return;
    }

    appendUserMessage({
        sender: user._id,
        message: text
    });

    socket.emit("sendMessage", {
        sender: user._id,
        receiver: activeTrainer._id,
        message: text
    });

    input.value = "";
}

attachLogout();
loadUser();
loadTrainer();

socket.on("receiveMessage", (data) => {
    if (!data || data.sender === user._id) {
        return;
    }

    appendUserMessage(data);
});

socket.on("weightUpdated", (data) => {
    console.log("Weight update received:", data);
    loadUser();
});

socket.on("planUpdated", (data) => {
    console.log("Plan update received:", data);
    loadUser();
});

function appendUserMessage(data) {
    const box = document.getElementById("chatMessages");
    const messageDiv = document.createElement("div");
    const isYou = String(data.sender) === String(user._id);

    messageDiv.className = isYou ? "msg user" : "msg trainer";
    messageDiv.innerText = data.message;

    box.appendChild(messageDiv);
    box.scrollTop = box.scrollHeight;
}

async function loadTrainer() {
    try {
        const res = await fetch(`${API_BASE}/api/chat/trainers`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const trainers = await res.json();

        if (!res.ok || !trainers.length) {
            activeTrainer = null;
            return;
        }

        activeTrainer = trainers[0];
        const trainerNameEl = document.getElementById("trainerName");
        if (trainerNameEl) {
            trainerNameEl.innerText = activeTrainer.name || "Coach";
        }
    } catch (err) {
        console.error("Load trainer error:", err);
        activeTrainer = null;
    }
}

async function loadChatHistory(receiverId) {
    try {
        const res = await fetch(`${API_BASE}/api/chat/${receiverId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const messages = await res.json();

        if (!res.ok) {
            return;
        }

        const box = document.getElementById("chatMessages");
        box.innerHTML = "";
        messages.forEach(appendUserMessage);
        hasLoadedChatHistory = true;
    } catch (err) {
        console.error("Load chat history error:", err);
    }
}

async function requestUpdate() {
    const newWeight = Number(document.getElementById("newWeight").value);

    if (newWeight <= 0) {
        alert("Enter a valid positive weight.");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/user/request-update`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                weight: newWeight
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.msg || "Failed to send request.");
            return;
        }

        alert("Weight update request sent successfully.");
        document.getElementById("newWeight").value = "";

        loadUser();
    } catch (err) {
        console.error("Request update error:", err);
        alert("Server error. Please try again.");
    }
}
