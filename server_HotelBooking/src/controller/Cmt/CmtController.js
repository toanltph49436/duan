const CmtModel = require("../../models/Cmt/CmtModel.js");

const PostCmt = async (req, res) => {
    try {
        const { userId, tourId } = req.params;
        const { rating, reviewText, replies } = req.body;

        const newCmt = await CmtModel.create({
            userId,
            tourId,
            rating,
            reviewText,
            replies
        });

        res.status(200).json({
            success: true,
            message: "Comment posted successfully",
            cmt: newCmt
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Comment posted failed",
            error: error.message
        });
    }
};

const GetCmtByTourId = async (req, res) => {
    try {
        const { tourId } = req.params;

        const cmts = await CmtModel.find({ tourId })
            .populate('userId', 'username avatar')
            .populate('replies.replierId', 'username avatar');

        res.status(200).json({
            success: true,
            message: "Get comment by tourId successfully",
            cmt: cmts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get comments by tourId",
            error: error.message,
        });
    }
};

const PostReply = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { replierId, replierType, replyText } = req.body;

        const comment = await CmtModel.findById(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        comment.replies.push({
            replierId,
            replierType,
            replyText,
            createdAt: new Date()
        });

        await comment.save();

        const updatedComment = await CmtModel.findById(commentId)
            .populate('userId', 'username avatar')
            .populate('replies.replierId', 'username avatar');

        res.status(200).json({
            success: true,
            message: "Reply posted successfully",
            cmt: updatedComment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Reply posted failed",
            error: error.message
        });
    }
};

const PutCmtByUserTour = async (req, res) => {
    try {
        const { userId, tourId } = req.params;
        const updateData = req.body;

        const cmt = await CmtModel.findOneAndUpdate(
            { userId, tourId },
            updateData,
            { new: true }
        );

        if (!cmt) {
            return res.status(404).json({ success: false, message: 'Comment not found or you have no permission' });
        }

        res.status(200).json({
            success: true,
            message: 'Update comment successfully',
            cmt,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Update comment failed',
            error: error.message,
        });
    }
};

const DeleteCmtByUserTour = async (req, res) => {
    try {
        const { userId, tourId } = req.params;

        const cmt = await CmtModel.findOneAndDelete({ userId, tourId }, { new: true });

        if (!cmt) {
            return res.status(404).json({ success: false, message: 'Comment not found or you have no permission' });
        }

        res.status(200).json({
            success: true,
            message: 'Delete comment successfully',
            cmt,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Delete comment failed',
            error: error.message,
        });
    }
};

module.exports = { PostCmt, GetCmtByTourId, PostReply, PutCmtByUserTour, DeleteCmtByUserTour };