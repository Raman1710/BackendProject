import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import {isValidVideoId} from "../utils/validId.js"




const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (
        [title, description].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required.")
    }

    const videoLocalPath = req.files?.video[0]?.path;

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required.")
    }


    const thumbnailLocalPath = req.files?.thumbnail[0].path;
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required.")
    }

    const video = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    console.log(video)
    if (!video || !thumbnail) {
        throw new ApiError(500, "Either video or thumbnail is not uploaded.")
    }

    const publishedVideo = await Video.create({
        title,
        description,
        video: video.url,
        thumbnail: thumbnail.url,
        isPublished: true,
        owner: req.user,
        duration: video.duration
    })

    return res.status(200)
        .json(
            new ApiResponse(200, publishedVideo, "Video is published successfully.")
        )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400, "Video id is required.")
    }

    isValidVideoId(videoId);


    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video does not exists.")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, video, "Video fetched successfully.")
        )
})

//all fields are required while updating video details
// const updateVideo = asyncHandler(async (req, res) => {
//     const { videoId } = req.params
//     isValidVideoId(videoId);
//     //TODO: update video details like title, description, thumbnail

//     const { title, description } = req.body;

//     if(!title || !description){
//         throw new ApiError(400, "All fields are required.")
//     }

//     const videoLocalPath = req.files?.video[0]?.path;

//     if (!videoLocalPath) {
//         throw new ApiError(400, "Video file is required.")
//     }


//     const thumbnailLocalPath = req.files?.thumbnail[0].path;
//     if (!thumbnailLocalPath) {
//         throw new ApiError(400, "Thumbnail file is required.")
//     }

//     const video = await uploadOnCloudinary(videoLocalPath);
//     const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

//     if (!video.url || !thumbnail.url) {
//         throw new ApiError(500, "Either video or thumbnail is not uploaded.")
//     }

//     const updatedVideo =  await Video.findByIdAndUpdate(
//         videoId,
//         {
//             $set:{
//                 title: title,
//                 description: description,
//                 video: video.url,
//                 thumbnail: thumbnail.url
//             }
//         },
//         {
//             new: true
//         }
//     )

//     return res.status(200)
//     .json(
//         new ApiResponse(200, updatedVideo ,"Successfully updated video details.")
//     )
// })


//not required to provide all fields while updating the video details
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if(!videoId){
        throw new ApiError(400, "Video id is required.")
    }

    isValidVideoId(videoId);

    const { title, description } = req.body;
    const videoLocalPath = req.files?.video?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    // Prepare the update object
    const updateFields = {};

    // Conditionally update fields if they are provided
    if (title) {
        updateFields.title = title;
    }
    if (description) {
        updateFields.description = description;
    }

    // Only upload video if a new video file is provided
    let video;
    if (videoLocalPath) {
        video = await uploadOnCloudinary(videoLocalPath);
        if (!video?.url) {
            throw new ApiError(500, "Video file is not uploaded.");
        }
        updateFields.video = video.url;
    }

    // Only upload thumbnail if a new thumbnail file is provided
    let thumbnail;
    if (thumbnailLocalPath) {
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (!thumbnail?.url) {
            throw new ApiError(500, "Thumbnail file is not uploaded.");
        }
        updateFields.thumbnail = thumbnail.url;
    }

    // If no valid fields are provided, throw an error
    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "At least one field (title, description, video, or thumbnail) must be provided.");
    }

    // Update the video in the database
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateFields },
        { new: true } // Return the updated document
    );

    if (!updatedVideo) {
        throw new ApiError(404, "Video not found.");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Successfully updated video details.")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    
    if(!videoId){
        throw new ApiError(400, "Video id is required.")
    }

    isValidVideoId(videoId);

    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) {
        throw new ApiError(500, "Error while deleting the video.")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, deletedVideo, "Video deleted successfully.")
        )

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    isValidVideoId(videoId);

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video does not exists.")
    }

    video.isPublished = !video.isPublished;

    await video.save();

    return res.status(200)
    .json(
        new ApiResponse(200, video , "Video published status updated successfully.")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}