const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./Models/User');
require('dotenv').config();

async function hardReset() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // 1. Nuke ALL existing users to destroy any broken data
        await User.deleteMany({});
        console.log("Trash cleared.");

        // 2. Create the new, secure master account
        const hashedPassword = await bcrypt.hash("mai2026", 10); // mai2026 is your new temporary password
        
        await User.create({
            username: "Admin",
            password: hashedPassword,
            role: "admin"
        });

        console.log("--- SUCCESS ---");
        console.log("New Master Account Created!");
        console.log("Username: Revaz");
        console.log("Password: mai2026");
        process.exit();
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

hardReset();