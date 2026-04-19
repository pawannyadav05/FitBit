import express from "express";
import Message from "../models/Message.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/trainers", authMiddleware, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);

        if (currentUser && currentUser.role === "user" && currentUser.trainer) {
            // Only return the trainer explicitly assigned to this user
            const assignedTrainer = await User.findById(currentUser.trainer)
                .select("_id name email");
            return res.json(assignedTrainer ? [assignedTrainer] : []);
        }

        // Fallback: return all trainers
        const trainers = await User.find({ role: "trainer" })
            .select("_id name email")
            .sort({ name: 1 });

        return res.json(trainers);
    } catch (err) {
        console.error("Fetch trainers error:", err);
        return res.status(500).json({ msg: "Server error" });
    }
});

router.get("/users", authMiddleware, async (req, res) => {
    try {
        const users = await User.find({ role: "user" })
            .select("_id name email height weight goalWeight")
            .sort({ name: 1 });

        return res.json(users);
    } catch (err) {
        console.error("Fetch users error:", err);
        return res.status(500).json({ msg: "Server error" });
    }
});

router.get("/:userId", authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: userId },
                { sender: userId, receiver: req.user.id }
            ]
        }).sort({ timestamp: 1 });

        return res.json(messages);
    } catch (err) {
        console.error("Fetch chat messages error:", err);
        return res.status(500).json({ msg: "Server error" });
    }
});

export default router;
