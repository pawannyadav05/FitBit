import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    console.log("Register route hit");
    console.log("Incoming body:", req.body);

    try {
        const { name, email, password, height, weight, goalWeight } = req.body;

        if (!name || !email || !password || height == null || weight == null || goalWeight == null) {
            return res.status(400).json({
                msg: "Please provide name, email, password, height, weight, and goal weight"
            });
        }

        const parsedHeight = Number(height);
        const parsedWeight = Number(weight);
        const parsedGoalWeight = Number(goalWeight);

        if (
            Number.isNaN(parsedHeight) || parsedHeight <= 0 ||
            Number.isNaN(parsedWeight) || parsedWeight <= 0 ||
            Number.isNaN(parsedGoalWeight) || parsedGoalWeight <= 0
        ) {
            return res.status(400).json({ msg: "Height, weight, and goal weight must be positive numbers" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ msg: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            height: parsedHeight,
            weight: parsedWeight,
            startWeight: parsedWeight,
            goalWeight: parsedGoalWeight,
            role: "user"
        });

        await user.save();
        return res.status(201).json({ msg: "User registered successfully" });
    } catch (err) {
        console.error("Register route error:", err);
        return res.status(500).json({ msg: "Server error" });
    }
});

router.post("/login", async (req, res) => {
    console.log("Login route hit");
    console.log("Incoming body:", req.body);

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: "Please provide email and password" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.json({
            token,
            role: user.role,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                height: user.height,
                weight: user.weight,
                startWeight: user.startWeight,
                goalWeight: user.goalWeight,
                role: user.role
            }
        });
    } catch (err) {
        console.error("Login route error:", err);
        return res.status(500).json({ msg: "Server error" });
    }
});

export default router;
