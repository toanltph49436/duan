const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
    dayNumber: { type: String, required: true }, 
    activity: { type: String, required: true },
    location: { type: String, required: true },
    imageTourSchedule: [{ type: String }]
});

const TourScheduleSchema = new mongoose.Schema({
    Tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tour",
        required: true,
        unique: true,  // 1 tour chỉ có 1 lịch trình
    },
    schedules: [ScheduleSchema]
}, { timestamps: true });

module.exports = mongoose.model("TourSchedule", TourScheduleSchema);
