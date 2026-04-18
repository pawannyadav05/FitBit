const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
const API_BASE = "http://localhost:5001";

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

// 🔥 REAL DATA ARRAYS
let users = [];
let trainers = [];

// =====================
// FETCH DATA
// =====================
async function loadData() {
    try {
        // users
        const resUsers = await fetch(`${API_BASE}/api/admin/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const userData = await resUsers.json();
        if (resUsers.ok) users = userData;

        // trainers
        const resTrainers = await fetch(`${API_BASE}/api/admin/trainers`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const trainerData = await resTrainers.json();
        if (resTrainers.ok) trainers = trainerData;

        renderUsers();
        renderTrainers();

    } catch (err) {
        console.error(err);
        alert("Error loading data");
    }
}

// =====================
// USERS TABLE
// =====================
const userTable = document.getElementById("userTable");

function renderUsers() {
    userTable.innerHTML = `
        <tr>
            <th>Name</th>
            <th>Assigned Trainer</th>
            <th>Assign Trainer</th>
            <th>Delete</th>
        </tr>

        ${users.map((u, i) => `
            <tr>
                <td>${u.name}</td>

                <td>${u.trainer || "Not Assigned"}</td>

                <td>
                    <select id="trainer-${i}">
                        <option value="">Select</option>
                        ${trainers.map(t => `<option value="${t._id}">${t.name}</option>`).join("")}
                    </select>

                    <button onclick="assignTrainer('${u._id}', ${i})">
                        Assign
                    </button>
                </td>

                <td>
                    <button onclick="deleteUser('${u._id}')">
                        Delete
                    </button>
                </td>
            </tr>
        `).join("")}
    `;
}

// =====================
// ASSIGN TRAINER
// =====================
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

// =====================
// DELETE USER
// =====================
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

// =====================
// TRAINERS TABLE
// =====================
const trainerTable = document.getElementById("trainerTable");

function renderTrainers() {
    trainerTable.innerHTML = `
        <tr>
            <th>Name</th>
            <th>Delete</th>
        </tr>

        ${trainers.map((t) => `
            <tr>
                <td>${t.name}</td>
                <td>
                    <button onclick="deleteTrainer('${t._id}')">
                        Delete
                    </button>
                </td>
            </tr>
        `).join("")}
    `;
}

// =====================
// CREATE TRAINER
// =====================
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

// =====================
// DELETE TRAINER
// =====================
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

// INIT
attachLogout();
loadData();