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
    const user = await User.findById(req.params.id);

    if (user.pendingRequest) {
        user.weight = user.pendingRequest.weight;
        user.pendingRequest = null;
    }

    await user.save();
    res.json({ msg: "Approved" });
});

router.post("/reject/:id", async (req, res) => {
    const user = await User.findById(req.params.id);

    user.pendingRequest = null;

    await user.save();
    res.json({ msg: "Rejected" });
});

export default router;