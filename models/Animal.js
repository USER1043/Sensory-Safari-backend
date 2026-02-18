import mongoose from 'mongoose';

const animalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        url: String,
        public_id: String,
    },
    audio: {
        url: String,
        public_id: String,
    },
    description: String,
    category: {
        type: String,
        enum: ['wild', 'farm', 'birds', 'insects'],
        default: 'wild'
    },
    habitat: String,
    facts: String,
});

export default mongoose.model('Animal', animalSchema);
