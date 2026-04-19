import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Passive streak reset logic
        if (user.lastActivityDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const lastActivity = new Date(user.lastActivityDate);
            lastActivity.setHours(0, 0, 0, 0);
            
            const diffTime = today.getTime() - lastActivity.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 1 && user.streak > 0) {
                user.streak = 0;
                await user.save();
            }
        }

        res.json(user);
    } catch (err) {
        console.error("Get user error:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

router.post("/request-update", authMiddleware, async (req, res) => {
    try {
        const { weight } = req.body;

        const parsedWeight = Number(weight);

        if (Number.isNaN(parsedWeight) || parsedWeight <= 0) {
            return res.status(400).json({ msg: "Weight must be a positive number" });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        user.pendingRequest = {
            weight: parsedWeight
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (user.lastActivityDate) {
            const lastActivity = new Date(user.lastActivityDate);
            lastActivity.setHours(0, 0, 0, 0);
            
            const diffTime = today.getTime() - lastActivity.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                user.streak += 1;
            } else if (diffDays > 1) {
                user.streak = 1;
            }
        } else {
            user.streak = 1;
        }
        
        user.lastActivityDate = new Date();

        await user.save();

        // Notify trainer in real-time
        if (req.io && user.trainer) {
            req.io.to(user.trainer.toString()).emit("newRequest", {
                userId: user._id,
                name: user.name,
                weight: parsedWeight
            });
        }

        return res.status(200).json({
            msg: "Update request sent successfully",
            pendingRequest: user.pendingRequest
        });
    } catch (err) {
        console.error("Request update error:", err);
        return res.status(500).json({ msg: "Server error" });
    }
});

export default router;
