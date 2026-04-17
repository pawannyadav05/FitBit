const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
const storedUser = JSON.parse(localStorage.getItem("user"));
const user = storedUser || {};

if (!token) {
    window.location.href = "login.html";
}

if (role !== "user") {
    alert("Access Denied");
    window.location.href = "login.html";
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
    const chat = document.getElementById("chatBox");
    chat.style.display = chat.style.display === "flex" ? "none" : "flex";
}

function sendMessage() {
    const input = document.getElementById("chatInput");
    const box = document.getElementById("chatMessages");

    if (!input.value.trim()) return;

    const msgDiv = document.createElement("div");
    msgDiv.style.background = "#c6ff00";
    msgDiv.style.color = "black";
    msgDiv.innerHTML = `<b>You:</b> ${input.value}`;

    box.appendChild(msgDiv);
    box.scrollTop = box.scrollHeight;

    const val = input.value;
    input.value = "";

    setTimeout(() => {
        const reply = document.createElement("div");
        reply.style.background = "#222";
        reply.innerHTML = `<b>Trainer:</b> ${val} noted. Keep going 💪`;
        box.appendChild(reply);
        box.scrollTop = box.scrollHeight;
    }, 1000);
}

attachLogout();
loadUser();

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
