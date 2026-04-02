require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const DateSlot = require('./src/models/Tour/DateTour');

async function fixNullToursFinal() {
    try {
        // Connect to the CORRECT database that the server uses
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }
        
        // Connect to TourBooking database (same as server)
        await mongoose.connect(`${MONGODB_URI}/TourBooking`);
        console.log('Connected to MongoDB Atlas - TourBooking database');
        
        // Find all DateSlot records with NULL tours
        console.log('\n=== Finding NULL Tour Records ===');
        const nullTourSlots = await DateSlot.find({ tour: null });
        console.log(`Found ${nullTourSlots.length} DateSlot records with NULL tours`);
        
        if (nullTourSlots.length === 0) {
            console.log('No NULL tour records found. Nothing to delete.');
            return;
        }
        
        // Show the records that will be deleted
        console.log('\nRecords to be deleted:');
        nullTourSlots.forEach((slot, index) => {
            console.log(`${index + 1}. ID: ${slot._id} - Date: ${slot.date} - Available: ${slot.availableSlots}`);
        });
        
        // Delete the NULL tour records
        console.log('\n=== Deleting NULL Tour Records ===');
        const deleteResult = await DateSlot.deleteMany({ tour: null });
        console.log(`Successfully deleted ${deleteResult.deletedCount} records`);
        
        // Verify the deletion
        console.log('\n=== Verification ===');
        const remainingSlots = await DateSlot.find({}).populate('tour');
        console.log(`Remaining DateSlot records: ${remainingSlots.length}`);
        
        let nullCount = 0;
        let validCount = 0;
        
        remainingSlots.forEach(slot => {
            if (!slot.tour) {
                nullCount++;
            } else {
                validCount++;
            }
        });
        
        console.log(`- Valid tours: ${validCount}`);
        console.log(`- NULL tours: ${nullCount}`);
        
        if (nullCount === 0) {
            console.log('\n✅ SUCCESS: All NULL tour records have been removed!');
        } else {
            console.log('\n⚠️  WARNING: Some NULL tour records still remain.');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
}

fixNullToursFinal();