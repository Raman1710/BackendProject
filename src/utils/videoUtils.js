import {isValidObjectId} from "mongoose";

const isValidVideoId = (videoId) => {
    const isValid = isValidObjectId(videoId);

    if (!isValid) {
        throw new ApiError(400, "Invalid video id format.")

    }
}

export default isValidVideoId;