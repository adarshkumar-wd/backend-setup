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

    const video = await Video.create({
        videoFile : uploadedVideo.url,
        thumbnail : uploadedThumbnail.url,
        title,
        description,
        duration : uploadedVideo.duration,
        views :0,
        isPublished : true,
        owner : req?.user._id
    })

    if (!video) {
        throw new ApiError(500 , "something went wrong while save the video data in database")
    }

    const videoData = await Video.findById(video._id)

    if (!videoData) {
        throw new ApiError(410 , "video data not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            videoData,
            "video uploaded successfully"
        )
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if (!videoId) {
        throw new ApiError(400 , "videoId not found")
    }

    const selectedVideo = await Video.findById(videoId)

    if (!selectedVideo) {
        throw new ApiError(400 , "Video not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            selectedVideo,
            "video fetched sucessfully"
        )
    )

})

const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    const {title , description} = req.body
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400 , "videoId not found")
    }

    const thumbnailLocalPath = req.file?.path

    if (!thumbnailLocalPath) {
        throw new ApiError("Thumbnail not found")
    }

    const uploadThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    const videoData = await Video.findByIdAndUpdate(videoId , 
        {
            $set : {
                title,
                description,
                thumbnail : uploadThumbnail.url
            }
        },
        {
            new : true
        }
    )

    if (!videoData) {
        throw new ApiError(401 , "video not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            videoData,
            "video data updated sucessfully"
        )
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!videoId) {
        throw new ApiError(400 , "videoId not found")
    }

    const deleteVideo = await Video.deleteOne({_id : videoId})

    if (deleteVideo.deletedCount === 0) {
        throw new ApiError(500 , "something went wrong while deleting the video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "video deleted sucessfully"
        )
    )

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400 , "videoId not found")
    }

    const video = await Video.findByIdAndUpdate(videoId)

    if (!video) {
        throw new ApiError(401 , "video not found")
    }

    video.isPublished = !video.isPublished
    await video.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "toggle publish sucessfull"
        )
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