import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if (!title) {
        throw new ApiError(400 , "Title must be required")
    }

    if (!description) {
        throw new ApiError(400 , "Description must be required")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if (!videoLocalPath) {
        throw new ApiError(400 , "video must be required")
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400 , "thumbnail must be required")
    }

    const uploadedVideo = await uploadOnCloudinary(videoLocalPath)
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!uploadedVideo) {
        throw new ApiError(500 , "something went wrong while uploading the video on cloudinary")
    }

    if (!uploadedThumbnail) {
        throw new ApiError(500 , "something went wrong while uploading thumbnail on cloudinary")
    }

    const video = Video.create({
        videoFile : uploadedVideo.url,
        thumbnail : uploadedThumbnail.url,
        title,
        description,
        duration : uploadedVideo.duration,
        views,
        isPublished,
        owner : req?.user._id
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            video,
            "video uploaded successfully"
        )
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}