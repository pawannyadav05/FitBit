import bcrypt from "bcryptjs";

// const password = "pAdmin2005";  // 🔥 change here
const password = "pTrainer2005";  // 🔥 change here

const run = async () => {
    const hash = await bcrypt.hash(password, 10);
    console.log("Hashed Password:", hash);
};

run();