import bcrypt from "bcryptjs";

const password = "pTrainer2005";

const run = async () => {
    const hash = await bcrypt.hash(password, 10);
    console.log("Hashed Password:", hash);
};

run();
