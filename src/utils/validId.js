import { isValidObjectId } from "mongoose";
import { ApiError } from "./apiError.js";

const isValidVideoId = (videoId) => {
    const isValid = isValidObjectId(videoId);

    if (!isValid) {
        throw new ApiError(400, "Invalid video id format.")

    }
}

const isValidUserId = (userId) => {
    const isValid = isValidObjectId(userId);

    if (!isValid) {
        throw new ApiError(400, "Invalid user id format.")

    }
}

const isValidTweetId = (tweetId) => {
    const isValid = isValidObjectId(tweetId);

    if (!isValid) {
        throw new ApiError(400, "Invalid tweet id format.")

    }
}

const isValidCommentId = (commentId) => {
    const isValid = isValidObjectId(commentId);

    if (!isValid) {
        throw new ApiError(400, "Invalid comment id format.")

    }
}

export {
    isValidVideoId,
    isValidCommentId,
    isValidUserId,
    isValidTweetId
};