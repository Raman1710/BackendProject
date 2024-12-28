import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js"
import { isValidTweetId, isValidUserId } from "../utils/validId.js";


const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (content.trim() === "") {
        throw new ApiError(400, "Content is required.");
    }

    const tweet = new Tweet({
        owner: req.user?._id,
        content: content
    })

    await tweet.save();

    return res.status(201)
        .json(
            new ApiResponse(201, tweet, "Tweet is created successfully.")
        )

})

const getUserTweet = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(400, "User ID is required.");
    }

    isValidUserId(userId);

    const tweets = await Tweet.find({ owner: userId });

    if (!tweets || tweets.length === 0) {
        throw new ApiError(404, "No tweets found for this user.");
    }

    return res.status(200)
        .json(
            new ApiResponse(200, tweets, "All tweets fetched successfully.")
        );
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    isValidTweetId(tweetId);

    if (!tweetId) {
        throw new ApiError(404, "Tweet id is requied.")
    }

    const { content } = req.body;

    const tweet = await Tweet.findByIdAndUpdate(tweetId,
        {
            "$set": {
                content: content
            }
        },
        {
            new: true
        }
    )

    if(!tweet){
        throw new ApiError(500,"Error while updating the tweet.")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, tweet, "Tweet updated successfully.")
        )

})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(400, "Tweet id is required.");
    }

    isValidTweetId(tweetId);

    const tweet = await Tweet.findByIdAndDelete(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet does not exist.");
    }

    return res.status(200)
        .json(
            new ApiResponse(200, {}, "Tweet deleted successfully.")
        )
})

export {
    createTweet,
    getUserTweet,
    updateTweet,
    deleteTweet
}