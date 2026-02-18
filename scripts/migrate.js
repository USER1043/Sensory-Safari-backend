import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import Animal from '../models/Animal.js';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log(`☁️  Cloudinary Configured with Cloud Name: "${process.env.CLOUDINARY_CLOUD_NAME}"`);
console.log(`🔑 API Key: "${process.env.CLOUDINARY_API_KEY ? 'Present' : 'Missing'}"`);
console.log(`🔒 API Secret: "${process.env.CLOUDINARY_API_SECRET ? 'Present' : 'Missing'}"`);

// Paths to your local assets
const IMAGES_DIR = path.resolve(__dirname, '../../SensorySafari/public/images');
const AUDIO_DIR = path.resolve(__dirname, '../../SensorySafari/public/audio');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const uploadFile = async (filePath, folder, resourceType = 'image') => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: `sensory-safari/${folder}`,
            resource_type: resourceType,
        });
        return { url: result.secure_url, public_id: result.public_id };
    } catch (error) {
        console.error(`Error uploading ${filePath}:`, error);
        return null;
    }
};

const migrateData = async () => {
    console.log('🔄 Starting migration...');
    await connectDB();

    try {
        const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

        console.log(`📁 Reading images from: ${IMAGES_DIR}`);
        if (!fs.existsSync(IMAGES_DIR)) {
            throw new Error(`Images directory not found at ${IMAGES_DIR}`);
        }

        const files = fs.readdirSync(IMAGES_DIR);
        const imageFiles = files.filter(file => validExtensions.includes(path.extname(file).toLowerCase()));

        console.log(`🔢 Found ${imageFiles.length} images to process.`);

        for (const [index, file] of imageFiles.entries()) {
            const ext = path.extname(file).toLowerCase();
            const name = path.basename(file, ext); // e.g., 'alligator' from 'alligator.jpg'
            const imagePath = path.join(IMAGES_DIR, file);
            const audioPath = path.join(AUDIO_DIR, `${name}.mp3`); // Assuming matching mp3 name

            console.log(`\n[${index + 1}/${imageFiles.length}] Processing ${name}...`);

            // Check if animal already exists to avoid duplicates
            const existing = await Animal.findOne({ name });
            if (existing) {
                console.log(`⚠️  Skipping ${name}, already exists in DB.`);
                continue;
            }

            // Upload Image
            console.log(`   📸 Uploading image...`);
            const imageData = await uploadFile(imagePath, 'images', 'image');
            if (!imageData) {
                console.log(`   ❌ Failed to upload image for ${name}`);
                continue;
            }

            // Upload Audio (if exists)
            let audioData = { url: '', public_id: '' };
            if (fs.existsSync(audioPath)) {
                console.log(`   🎵 Uploading audio...`);
                const audioResult = await uploadFile(audioPath, 'audio', 'video'); // fast_upload for audio often uses resource_type: video or auto
                if (audioResult) {
                    audioData = audioResult;
                }
            } else {
                console.log(`   ℹ️  No audio file found for ${name}`);
            }

            // Save to MongoDB
            const newAnimal = new Animal({
                name,
                image: imageData,
                audio: audioData,
                description: `Description for ${name}`, // Placeholder description
            });

            await newAnimal.save();
            console.log(`   ✅ Saved ${name} to database.`);
        }

        console.log('\n🎉 Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
};

migrateData();
