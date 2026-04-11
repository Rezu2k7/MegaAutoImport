const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./Models/User');
const Car = require('./Models/Car');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storage });

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MAi Database Connected!'))
    .catch(err => console.log(err));

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, role });
        await newUser.save();
        res.status(201).json({ message: "User Created" });
    } catch (error) { res.status(400).json({ error: "Username already exists." }); }
});

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

// UPDATED: Save the recipient details
app.post('/api/cars', upload.array('photos', 10), async (req, res) => {
    try {
        const { 
            makeModel, auctionPrice, transportPrice, amountPaid, vin, dealerId, 
            purchaseDate, auctionName, lotNumber, buyLocation, containerNumber, containerCode,
            recipientFirstName, recipientLastName, recipientId, recipientPhone 
        } = req.body;
        const imagePaths = req.files.map(file => file.filename);
        
        const newCar = new Car({ 
            makeModel, 
            auctionPrice: Number(auctionPrice), transportPrice: Number(transportPrice), amountPaid: Number(amountPaid), 
            vin, dealerId, 
            purchaseDate, auctionName, lotNumber, buyLocation, containerNumber, containerCode,
            recipientFirstName, recipientLastName, recipientId, recipientPhone,
            images: imagePaths, status: 'Purchased', isFeatured: false 
        });
        
        await newCar.save();
        res.status(201).json(newCar);
    } catch (error) { res.status(400).json({ error: "Error saving car." }); }
});

// UPDATED: Edit the recipient details
app.patch('/api/cars/:id', async (req, res) => {
    try {
        const { 
            makeModel, auctionPrice, transportPrice, amountPaid, vin, dealerId, 
            purchaseDate, auctionName, lotNumber, buyLocation, containerNumber, containerCode,
            recipientFirstName, recipientLastName, recipientId, recipientPhone
        } = req.body;
        const updatedCar = await Car.findByIdAndUpdate(req.params.id, { 
            makeModel, 
            auctionPrice: Number(auctionPrice), transportPrice: Number(transportPrice), amountPaid: Number(amountPaid), 
            vin, dealerId,
            purchaseDate, auctionName, lotNumber, buyLocation, containerNumber, containerCode,
            recipientFirstName, recipientLastName, recipientId, recipientPhone
        }, { new: true });
        res.json(updatedCar);
    } catch (error) { res.status(400).json({ error: "Failed to update car details." }); }
});

app.delete('/api/cars/:id', async (req, res) => {
    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

app.patch('/api/cars/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await Car.findByIdAndUpdate(req.params.id, { status });
        res.json({ message: "Status updated successfully" });
    } catch (error) { res.status(400).json({ error: "Failed to update status." }); }
});

app.get('/api/cars/featured', async (req, res) => {
    try {
        const featuredCar = await Car.findOne({ isFeatured: true });
        res.json(featuredCar || null);
    } catch (error) { res.status(500).json({ error: "Server error" }); }
});

app.patch('/api/cars/:id/feature', async (req, res) => {
    try {
        await Car.updateMany({}, { $set: { isFeatured: false } });
        await Car.findByIdAndUpdate(req.params.id, { isFeatured: true });
        res.json({ message: "Deal of the Day updated!" });
    } catch (error) { res.status(400).json({ error: "Failed to feature car." }); }
});

app.patch('/api/cars/:id/documents', upload.array('docs', 5), async (req, res) => {
    try {
        const newDocs = req.files.map(f => ({ originalName: f.originalname, filename: f.filename }));
        const updatedCar = await Car.findByIdAndUpdate(req.params.id, { $push: { documents: { $each: newDocs } } }, { new: true });
        res.json(updatedCar);
    } catch (error) { res.status(400).json({ error: "Failed to upload documents." }); }
});

app.listen(5000, () => console.log("Server: http://localhost:5000"));