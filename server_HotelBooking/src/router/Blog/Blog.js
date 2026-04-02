// routes/blogRoutes.js (CommonJS)
const express = require("express");
const router = express.Router();

const {
  listPublished,
  show,
  showById,
  create,
  update,
  listAll,
  destroy,
  likePost
} = require("../../controller/Blog/Blog.js");

// Public (User)
router.get("/blog", listPublished);        // GET danh sách bài viết published
router.get("/blog/:slug", show);           // GET chi tiết bài viết theo slug
router.get("/admin/blog",listAll);         // tất cả danh sách bài viết

// Admin (CRUD)
router.get("/posts/:id", showById);
router.post("/posts", create);             // POST tạo bài viết
router.put("/posts/:id", update);          // PUT cập nhật
router.delete("/posts/:id", destroy);      // DELETE xóa

router.post("/posts/:id/like", likePost);

module.exports = router;
