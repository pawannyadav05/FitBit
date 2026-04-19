import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/users", authMiddleware, async (req, res) => {
    try {
        const users = await User.find({ role: "user", trainer: req.user.id });
        res.json(users);
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

router.post("/approve/:id", authMiddleware, async (req, res) => {
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
        
        // Notify user in real-time
        if (req.io) {
            req.io.to(user._id.toString()).emit("weightUpdated", {
                weight: user.weight
            });
        }

        res.json({ msg: "Approved" });
    } catch (err) {
        console.error("Approve user error:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

router.post("/reject/:id", authMiddleware, async (req, res) => {
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

router.post("/assign-plan/:userId", authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const { dietPlan, workoutPlan } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Verify that the user is assigned to this trainer
        if (user.trainer.toString() !== req.user.id) {
            return res.status(403).json({ msg: "Not authorized to assign plan to this user" });
        }

        user.dietPlan = dietPlan;
        user.workoutPlan = workoutPlan;

        await user.save();

        // Notify user in real-time
        if (req.io) {
            req.io.to(user._id.toString()).emit("planUpdated", {
                dietPlan: user.dietPlan,
                workoutPlan: user.workoutPlan
            });
        }

        res.json({ msg: "Plan assigned successfully" });
    } catch (err) {
        console.error("Assign plan error:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

export default router;