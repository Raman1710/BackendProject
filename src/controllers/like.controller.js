import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { isValidCommentId, isValidTweetId, isValidVideoId } from "../utils/validId.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video id is required.");
    }

    isValidVideoId(videoId);


    const findLike = await Like.findOne(
        {
            $and: [
                { video: videoId },
                { likedBy: req.user?._id }
            ]
        }
    )

    if (!findLike) {
        try {
            const like = await Like.create(
                {
                    video: videoId,
                    likedBy: req.user?._id
                }
            )

            return res.status(200)
                .json(
                    new ApiResponse(200, like, "User liked the video")
                )


        } catch (error) {
            throw new ApiError(
                error.status || 500,
                error.message || "Error while adding like to the video."
            )
        }
    }
    else {
        try {
            await findLike.deleteOne();

            return res.status(200)
                .json(
                    new ApiResponse(200, findLike, "User removed liked from the video.")
                )
        } catch (error) {
            throw new ApiError(
                error.status || 500,
                error.message || "Error while removing like from the video."
            )
        }
    }



})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const user = req.user?._id;

    if (!commentId) {
        throw new ApiError(400, "Comment id is required.");
    }

    isValidCommentId(commentId);

    const findComment = await Like.findOne(
        {
            $and: [
                { comment: commentId },
                { likedBy: user }
            ]
        }
    )

    if (!findComment) {
        try {
            const likedComment = await Like.create({
                comment: commentId,
                likedBy: user
            })

            return res.status(200)
                .json(
                    new ApiResponse(200, likedComment, "User liked the comment.")
                )
        } catch (error) {
            throw new ApiError(
                error.status || 500,
                error.message || "Error encountered while adding like to the comment."
            )
        }
    }
    else {
        try {
            await findComment.deleteOne();

            return res.status(200)
                .json(
                    new ApiResponse(200, findComment, "User removed like from the comment.")
                )
        } catch (error) {
            throw new ApiError(
                error.status || 500,
                error.message || "Error encountered while removing like from the comment."
            )
        }
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const user = req.user?._id;

    if (!tweetId) {
        throw new ApiError(400, "Tweet id is required.");
    }

    isValidTweetId(tweetId);

    const findTweet = await Like.findOne(
        {
            $and: [
                { tweet: tweetId },
                { likedBy: user }
            ]
        }
    )

    if (!findTweet) {
        //like the tweet
        try {
            const likedTweet = await Like.create({
                tweet: tweetId,
                likedBy: user
            })

            return res.status(200)
                .json(
                    new ApiResponse(200, likedTweet, "User added liked to the tweet.")
                )
        } catch (error) {
            throw new ApiError(
                error.status || 500,
                error.message || "Error while adding the like to the tweet."
            )
        }
    }
    else {
        //remove the tweet
        try {
            await findTweet.deleteOne();

            return res.status(200)
                .json(
                    new ApiResponse(200, findTweet, "User removed the like from the tweet")
                )

        } catch (error) {
            throw new ApiError(
                error.status || 500,
                error.message || "Error while removing the like from the tweet."
            )
        }


    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}