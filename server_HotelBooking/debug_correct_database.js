require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const DateSlot = require('./src/models/Tour/DateTour');
const Tour = require('./src/models/Tour/TourModel');

async function debugCorrectDatabase() {
    try {
        // Connect to the CORRECT database that the server uses
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }
        
        // Connect to tourBooking database (same as server)
        await mongoose.connect(`${MONGODB_URI}/tourBooking`);
        console.log('Connected to MongoDB Atlas - tourBooking database');
        
        // Check DateSlot collection
        console.log('\n=== DateSlot Collection Analysis ===');
        const dateSlots = await DateSlot.find({}).populate('tour');
        console.log(`Total DateSlot records: ${dateSlots.length}`);
        
        let nullTours = 0;
        let validTours = 0;
        
        console.log('\nDateSlot records:');
        dateSlots.forEach((slot, index) => {
            if (!slot.tour) {
                nullTours++;
                console.log(`${index + 1}. ID: ${slot._id} - Tour: NULL`);
            } else {
                validTours++;
                console.log(`${index + 1}. ID: ${slot._id} - Tour: ${slot.tour.name || 'No name'}`);
            }
        });
        
        console.log(`\nSummary:`);
        console.log(`- Valid tours: ${validTours}`);
        console.log(`- NULL tours: ${nullTours}`);
        
        // If there are NULL tours, show deletion command
        if (nullTours > 0) {
            console.log('\n=== NULL Tour Records Found ===');
            const nullTourIds = dateSlots
                .filter(slot => !slot.tour)
                .map(slot => `ObjectId('${slot._id}')`)
                .join(', ');
            
            console.log('\nMongoDB deletion command:');
            console.log(`db.dateslots.deleteMany({ _id: { $in: [${nullTourIds}] } })`);
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
}

debugCorrectDatabase();