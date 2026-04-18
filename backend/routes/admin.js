import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({ msg: "Access Denied. Admins only." });
    }
};

router.use(authMiddleware, adminMiddleware);

// GET /api/admin/users
router.get("/users", async (req, res) => {
    try {
        const users = await User.find({ role: "user" }).populate("trainer", "name email");
        
        const formattedUsers = users.map(u => ({
            ...u._doc,
            trainer: u.trainer ? u.trainer.name : null
        }));
        res.json(formattedUsers);
    } catch (err) {
        console.error("Get users error:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

// GET /api/admin/trainers
router.get("/trainers", async (req, res) => {
    try {
        const trainers = await User.find({ role: "trainer" });
        res.json(trainers);
    } catch (err) {
        console.error("Get trainers error:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

// POST /api/admin/assign
router.post("/assign", async (req, res) => {
    try {
        const { userId, trainerId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: "User not found" });

        const trainer = await User.findById(trainerId);
        if (!trainer || trainer.role !== "trainer") {
            return res.status(400).json({ msg: "Invalid trainer" });
        }

        user.trainer = trainerId;
        await user.save();
        res.json({ msg: "Trainer assigned successfully" });
    } catch (err) {
        console.error("Assign trainer error:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

// DELETE /api/admin/delete-user/:id
router.delete("/delete-user/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ msg: "User not found" });
        res.json({ msg: "User deleted" });
    } catch (err) {
        console.error("Delete user error:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

// POST /api/admin/create-trainer
router.post("/create-trainer", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ msg: "Please provide all fields" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newTrainer = new User({
            name,
            email,
            password: hashedPassword,
            role: "trainer"
        });

        await newTrainer.save();
        res.status(201).json({ msg: "Trainer created" });
    } catch (err) {
        console.error("Create trainer error:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

// DELETE /api/admin/delete-trainer/:id
router.delete("/delete-trainer/:id", async (req, res) => {
    try {
        const trainer = await User.findByIdAndDelete(req.params.id);
        if (!trainer) return res.status(404).json({ msg: "Trainer not found" });
        
        // Unassign from users
        await User.updateMany({ trainer: req.params.id }, { $set: { trainer: null } });

        res.json({ msg: "Trainer deleted" });
    } catch (err) {
        console.error("Delete trainer error:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

export default router;
