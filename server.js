const express = require('express'); 
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

const User = require('./Models/User');
const Car = require('./Models/Car');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// FIXED: Explicitly serve the root and uploads so the browser can see everything
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// FIXED HOME ROUTE: Ensures index.html is always found
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storage });

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mai_database')
    .then(() => console.log('✅ MAi Database Connected!'))
    .catch(err => console.log("Database connection error:", err));

// --- ALL YOUR ORIGINAL ROUTES RESTORED ---
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: "User not found" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });
        res.json({ username: user.username, role: user.role });
    } catch (error) { res.status(500).json({ error: "Server error" }); }
});

app.get('/api/cars', async (req, res) => {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json(cars);
});

app.post('/api/cars', upload.array('photos', 10), async (req, res) => {
    try {
        const imagePaths = req.files.map(file => file.filename);
        const newCar = new Car({ ...req.body, images: imagePaths });
        await newCar.save();
        res.status(201).json(newCar);
    } catch (error) { res.status(400).json({ error: "Error saving car." }); }
});

// ... (Keeping all your other PATCH/DELETE routes exactly as they were) ...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
