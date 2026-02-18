import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = process.env.FRONTEND_URL;

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
import Animal from './models/Animal.js';

const upload = multer({ storage: multer.memoryStorage() });
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (ensure these are set in .env)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (buffer, folder, resourceType = 'image') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: `sensory-safari/${folder}`, resource_type: resourceType },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

app.get('/api/animals', async (req, res) => {
    try {
        const animals = await Animal.find();
        res.json(animals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/animals', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'sound', maxCount: 1 }]), async (req, res) => {
    try {
        const { name, category, habitat, facts, description } = req.body;
        let imageUrl = req.body.image; // Could be a URL string
        let imagePublicId = '';
        let soundUrl = req.body.sound; // Could be a URL string
        let soundPublicId = '';

        // Handle Image Upload
        if (req.files['image']) {
            const result = await uploadToCloudinary(req.files['image'][0].buffer, 'images', 'image');
            imageUrl = result.secure_url;
            imagePublicId = result.public_id;
        }

        // Handle Audio Upload
        if (req.files['sound']) {
            const result = await uploadToCloudinary(req.files['sound'][0].buffer, 'audio', 'video'); // Audio uses 'video' resource_type often
            soundUrl = result.secure_url;
            soundPublicId = result.public_id;
        }

        const newAnimal = new Animal({
            name,
            category,
            habitat,
            facts,
            description: description || facts,
            image: {
                url: imageUrl,
                public_id: imagePublicId
            },
            audio: {
                url: soundUrl,
                public_id: soundPublicId
            }
        });

        const savedAnimal = await newAnimal.save();
        res.status(201).json(savedAnimal);
    } catch (err) {
        console.error('Error adding animal:', err);
        res.status(400).json({ message: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('Sensory Safari API is running');
});

const mongoUri = process.env.MONGODB_URI;

mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
