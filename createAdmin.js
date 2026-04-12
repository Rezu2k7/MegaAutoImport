const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./Models/User'); 
require('dotenv').config();

const createInitialAdmin = async () => {
    try {
        // 1. Connect to your database
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        // 2. Setup your details
        const username = "Rezu";
        const password = "Rezi170707"; // Change this!
        const role = "admin";

        // 3. Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log("User already exists! No need to seed.");
            process.exit();
        }

        // 4. Hash the password exactly like your server does
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Save the Admin
        const admin = new User({
            username,
            password: hashedPassword,
            role
        });

        await admin.save();
        console.log(`--- SUCCESS ---`);
        console.log(`Admin created: ${username}`);
        console.log(`Role: ${role}`);
        console.log(`--- YOU CAN NOW LOG IN ---`);

        process.exit();
    } catch (error) {
        console.error("Error seeding admin:", error);
        process.exit(1);
    }
};

createInitialAdmin();