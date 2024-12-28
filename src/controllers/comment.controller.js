import { ApiError } from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js"
import { isValidVideoId, isValidCommentId } from "../utils/validId.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Video } from "../models/video.model.js";


const getVideoComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    isValidVideoId(videoId);

    if (!videoId) {
        throw new ApiError(404, "Video id is required.")
    }

    const comment = await Comment.find({ video: videoId });

    if (!comment || comment.length === 0) {
        throw new ApiError(404, "No comments found.")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, { comment, owner, video }, "All comments fetched successfully.")
        )
})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    isValidVideoId(videoId);

    if (!videoId) {
        throw new ApiError(404, "Video id is required..")
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required.")
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found.");
    }

    const comment = new Comment({
        content: content,
        video: video._id,
        owner: video.owner
    })
    await comment.save();
    // const comment = await Comment.create(content);

    if (!comment) {
        throw new ApiError(500, "Error while creating the comment.")
    }

    return res.status(201)
        .json(
            new ApiResponse(201, { comment }, "Comment created successfully.")
        )
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    isValidCommentId(commentId);

    if (!commentId) {
        throw new ApiError(404, "Comment id is required.");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required.");
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId,
        {
            "$set": {
                content: content
            }
        },
        {
            new: true
        }
    )

    if (!updatedComment) {
        throw new ApiError(500, "Error while updating the comment.")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, updatedComment, "Comment updated successfully.")
        )
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    isValidCommentId(commentId);

    if (!commentId) {
        throw new ApiError(400, "Comment id is required.")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
        throw new ApiError(500, "Error while deleting the comment.")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, {}, "Comment deleted successfully.")
        )


})


export {
    getVideoComment,
    addComment,
    updateComment,
    deleteComment
}