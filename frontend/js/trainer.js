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
    const pendingCount = document.getElementById("pendingCount");
    const pending = allUsers.filter(u => u.pendingRequest);
    pendingCount.innerText = pending.length;

    if (!pending.length) {
        pendingContainer.innerHTML = `
            <div class="glass pending-card" style="grid-column: 1 / -1;">
                <p style="text-align:center;">No pending requests right now.</p>
            </div>
        `;
        return;
    }

    pendingContainer.innerHTML = pending.map((u) => `
        <div class="glass pending-card">
            <div class="pending-user">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}">
                <div>
                    <h4>${u.name}</h4>
                </div>
            </div>
            <div class="weight-update">
                <div class="weight-val">${u.weight} <span style="font-size:0.8rem;color:#888;">kg</span></div>
                <div class="weight-arrow">➔</div>
                <div class="weight-val">${u.pendingRequest.weight} <span style="font-size:0.8rem;color:#888;">kg</span></div>
            </div>
            <div class="pending-actions">
                <button class="btn-approve" onclick="approveWeight('${u._id}')">Approve</button>
                <button class="btn-reject" onclick="rejectWeight('${u._id}')">Reject</button>
            </div>
        </div>
    `).join("");
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

const clientsTableBody = document.getElementById("clientsTableBody");
const clientCount = document.getElementById("clientCount");
const assignPlanSelect = document.getElementById("assignPlanSelect");

function renderUsersTable() {
    clientCount.innerText = allUsers.length;

    // Populate the Assign Plan Select dropdown
    assignPlanSelect.innerHTML = `<option value="">Select a Client...</option>` + 
        allUsers.map((u) => `<option value="${u._id}" style="background:#111;">${u.name}</option>`).join("");

    if (!allUsers.length) {
        clientsTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">No clients found.</td>
            </tr>
        `;
        return;
    }

    clientsTableBody.innerHTML = allUsers.map((u, i) => {
        return `
            <tr>
                <td>
                    <div class="client-info">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}">
                        <div>
                            <p class="client-name">${u.name}</p>
                            <p class="client-email">${u.email || ''}</p>
                        </div>
                    </div>
                </td>
                <td>${u.weight} kg</td>
                <td>${u.goalWeight || '-'} kg</td>
                <td style="color: var(--accent); font-weight: 700;">Active</td>
                <td><button class="btn-chat" onclick="openChat(${i})">Message</button></td>
            </tr>
        `;
    }).join("");
}

function renderUsersLoading() {
    clientsTableBody.innerHTML = `
        <tr>
            <td colspan="5" style="text-align: center;">Loading clients...</td>
        </tr>
    `;
}

function renderUsersError(message = "Failed to load users.") {
    clientsTableBody.innerHTML = `
        <tr>
            <td colspan="5" style="text-align: center;">${message}</td>
        </tr>
    `;
}

let currentChatIndex = null;

function openChat(i) {
    currentChatIndex = i;
    const user = allUsers[i];
    document.getElementById("chatHeaderName").innerText = user.name;
    document.getElementById("chatHeaderAvatar").src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;
    document.getElementById("chatInput").placeholder = `Message ${user.name.split(' ')[0]}...`;
    
    document.getElementById("dashboardWrapper").classList.add("chat-open");
    
    loadTrainerChatHistory(i);
}

function closeChat() {
    document.getElementById("dashboardWrapper").classList.remove("chat-open");
    currentChatIndex = null;
}

document.getElementById("chatSendBtn")?.addEventListener("click", () => {
    if (currentChatIndex !== null) sendUserMessage(currentChatIndex);
});

document.getElementById("chatInput")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && currentChatIndex !== null) {
        sendUserMessage(currentChatIndex);
    }
});

function sendUserMessage(i) {
    const input = document.getElementById("chatInput");
    const text = input.value.trim();
    const chatUser = allUsers[i];

    if (!text || !chatUser?._id || !trainer._id) return;

    appendTrainerMessage({
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

function assignPlan() {
    alert("Backend functionality for sending plans will be integrated shortly!");
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

    // Only append if the currently open chat is the one that sent the message
    if (currentChatIndex === chatIndex) {
        appendTrainerMessage(data);
    }
});

function appendTrainerMessage(data) {
    const box = document.getElementById("chatMessages");
    if (!box) return;

    const isYou = String(data.sender) === String(trainer._id);
    const messageDiv = document.createElement("div");

    messageDiv.className = isYou ? "msg trainer" : "msg user";
    messageDiv.innerText = data.message;

    box.appendChild(messageDiv);
    box.scrollTop = box.scrollHeight;
}

async function loadTrainerUsers() {
    try {
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
        renderPending(); 

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

        const box = document.getElementById("chatMessages");
        box.innerHTML = "";

        messages.forEach((msg) => appendTrainerMessage(msg));
    } catch (err) {
        console.error("Chat load error:", err);
    }
}