require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const DateSlot = require('./src/models/Tour/DateTour');
const Tour = require('./src/models/Tour/TourModel');

async function fixInvalidTourRefs() {
    try {
        // Connect to the CORRECT database that the server uses
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }
        
        // Connect to TourBooking database (same as server)
        await mongoose.connect(`${MONGODB_URI}/TourBooking`);
        console.log('Connected to MongoDB Atlas - TourBooking database');
        
        console.log('\n=== Finding DateSlots with Invalid Tour References ===');
        
        // Get all DateSlot records
        const allDateSlots = await DateSlot.find({});
        console.log(`Total DateSlot records: ${allDateSlots.length}`);
        
        // Get all valid Tour IDs
        const allTours = await Tour.find({}, '_id');
        const validTourIds = allTours.map(tour => tour._id.toString());
        console.log(`Total valid Tour records: ${validTourIds.length}`);
        
        // Find DateSlots with invalid tour references
        const invalidDateSlots = [];
        const validDateSlots = [];
        
        for (const dateSlot of allDateSlots) {
            const tourIdString = dateSlot.tour.toString();
            if (!validTourIds.includes(tourIdString)) {
                invalidDateSlots.push(dateSlot);
            } else {
                validDateSlots.push(dateSlot);
            }
        }
        
        console.log(`\nDateSlots with valid tour references: ${validDateSlots.length}`);
        console.log(`DateSlots with INVALID tour references: ${invalidDateSlots.length}`);
        
        if (invalidDateSlots.length === 0) {
            console.log('\n✅ No invalid tour references found!');
            return;
        }
        
        // Show invalid records
        console.log('\n=== Invalid DateSlot Records ===');
        invalidDateSlots.forEach((slot, index) => {
            console.log(`${index + 1}. ID: ${slot._id}`);
            console.log(`   Tour ID: ${slot.tour}`);
            console.log(`   Date: ${slot.date}`);
            console.log(`   Available Slots: ${slot.availableSlots}`);
            console.log('---');
        });
        
        // Delete invalid records
        console.log('\n=== Deleting Invalid Records ===');
        const invalidIds = invalidDateSlots.map(slot => slot._id);
        const deleteResult = await DateSlot.deleteMany({ _id: { $in: invalidIds } });
        console.log(`Successfully deleted ${deleteResult.deletedCount} invalid DateSlot records`);
        
        // Verify the fix
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
            console.log('\n✅ SUCCESS: All invalid tour references have been removed!');
            console.log('The API should now return only valid tour records.');
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

fixInvalidTourRefs();