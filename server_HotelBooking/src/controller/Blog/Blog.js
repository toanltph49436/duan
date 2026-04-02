// controllers/postController.js
const Post = require("../../models/Blog/Blog.js");

// Lấy danh sách bài viết đã publish
const listPublished = async (req, res) => {
  try {
    const posts = await Post.find({ status: "published" }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách bài viết thành công",
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách bài viết",
      error: error.message,
    });
  }
};

// Xem chi tiết theo slug (cho user)
const show = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, status: "published" });
    if (!post) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bài viết" });
    }

    res.status(200).json({
      success: true,
      message: "Lấy chi tiết bài viết thành công",
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết bài viết",
      error: error.message,
    });
  }
};

// ✅ Xem chi tiết theo id (cho admin sửa)
const showById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bài viết" });
    }

    res.status(200).json({
      success: true,
      message: "Lấy chi tiết bài viết thành công",
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết bài viết",
      error: error.message,
    });
  }
};

// Tạo mới
const create = async (req, res) => {
  try {
    const newPost = await Post.create(req.body);

    res.status(201).json({
      success: true,
      message: "Tạo bài viết thành công",
      post: newPost,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Tạo bài viết thất bại",
      error: error.message,
    });
  }
};

// Cập nhật
const update = async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedPost) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bài viết để cập nhật" });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật bài viết thành công",
      post: updatedPost,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Cập nhật bài viết thất bại",
      error: error.message,
    });
  }
};

// Xóa
const destroy = async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);

    if (!deletedPost) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bài viết để xóa" });
    }

    res.status(200).json({
      success: true,
      message: "Xóa bài viết thành công",
      post: deletedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Xóa bài viết thất bại",
      error: error.message,
    });
  }
};

// ✅ API Like bài viết
const likePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } }, 
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bài viết để like" });
    }

    res.status(200).json({
      success: true,
      message: "Đã like bài viết",
      likes: post.likes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi like bài viết",
      error: error.message,
    });
  }
};
//  Lấy tất cả bài viết (admin)
const listAll = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách bài viết (admin) thành công",
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách bài viết",
      error: error.message,
    });
  }
};


module.exports = {
  listPublished,
  show,
  showById,
  create,
  update,
  destroy,
  listAll,
  likePost, // ✅ export thêm
};
