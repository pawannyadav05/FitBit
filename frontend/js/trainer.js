const trainer = {
    _id: "TR123",
    name: "Coach Aman",
    status: "Active"
};

const allUsers = [
    { name: "Himesh", height: 170, weight: 72 },
    { name: "Rahul", height: 175, weight: 80 }
];

let pendingUsers = [
    { name: "Himesh", pendingWeight: 73 },
    { name: "Rahul", pendingWeight: 78 }
];
document.getElementById("trainerName").innerText = trainer.name;
document.getElementById("trainerId").innerText = trainer._id;
document.getElementById("status").innerText = trainer.status;

QRCode.toCanvas(document.getElementById("qrCode"), trainer._id);
const pendingContainer = document.getElementById("pendingContainer");

function renderPending() {
    pendingContainer.innerHTML = "<h3>Pending Requests</h3>";

    pendingUsers.forEach((u, i) => {
        const div = document.createElement("div");
        div.className = "user-card";

        div.innerHTML = `
            <p>${u.name} → ${u.pendingWeight} kg</p>
            <button onclick="approveWeight(${i})" style="background:#c6ff00;">
                Approve
            </button>
            <button onclick="rejectWeight(${i})" style="background:red;color:white;">
                Reject
            </button>
        `;

        pendingContainer.appendChild(div);
    });
}

function approveWeight(i) {
    alert("Approved for " + pendingUsers[i].name);
    pendingUsers.splice(i, 1);
    renderPending();
}

function rejectWeight(i) {
    alert("Rejected for " + pendingUsers[i].name);
    pendingUsers.splice(i, 1);
    renderPending();
}

const tableContainer = document.getElementById("tableContainer");

function renderUsersTable() {
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

function toggleUserChat(i) {
    const row = document.getElementById(`chat-${i}`);
    row.style.display = row.style.display === "none" ? "table-row" : "none";
}

function sendUserMessage(i) {
    const input = document.getElementById(`input-${i}`);
    const box = document.getElementById(`messages-${i}`);

    if (!input.value.trim()) return;

    const msg = document.createElement("div");
    msg.innerHTML = `<b>You:</b> ${input.value}`;
    msg.style.textAlign = "left";
    msg.style.background = "#c6ff00";
    msg.style.color = "black";
    msg.style.margin = "5px";
    msg.style.padding = "5px";

    box.appendChild(msg);

    const text = input.value;
    input.value = "";

    setTimeout(() => {
        const reply = document.createElement("div");
        reply.innerHTML = `<b>${allUsers[i].name}:</b> Got it!`;
        reply.style.background = "#222";
        reply.style.margin = "5px";
        reply.style.padding = "5px";

        box.appendChild(reply);
    }, 1000);
}

renderPending();
renderUsersTable();
