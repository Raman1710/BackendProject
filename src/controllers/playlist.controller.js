import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { isValidPlaylistId, isValidUserId, isValidVideoId } from "../utils/validId.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, video } = req.body;
    const { _id } = req.user?._id;

    if (!name || !description || name.trim() === "" || description.trim() === "") {
        throw new ApiError(400, "All fields are required.");
    }

    const existingPlaylist = await Playlist.findOne({
        $and: [
            {
                name: name
            },
            {
                owner: _id
            }
        ]
    })

    if (existingPlaylist) {
        throw new ApiError(400, "Playlist with given name already exist.");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: _id
    })

    if (!playlist) {
        throw new ApiError(500, "Error while creating the playlist.")
    }

    return res.status(200)
        .json(
            new ApiResponse(201, playlist, "Playlist created successfully.")
        )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!userId) {
        throw new ApiError(400, "User id is required.");
    }

    isValidUserId(userId);

    try {
        const playlist = await Playlist.find({ owner: userId });

        if (!playlist || playlist.length === 0) {
            return res.status(404)
                .json(
                    new ApiResponse(404, "No playlist found.")
                )
        }

        return res.status(200)
            .json(
                new ApiResponse(200, playlist, "Playlist fetched successfully.")
            )
    } catch (error) {
        throw new ApiError(
            error.status || 500,
            error.message || "Error while fetching the playlist."
        )
    }


})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Playlist id is required.")
    }

    isValidPlaylistId(playlistId);

    try {
        const playlist = await Playlist.findById(playlistId);

        if (!playlist) {
            return res.status(404)
                .json(
                    new ApiResponse(404, "Playlist not found.")
                )
        }

        return res.status(200)
            .json(
                new ApiResponse(200, playlist, "Playlist fetched successfully.")
            )

    } catch (error) {
        throw new ApiError(
            error.status || 500,
            error.message || "Error while fetching the playlist"
        );

    }

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Playlist id is required.");
    }

    isValidPlaylistId(playlistId);

    if (!videoId) {
        throw new ApiError(400, "Video id is required.");
    }

    isValidVideoId(videoId);

    try {

        const playlist = await Playlist.findById(playlistId);

        if (!playlist) {
            return res.status(404)
                .json(
                    new ApiResponse(404, {}, "Playlist not found.")
                )
        }

        if (playlist.video.includes(videoId)) {
            return res.status(400)
                .json(
                    new ApiResponse(400, playlist, "Video is already in the playlist.")
                )
        }

        playlist.video.push(videoId);

        await playlist.save();

        return res.status(200)
            .json(
                new ApiResponse(200, playlist, "Video added in the playlist successfully.")
            )

    } catch (error) {
        throw new ApiError(
            error.status || 500,
            error.message || "Error while adding the video to the playlist."
        )
    }

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist
    if (!playlistId) {
        throw new ApiError(400, "Playlist id is required.");
    }

    isValidPlaylistId(playlistId);

    if (!videoId) {
        throw new ApiError(400, "Video id is required.");
    }

    isValidVideoId(videoId);

    try {

        const playlist = await Playlist.findById(playlistId);

        if (!playlist) {
            return res.status(404)
                .json(
                    new ApiResponse(404, {}, "Playlist not found.")
                )
        }

        if (!playlist.video.includes(videoId)) {
            return res.status(404)
                .json(
                    new ApiResponse(404, playlist, "Video is not found in the playlist")
                )
        }

        const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
            {
                $pull: {
                    video: videoId
                }
            },
            {
                new: true
            }
        )

        return res.status(200)
            .json(
                new ApiResponse(200, updatedPlaylist, "Video removed from the playlist successfully.")
            )

    } catch (error) {
        throw new ApiError(
            error.status || 500,
            error.message || "Error while removing the video from the playlist."
        )
    }



})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Playlist id is required.")
    }

    isValidPlaylistId(playlistId);

    try {
        const removedPlaylist = await Playlist.findByIdAndDelete(playlistId);

        if (!removedPlaylist) {
            return res.status(404).json(
                new ApiResponse(404, {}, "Playlist not found.")
            )
        }

        return res.status(200)
            .json(
                new ApiResponse(200, removedPlaylist, "Playlist removed successfully.")
            )

    } catch (error) {
        throw new ApiError(
            error.status || 500,
            error.message || "Error while deleting the playlist."
        )
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required.");
    }
    if (!name || name.trim() === "") {
        throw new ApiError(400, "Name is required and cannot be empty.");
    }
    if (!description || description.trim() === "") {
        throw new ApiError(400, "Description is required and cannot be empty.");
    }

    isValidPlaylistId(playlistId);

    try {
        const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
            {
                $set: {
                    name: name.trim(),
                    description: description.trim()
                }
            },
            {
                new: true
            }
        )

        if (!updatedPlaylist) {
            throw new ApiError(404, "Playlist not found.")
        }

        return res.status(200)
            .json(
                new ApiResponse(200, updatedPlaylist, "Playlist details updated successfully.")
            )


    } catch (error) {
        throw new ApiError(
            error.status || 500,
            error.message || "Error while updating the playlist."
        )
    }
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}