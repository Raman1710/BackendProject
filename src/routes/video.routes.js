import { Router } from "express";
import { updateVideo, deleteVideo, getVideoById, publishAVideo, togglePublishStatus } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/publish").post(
    upload.fields([
        {
            name: "video",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishAVideo);
router.route("/get-video/:videoId").post(getVideoById);
router.route("/delete/:videoId").delete(deleteVideo);
router.route("/update-video/:videoId").patch(
    upload.fields([
        {
            name: "video",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }]),
    updateVideo);
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;