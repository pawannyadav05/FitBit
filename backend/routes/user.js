import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

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

        await user.save();

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
