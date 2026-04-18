import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.get("/users", async (req, res) => {
    try {
        const users = await User.find({ role: "user" });
        res.json(users);
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

router.post("/approve/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        if (user.pendingRequest) {
            user.weight = user.pendingRequest.weight;
            user.pendingRequest = null;
        }

        await user.save();
        res.json({ msg: "Approved" });
    } catch (err) {
        console.error("Approve user error:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

router.post("/reject/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        user.pendingRequest = null;

        await user.save();
        res.json({ msg: "Rejected" });
    } catch (err) {
        console.error("Reject user error:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

export default router;