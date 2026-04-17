const API_URL = "http://localhost:5001/api/auth";

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (email === "" || password === "") {
        alert("Please fill in all fields");
        return;
    }
    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!res.ok) {
            alert(data.msg || "Login failed");
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("user", JSON.stringify(data.user || null));

        if (data.role === "admin") {
            window.location.href = "dashboard-admin.html";
        } else if (data.role === "trainer") {
            window.location.href = "dashboard-trainer.html";
        } else {
            window.location.href = "dashboard-user.html";
        }
    } catch (err) {
        console.error(err);
        alert("Server error. Please try again.");
    }
}

async function signup() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const height = Number(document.getElementById("height").value);
    const weight = Number(document.getElementById("weight").value);
    const goalWeight = Number(document.getElementById("goalWeight").value);

    if (name === "" || email === "" || password === "") {
        alert("Please fill in all fields");
        return;
    }

    if (height <= 0 || weight <= 0 || goalWeight <= 0) {
        alert("Height, weight, and goal weight must be positive numbers");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, height, weight, goalWeight })
        });
        const data = await res.json();

        if (res.ok) {
            alert("Account created successfully! Please login.");
            window.location.href = "login.html";
        } else {
            alert(data.msg || "Registration failed");
        }
    } catch (err) {
        console.error(err);
        alert("Server error. Check if backend is running.");
    }
}
