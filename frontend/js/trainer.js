const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
const API_BASE = "http://localhost:5001";
const socket = io(API_BASE);

if (!token) {
    window.location.href = "login.html";
}

if (role !== "trainer") {
    alert("Access Denied");
    window.location.href = "login.html";
}

const storedTrainer = JSON.parse(localStorage.getItem("user"));

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

function attachLogout() {
    document.querySelectorAll(".logout").forEach((element) => {
        element.addEventListener("click", logout);
    });
}

const trainer = {
    _id: storedTrainer?._id || storedTrainer?.id || "TR123",
    name: storedTrainer?.name || "Coach Aman",
    email: storedTrainer?.email || "trainer@example.com",
    status: storedTrainer?.status || "Active"
};

let allUsers = [];
const openChats = new Map();

if (trainer._id) {
    socket.emit("joinRoom", trainer._id);
}

document.getElementById("trainerName").innerText = trainer.name;
document.getElementById("trainerId").innerText = trainer.email;
document.getElementById("status").innerText = trainer.status;

QRCode.toCanvas(document.getElementById("qrCode"), trainer.email);

const pendingContainer = document.getElementById("pendingContainer");

// ✅ FIXED PENDING (from DB instead of dummy)
function renderPending() {
    pendingContainer.innerHTML = "<h3>Pending Requests</h3>";

    const pending = allUsers.filter(u => u.pendingRequest);

    if (!pending.length) {
        pendingContainer.innerHTML += `
            <div class="user-card">
                <p>No pending requests right now.</p>
            </div>
        `;
        return;
    }

    pending.forEach((u) => {
        const div = document.createElement("div");
        div.className = "user-card";

        div.innerHTML = `
            <p>${u.name} → ${u.pendingRequest.weight} kg</p>
            <button onclick="approveWeight('${u._id}')">Approve</button>
            <button onclick="rejectWeight('${u._id}')">Reject</button>
        `;

        pendingContainer.appendChild(div);
    });
}

async function approveWeight(userId) {
    await fetch(`${API_BASE}/api/trainer/approve/${userId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",   // ✅ ADD THIS
            "Authorization": `Bearer ${token}`
        }
    });

    loadTrainerUsers();
}

async function rejectWeight(userId) {
    await fetch(`${API_BASE}/api/trainer/reject/${userId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",   // ✅ ADD THIS
            "Authorization": `Bearer ${token}`
        }
    });

    loadTrainerUsers();
}

const tableContainer = document.getElementById("tableContainer");

function renderUsersTable() {
    if (!allUsers.length) {
        tableContainer.innerHTML = `
            <h3>Users Details & Chat</h3>
            <div class="user-card">
                <p>No users found.</p>
            </div>
        `;
        return;
    }

    tableContainer.innerHTML = `
        <h3>Users Details & Chat</h3>

        <table>
            <tr>
                <th>Name</th>
                <th>Height</th>
                <th>Weight</th>
                <th>BMI</th>
                <th>Chat</th>
            </tr>

            ${allUsers.map((u, i) => {
                const bmi = (u.weight / ((u.height / 100) ** 2)).toFixed(2);

                return `
                <tr>
                    <td>${u.name}</td>
                    <td>${u.height} cm</td>
                    <td>${u.weight} kg</td>
                    <td>${bmi}</td>
                    <td>
                        <button class="chat-btn-table" onclick="toggleUserChat(${i})">
                            💬 Chat
                        </button>
                    </td>
                </tr>

                <tr id="chat-${i}" style="display:none;">
                    <td colspan="5">
                        <div style="background:#161616;padding:10px;border-radius:10px;">
                            <div id="messages-${i}" style="height:150px;overflow:auto;margin-bottom:10px;"></div>
                            <input id="input-${i}" placeholder="Type message">
                            <button onclick="sendUserMessage(${i})">Send</button>
                        </div>
                    </td>
                </tr>
                `;
            }).join("")}
        </table>
    `;
}

function renderUsersLoading() {
    tableContainer.innerHTML = `
        <h3>Users Details & Chat</h3>
        <div class="user-card">
            <p>Loading users...</p>
        </div>
    `;
}

function renderUsersError(message = "Failed to load users.") {
    tableContainer.innerHTML = `
        <h3>Users Details & Chat</h3>
        <div class="user-card">
            <p>${message}</p>
        </div>
    `;
}

function toggleUserChat(i) {
    const row = document.getElementById(`chat-${i}`);
    const isOpening = row.style.display === "none";
    row.style.display = isOpening ? "table-row" : "none";

    if (isOpening) {
        loadTrainerChatHistory(i);
    }
}

function sendUserMessage(i) {
    const input = document.getElementById(`input-${i}`);
    const text = input.value.trim();
    const chatUser = allUsers[i];

    if (!text || !chatUser?._id || !trainer._id) return;

    appendTrainerMessage(i, {
        sender: trainer._id,
        message: text
    });

    socket.emit("sendMessage", {
        sender: trainer._id,
        receiver: chatUser._id,
        message: text
    });

    input.value = "";
}

attachLogout();
renderUsersLoading();
loadTrainerUsers();

socket.on("receiveMessage", (data) => {
    if (!data || String(data.sender) === String(trainer._id)) return;

    const chatIndex = allUsers.findIndex(
        (chatUser) => String(chatUser._id) === String(data.sender)
    );

    if (chatIndex === -1) return;

    appendTrainerMessage(chatIndex, data);
});

function appendTrainerMessage(index, data) {
    const box = document.getElementById(`messages-${index}`);
    if (!box) return;

    const isYou = String(data.sender) === String(trainer._id);

    const messageDiv = document.createElement("div");

    messageDiv.style.textAlign = isYou ? "right" : "left";
    messageDiv.style.background = isYou ? "#c6ff00" : "#222";
    messageDiv.style.color = isYou ? "black" : "white";
    messageDiv.style.margin = "5px";
    messageDiv.style.padding = "5px";

    messageDiv.innerHTML = `
        <b>${isYou ? "You" : allUsers[index]?.name}:</b> ${data.message}
    `;

    box.appendChild(messageDiv);
    box.scrollTop = box.scrollHeight;
}

async function loadTrainerUsers() {
    try {
        // ✅ FIXED API
        const res = await fetch(`${API_BASE}/api/trainer/users`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const users = await res.json();

        if (!res.ok) {
            renderUsersError(users.msg || "Failed to load users.");
            return;
        }

        allUsers = users;

        renderUsersTable();
        renderPending(); // ✅ IMPORTANT FIX

    } catch (err) {
        console.error("Load trainer users error:", err);
        renderUsersError("Could not connect to backend.");
    }
}

async function loadTrainerChatHistory(index) {
    const chatUser = allUsers[index];
    if (!chatUser?._id) return;

    try {
        const res = await fetch(`${API_BASE}/api/chat/${chatUser._id}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const messages = await res.json();

        if (!res.ok) return;

        const box = document.getElementById(`messages-${index}`);
        box.innerHTML = "";

        messages.forEach((msg) => appendTrainerMessage(index, msg));
    } catch (err) {
        console.error("Chat load error:", err);
    }
}