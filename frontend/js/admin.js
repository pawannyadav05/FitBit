const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
// API_BASE is now defined globally in js/config.js

if (!token) {
    window.location.href = "login.html";
}

if (role !== "admin") {
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

let users = [];
let trainers = [];

async function loadData() {
    try {
        const resUsers = await fetch(`${API_BASE}/api/admin/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const userData = await resUsers.json();
        if (resUsers.ok) users = userData;

        const resTrainers = await fetch(`${API_BASE}/api/admin/trainers`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const trainerData = await resTrainers.json();
        if (resTrainers.ok) trainers = trainerData;

        document.getElementById("totalUsers").innerText = users.length;
        document.getElementById("activeTrainers").innerText = trainers.length;

        renderUsers();
        renderTrainers();

    } catch (err) {
        console.error(err);
        alert("Error loading data");
    }
}

const userTableBody = document.getElementById("userTableBody");

function getInitials(name) {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function renderUsers() {
    userTableBody.innerHTML = users.map((u, i) => {
        const initials = getInitials(u.name);
        let trainerCol = "";
        let actionCol = "";

        if (u.trainer) {
            trainerCol = `<span class="badge assigned">${u.trainer}</span>`;
            actionCol = `
                <div class="action-cell">
                    <button class="btn-delete" onclick="deleteUser('${u._id}')">Remove</button>
                </div>
            `;
        } else {
            trainerCol = `<span class="badge unassigned">Unassigned</span>`;
            actionCol = `
                <div class="action-cell">
                    <select class="assign-select" id="trainer-${i}">
                        <option value="" disabled selected>Select Trainer</option>
                        ${trainers.map(t => `<option value="${t._id}">${t.name}</option>`).join("")}
                    </select>
                    <button class="btn-assign" onclick="assignTrainer('${u._id}', ${i})">Assign</button>
                    <button class="btn-delete" onclick="deleteUser('${u._id}')">Remove</button>
                </div>
            `;
        }

        return `
            <tr>
                <td>
                    <div class="user-info">
                        <div class="avatar">${initials}</div>
                        <div class="user-details">
                            <h4>${u.name}</h4>
                            <p>${u.email}</p>
                        </div>
                    </div>
                </td>
                <td>
                    ${trainerCol}
                </td>
                <td>
                    ${actionCol}
                </td>
            </tr>
        `;
    }).join("");
}

async function assignTrainer(userId, i) {
    const trainerId = document.getElementById(`trainer-${i}`).value;

    if (!trainerId) {
        alert("Select trainer first");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/admin/assign`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ userId, trainerId })
        });
        
        if (res.ok) {
            loadData();
        } else {
            const data = await res.json();
            alert(data.msg || "Failed to assign trainer");
        }
    } catch (err) {
        console.error(err);
        alert("Error assigning trainer");
    }
}

async function deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
        const res = await fetch(`${API_BASE}/api/admin/delete-user/${userId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (res.ok) {
            loadData();
        } else {
            const data = await res.json();
            alert(data.msg || "Failed to delete user");
        }
    } catch (err) {
        console.error(err);
        alert("Error deleting user");
    }
}

const trainerTableBody = document.getElementById("trainerTableBody");

function renderTrainers() {
    trainerTableBody.innerHTML = trainers.map((t) => {
        const initials = getInitials(t.name);
        const clientCount = users.filter(u => u.trainer === t.name).length;

        return `
            <tr>
                <td>
                    <div class="user-info">
                        <div class="avatar" style="background: rgba(198, 255, 0, 0.1); color: var(--accent);">${initials}</div>
                        <div class="user-details">
                            <h4>${t.name}</h4>
                            <p>${t.email}</p>
                        </div>
                    </div>
                </td>
                <td><span style="font-weight: 600;">${clientCount}</span> clients</td>
                <td>
                    <button class="btn-delete" onclick="deleteTrainer('${t._id}')">Revoke Access</button>
                </td>
            </tr>
        `;
    }).join("");
}

function createTrainer() {
    const name = document.getElementById("trainerNameInput").value;
    const email = document.getElementById("trainerEmailInput").value;
    const password = document.getElementById("trainerPasswordInput").value;

    if (!name || !email || !password) {
        alert("Fill all fields");
        return;
    }

    fetch(`${API_BASE}/api/admin/create-trainer`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, password })
    })
    .then(async (res) => {
        if (!res.ok) {
            const err = await res.json();
            alert(err.msg || "Failed to create trainer");
            return;
        }
        alert("Trainer created!");
        document.getElementById("trainerNameInput").value = "";
        document.getElementById("trainerEmailInput").value = "";
        document.getElementById("trainerPasswordInput").value = "";
        loadData();
    })
    .catch(err => {
        console.error(err);
        alert("Error creating trainer");
    });
}

async function deleteTrainer(trainerId) {
    if (!confirm("Are you sure you want to delete this trainer?")) return;

    try {
        const res = await fetch(`${API_BASE}/api/admin/delete-trainer/${trainerId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (res.ok) {
            loadData();
        } else {
            const data = await res.json();
            alert(data.msg || "Failed to delete trainer");
        }
    } catch (err) {
        console.error(err);
        alert("Error deleting trainer");
    }
}

attachLogout();
loadData();
