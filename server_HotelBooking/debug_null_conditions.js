require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const DateSlot = require('./src/models/Tour/DateTour');
const Tour = require('./src/models/Tour/TourModel');

async function debugNullConditions() {
    try {
        // Connect to the CORRECT database that the server uses
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }
        
        // Connect to tourBooking database (same as server)
        await mongoose.connect(`${MONGODB_URI}/tourBooking`);
        console.log('Connected to MongoDB Atlas - tourBooking database');
        
        console.log('\n=== Testing Different NULL Conditions ===');
        
        // Test 1: tour: null
        const nullTours1 = await DateSlot.find({ tour: null });
        console.log(`1. tour: null - Found: ${nullTours1.length}`);
        
        // Test 2: tour: undefined
        const nullTours2 = await DateSlot.find({ tour: undefined });
        console.log(`2. tour: undefined - Found: ${nullTours2.length}`);
        
        // Test 3: $exists: false
        const nullTours3 = await DateSlot.find({ tour: { $exists: false } });
        console.log(`3. tour: { $exists: false } - Found: ${nullTours3.length}`);
        
        // Test 4: $in: [null, undefined]
        const nullTours4 = await DateSlot.find({ tour: { $in: [null, undefined] } });
        console.log(`4. tour: { $in: [null, undefined] } - Found: ${nullTours4.length}`);
        
        // Test 5: All records without population
        const allRecords = await DateSlot.find({});
        console.log(`\n5. All records (no population): ${allRecords.length}`);
        
        let nullCount = 0;
        allRecords.forEach(record => {
            if (!record.tour) {
                nullCount++;
            }
        });
        console.log(`   - Records with falsy tour field: ${nullCount}`);
        
        // Test 6: All records with population
        const allRecordsPopulated = await DateSlot.find({}).populate('tour');
        console.log(`\n6. All records (with population): ${allRecordsPopulated.length}`);
        
        let nullCountPopulated = 0;
        allRecordsPopulated.forEach(record => {
            if (!record.tour) {
                nullCountPopulated++;
            }
        });
        console.log(`   - Records with NULL populated tour: ${nullCountPopulated}`);
        
        // Show first few records for debugging
        console.log('\n=== First 5 Records (Raw) ===');
        allRecords.slice(0, 5).forEach((record, index) => {
            console.log(`${index + 1}. ID: ${record._id}`);
            console.log(`   tour field: ${record.tour}`);
            console.log(`   tour type: ${typeof record.tour}`);
            console.log(`   tour === null: ${record.tour === null}`);
            console.log(`   tour === undefined: ${record.tour === undefined}`);
            console.log(`   !record.tour: ${!record.tour}`);
            console.log('---');
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
}

debugNullConditions();