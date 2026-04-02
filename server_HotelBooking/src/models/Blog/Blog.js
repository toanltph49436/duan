// models/Post.js
const mongoose = require("mongoose");
const slugify = require("slugify");

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    image_url: String,
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    slug: { type: String, unique: true },
    author_name: { type: String, default: "Admin" },
    likes: { type: Number, default: 0 }, // 👈 thêm dấu phẩy trước dòng này
  },
  { timestamps: true }
);

// Tạo slug từ title
PostSchema.pre("validate", function (next) {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Post", PostSchema);
