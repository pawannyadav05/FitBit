const API_BASE = "http://localhost:5001";
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

function loadUser() {
    const userName = user.name || "User";
    const userEmail = user.email || "No email";
    const membershipStatus = user.membershipStatus || "Active";
    const height = user.height ?? null;
    const currentWeight = user.weight ?? user.currentWeight ?? null;
    const targetWeight = user.goalWeight ?? user.targetWeight ?? null;
    const streak = user.streak ?? 0;

    document.getElementById("userName").innerText = userName;
    document.getElementById("userId").innerText = userEmail;
    document.getElementById("membershipStatus").innerText = membershipStatus;

    QRCode.toCanvas(document.getElementById("qrCode"), userEmail);

    document.getElementById("height").innerText = height ?? "Not set";
    document.getElementById("weight").innerText = currentWeight ?? "Not set";
    document.getElementById("goal").innerText = targetWeight ?? "Not set";
    document.getElementById("streak").innerText = streak;

    if (height && currentWeight) {
        const bmi = (currentWeight / ((height / 100) ** 2)).toFixed(2);
        document.getElementById("bmi").innerText = bmi;
    } else {
        document.getElementById("bmi").innerText = "Not set";
    }

    if (currentWeight && targetWeight) {
        const progress = Math.min((currentWeight / targetWeight) * 100, 100);
        document.getElementById("progressBar").style.width = progress + "%";
    } else {
        document.getElementById("progressBar").style.width = "0%";
    }
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
        const res = await fetch("http://localhost:5001/api/user/request-update", {
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
    } catch (err) {
        console.error("Request update error:", err);
        alert("Server error. Please try again.");
    }
}
