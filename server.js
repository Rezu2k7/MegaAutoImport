const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
// Serve the uploads folder so photos are visible on the site
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- MONGODB CONNECTION ---
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mai_database';
mongoose.connect(mongoURI)
    .then(() => console.log("✅ MAi Database Connected!"))
    .catch(err => console.error("❌ Database Connection Error:", err));

// --- CAR SCHEMA ---
const carSchema = new mongoose.Schema({
    makeModel: String,
    auctionPrice: Number,
    transportPrice: Number,
    amountPaid: Number,
    vin: String,
    dealerId: String,
    purchaseDate: String,
    auctionName: String,
    lotNumber: String,
    buyLocation: String,
    containerNumber: String,
    containerCode: String,
    recipientFirstName: String,
    recipientLastName: String,
    recipientId: String,
    recipientPhone: String,
    images: [String],
    status: { type: String, default: 'Purchased' },
    isFeatured: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Car = mongoose.model('Car', carSchema);

// --- MULTER CONFIG (STORAGE) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per photo
});

// --- API ROUTES ---

// 1. ADD NEW CAR
app.post('/api/cars', upload.array('photos', 10), async (req, res) => {
    try {
        const { 
            makeModel, auctionPrice, transportPrice, amountPaid, vin, dealerId, 
            purchaseDate, auctionName, lotNumber, buyLocation, containerNumber, containerCode,
            recipientFirstName, recipientLastName, recipientId, recipientPhone 
        } = req.body;

        // Map the uploaded files to relative paths for the frontend
        const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
        
        const newCar = new Car({ 
            makeModel, 
            auctionPrice: Number(auctionPrice), 
            transportPrice: Number(transportPrice), 
            amountPaid: Number(amountPaid), 
            vin, 
            dealerId, 
            purchaseDate, 
            auctionName, 
            lotNumber, 
            buyLocation, 
            containerNumber, 
            containerCode,
            recipientFirstName, 
            recipientLastName, 
            recipientId, 
            recipientPhone,
            images: imagePaths, 
            status: 'Purchased', 
            isFeatured: false 
        });
        
        await newCar.save();
        res.status(201).json(newCar);
    } catch (error) { 
        console.error("MAi Save Error:", error);
        res.status(400).json({ error: "Error saving car to database." }); 
    }
});

// 2. GET ALL CARS
app.get('/api/cars', async (req, res) => {
    try {
        const cars = await Car.find().sort({ createdAt: -1 });
        res.json(cars);
    } catch (error) {
        res.status(500).json({ error: "Error fetching cars." });
    }
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 MAi Server fired up on Port ${PORT}`);
    console.log(`🌍 Public Access: https://megacars.ge`);
});
