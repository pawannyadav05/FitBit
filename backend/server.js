import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import chatRoutes from "./routes/chat.js";
import trainerRoutes from "./routes/trainer.js";
import adminRoutes from "./routes/admin.js";
import Message from "./models/Message.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is undefined. Check backend/.env");
    process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

console.log("Loaded environment variables and starting backend...");

connectDB();

app.use(cors());
app.use(express.json());

// Attach io to req
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/trainer", trainerRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
    res.send("API Running...");
});

const PORT = process.env.PORT || 5000;

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("joinRoom", (userId) => {
        if (!userId) {
            return;
        }

        socket.join(userId);
    });

    socket.on("sendMessage", async (payload) => {
        try {
            const { sender, receiver, message } = payload || {};

            if (!sender || !receiver || !message || !message.trim()) {
                return;
            }

            const newMessage = await Message.create({
                sender,
                receiver,
                message: message.trim()
            });

            const populatedMessage = await Message.findById(newMessage._id);

            io.to(receiver).emit("receiveMessage", populatedMessage);
        } catch (err) {
            console.error("Socket sendMessage error:", err);
        }
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
