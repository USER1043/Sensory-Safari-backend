import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Animal from '../models/Animal.js';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data from src/data/animals.js
const animalsData = [
    { name: "Owl", category: "birds", habitat: "Forest", facts: "Owls are birds known for their distinct calls and natural sounds." },
    { name: "Osprey", category: "birds", habitat: "Water", facts: "Ospreys are birds known for their distinct calls and natural sounds." },
    { name: "Pigeons", category: "birds", habitat: "Urban", facts: "Pigeons are birds known for their distinct calls and natural sounds." },
    { name: "Canary", category: "birds", habitat: "Home", facts: "Canaries are birds known for their distinct calls and natural sounds." },
    { name: "Finch", category: "birds", habitat: "Grassland", facts: "Finches are birds known for their distinct calls and natural sounds." },
    { name: "Lapwing", category: "birds", habitat: "Grassland", facts: "Lapwings are birds known for their distinct calls and natural sounds." },
    { name: "Yellow-rumped-warbler", category: "birds", habitat: "Forest", facts: "Yellow-rumped warblers are birds known for their distinct calls and natural sounds." },
    { name: "Peacock", category: "birds", habitat: "Tropical", facts: "Peacocks are birds known for their distinct calls and natural sounds." },
    { name: "Seagull", category: "birds", habitat: "Water", facts: "Seagulls are birds known for their distinct calls and natural sounds." },
    { name: "Mockingbird", category: "birds", habitat: "Urban", facts: "Mockingbirds are birds known for their distinct calls and natural sounds." },
    { name: "Amazon-macaw", category: "birds", habitat: "Tropical", facts: "Amazon macaws are birds known for their distinct calls and natural sounds." },
    { name: "Vulture", category: "birds", habitat: "Grassland", facts: "Vultures are birds known for their distinct calls and natural sounds." },
    { name: "Elephant", category: "wild", habitat: "Grassland", facts: "Elephants are wild animals known for their natural sounds in the ecosystem." },
    { name: "Leopard", category: "wild", habitat: "Forest", facts: "Leopards are wild animals known for their natural sounds in the ecosystem." },
    { name: "Squirrel", category: "wild", habitat: "Forest", facts: "Squirrels are wild animals known for their natural sounds in the ecosystem." },
    { name: "Fox", category: "wild", habitat: "Forest", facts: "Foxes are wild animals known for their natural sounds in the ecosystem." },
    { name: "Elk", category: "wild", habitat: "Forest", facts: "Elks are wild animals known for their natural sounds in the ecosystem." },
    { name: "Puma", category: "wild", habitat: "Forest", facts: "Pumas are wild animals known for their natural sounds in the ecosystem." },
    { name: "Gorilla", category: "wild", habitat: "Forest", facts: "Gorillas are wild animals known for their natural sounds in the ecosystem." },
    { name: "Chimpanzee", category: "wild", habitat: "Forest", facts: "Chimpanzees are wild animals known for their natural sounds in the ecosystem." },
    { name: "Bison", category: "wild", habitat: "Grassland", facts: "Bisons are wild animals known for their natural sounds in the ecosystem." },
    { name: "Tiger", category: "wild", habitat: "Forest", facts: "Tigers are wild animals known for their natural sounds in the ecosystem." },
    { name: "Wolf", category: "wild", habitat: "Forest", facts: "Wolves are wild animals known for their natural sounds in the ecosystem." },
    { name: "Rattlesnake", category: "wild", habitat: "Desert", facts: "Rattlesnakes are wild animals known for their natural sounds in the ecosystem." },
    { name: "Alligator", category: "wild", habitat: "Water", facts: "Alligators are wild animals known for their natural sounds in the ecosystem." },
    { name: "Capuchin monkey", category: "wild", habitat: "Tropical", facts: "Capuchin monkeys are wild animals known for their natural sounds in the ecosystem." },
    { name: "Donkey", category: "farm", habitat: "Farm", facts: "Donkeys are common farm animals and are easy to recognize by their sounds." },
    { name: "Pony", category: "farm", habitat: "Farm", facts: "Ponies are farm animals known for their natural sounds." },
    { name: "Turkey", category: "farm", habitat: "Farm", facts: "Turkeys are farm animals known for their natural sounds." },
    { name: "Grasshopper", category: "insects", habitat: "Grassland", facts: "Grasshoppers are small insects that produce unique buzzing or chirping sounds." },
    { name: "Cricket", category: "insects", habitat: "Grassland", facts: "Crickets are small insects that produce unique buzzing or chirping sounds." },
    { name: "Mosquito", category: "insects", habitat: "Water", facts: "Mosquitos are small insects that produce unique buzzing or chirping sounds." },
    { name: "Bee", category: "insects", habitat: "Grassland", facts: "Bees are small insects that produce unique buzzing or chirping sounds." }
];

const updateMetadata = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        for (const data of animalsData) {
            // Need to handle name matching carefully.
            // In DB, name is from filename, e.g. "amazonmacaw" or "capuchin-monkey" or "yellowrumpedwarbler"
            // In JS, name is "Amazon-macaw" or "Capuchin monkey" or "Yellow-rumped-warbler"

            // Let's allow fuzzy matching or try to normalize.
            // Easiest is to normalize both to lowercase and remove spaces/dashes.

            const normalizedJSName = data.name.toLowerCase().replace(/[\s-]/g, '');

            // We can iterate all animals in DB and check
            const animalsInDB = await Animal.find();

            let match = null;
            for (const dbAnimal of animalsInDB) {
                const normalizedDBName = dbAnimal.name.toLowerCase().replace(/[\s-]/g, '');
                if (normalizedDBName === normalizedJSName) {
                    match = dbAnimal;
                    break;
                }
                // Special case for 'cricket' vs 'crickets'
                if (normalizedJSName === 'cricket' && normalizedDBName === 'crickets') {
                    match = dbAnimal;
                    break;
                }
            }

            if (match) {
                match.category = data.category;
                match.habitat = data.habitat;
                match.facts = data.facts;
                // Optionally update the display name to be nicer (title case with spaces)
                // match.name = data.name; // Maybe not, filenames are good for IDs?
                // Actually, let's keep name as is (ID-like) and add a displayName field?
                // Or just overwrite name?
                // The frontend uses `name` for display AND logic. 
                // Existing `App.jsx` uses `animal.name` for display.
                // `animals.js` has nice names. DB has filenames.
                // Let's update `name` to the nice name! But verify filenames are stored in image/audio objects?
                // Image object has `url`, so we don't need filename for image loading anymore.
                // Audio object has `url`, so we don't need filename for audio loading either.
                // So yes, we can update `name` to the nice formatted name!

                // Wait, `MatchingGame` and `Quiz` might rely on specific name strings?
                // `MatchingGame` uses `animal.name` for matching. 
                // If we update `name` in DB to "Amazon-macaw", it should be fine as long as we use that everywhere.

                // Let's update the name to the nice one from JS.
                // But `unique: true` on name might conflict if we are not careful?
                // No, each animal is unique.

                // Wait, if I change name, will `migrate.js` (if re-run) create duplicates?
                // `migrate.js` checks `Animal.findOne({ name })` where name is filename.
                // If I change name to "Amazon-macaw", `migrate.js` looking for "amazonmacaw" will not find it and create a duplicate!
                // So I should keeping `name` as the "id" (filename-like) and add `displayName`?
                // Or just let `migrate.js` be broken for now (it's one-off).
                // Or better, keep `name` as identifier and add `title` or `displayName`?
                // The frontend `animals.js` uses `name` as the display name.

                // Let's look at `animals.js` again.
                // `name`: "Owl", `image`: "/images/owl.jpg"
                // In DB currently: `name`: "owl"

                // If I change DB `name` to "Owl", migrate.js checking "owl" (from filename) will say "not found" -> create new "owl".
                // To be safe, I should add `displayName` to schema and use that in frontend.
                // But frontend expects `name`.

                // Decision: Update `name` to the nice name. I accept `migrate.js` needs update if run again.

                match.name = data.name;

                await match.save();
                console.log(`Updated ${data.name}`);
            } else {
                console.log(`Could not find match for ${data.name}`);
            }
        }
        console.log('Metadata update complete');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

updateMetadata();
