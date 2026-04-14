const BASE_URL = "http://localhost:5000";

const token = localStorage.getItem("token");

const user = {
    _id: "FF123",
    name: "Himesh",
    height: null,
    currentWeight: null,
    targetWeight: null,
    membershipStatus: "Active",
    streak: 10
};

function loadUser() {
    document.getElementById("userName").innerText = user.name;
    document.getElementById("userId").innerText = user._id;
    document.getElementById("membershipStatus").innerText = user.membershipStatus;
    QRCode.toCanvas(document.getElementById("qrCode"), user._id);

    if (!user.height || !user.currentWeight || !user.targetWeight) {
        document.querySelector(".card").innerHTML = `
            <h3>Complete Your Profile</h3>
            <input id="heightInput" type="number" placeholder="Height (cm)">
            <input id="weightInput" type="number" placeholder="Current Weight (kg)">
            <input id="targetInput" type="number" placeholder="Target Weight (kg)">
            <button onclick="saveProfile()">Save</button>
        `;
        return;
    }

    document.getElementById("height").innerText = user.height;
    document.getElementById("weight").innerText = user.currentWeight;
    document.getElementById("goal").innerText = user.targetWeight;
    document.getElementById("streak").innerText = user.streak;

    const bmi = (user.currentWeight / ((user.height / 100) ** 2)).toFixed(2);
    document.getElementById("bmi").innerText = bmi;

    const progress = ((user.currentWeight / user.targetWeight) * 100);
    document.getElementById("progressBar").style.width = progress + "%";
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

loadUser();
