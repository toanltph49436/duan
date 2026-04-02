const mongoose = require('mongoose');

const UserModel = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone_number: { type: String, required: true },
    address: { type: String },
    avatar: {
        type: String,
        default:
            "https://png.pngtree.com/element_our/20200610/ourmid/pngtree-character-default-avatar-image_2237203.jpg",
      },
    role: { type: String, enum: ['user', 'member']}
}, { timestamps: true })

module.exports = mongoose.model("User", UserModel)