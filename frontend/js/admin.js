const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

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

// Dummy Users
let users = [
    { id: "U1", name: "Himesh", trainer: null },
    { id: "U2", name: "Rahul", trainer: null }
];

// Dummy Trainers
let trainers = [
    { id: "T1", name: "Aman" },
    { id: "T2", name: "Rohit" }
];

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

                <td>${u.trainer ? u.trainer : "Not Assigned"}</td>

                <td>
                    <select id="trainer-${i}">
                        <option value="">Select</option>
                        ${trainers.map(t => `<option value="${t.name}">${t.name}</option>`).join("")}
                    </select>

                    <button class="assign-btn" onclick="assignTrainer(${i})">
                        Assign
                    </button>
                </td>

                <td>
                    <button class="delete-btn" onclick="deleteUser(${i})">
                        Delete
                    </button>
                </td>
            </tr>
        `).join("")}
    `;
}

// Assign Trainer
function assignTrainer(i) {
    const select = document.getElementById(`trainer-${i}`);
    const trainer = select.value;

    if (!trainer) {
        alert("Select trainer first");
        return;
    }

    users[i].trainer = trainer;

    alert(`Assigned ${trainer} to ${users[i].name}`);

    renderUsers(); // refresh UI
}

// Delete User
function deleteUser(i) {
    users.splice(i, 1);
    renderUsers();
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

        ${trainers.map((t, i) => `
            <tr>
                <td>${t.name}</td>
                <td>
                    <button class="delete-btn" onclick="deleteTrainer(${i})">
                        Delete
                    </button>
                </td>
            </tr>
        `).join("")}
    `;
}
function createTrainer() {
    const name = document.getElementById("trainerNameInput").value;
    const email = document.getElementById("trainerEmailInput").value;
    const password = document.getElementById("trainerPasswordInput").value;

    if (!name || !email || !password) {
        alert("Fill all fields");
        return;
    }

    // 🔥 Send to backend (REAL WAY)
    fetch("http://localhost:5000/api/admin/create-trainer", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
    })
    .then(res => res.json())
    .then(data => {
        alert("Trainer created!");
        renderTrainers();
    });

    document.getElementById("trainerNameInput").value = "";
    document.getElementById("trainerEmailInput").value = "";
    document.getElementById("trainerPasswordInput").value = "";
}
// Delete Trainer
function deleteTrainer(i) {
    trainers.splice(i, 1);
    renderTrainers();
}

// INIT
attachLogout();
renderUsers();
renderTrainers();
