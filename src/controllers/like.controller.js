import mongoose, { isValidObjectId } from "mongoose"
import { Likes } from "../models/likes.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video

    if (!videoId) {
        throw new ApiError(400, "video Id not found")
    }

    const likedVideo = await Likes.findOne({ Video: videoId })

    if (likedVideo) {

        await Likes.deleteOne({
            Video: videoId
        })

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "video deslike successfully"
                )
            )

    } else {
        const videoLikeData = await Likes.create({
            Video: videoId
        })

        if (!videoLikeData) {
            throw new ApiError(
                500,
                "something went wrong while creating the data"
            )
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    videoLikeData,
                    "video like successfully"
                )
            )
    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment

    if (!commentId) {
        throw new ApiError(400, "comment Id not found")
    }

    const likedComment = await Likes.findOne({
        comment: commentId
    })

    if (likedComment) {

        await Likes.deleteOne({
            comment: commentId
        })

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "comment dislike successfully"
                )
            )

    } else {

        const commentLikeData = await Likes.create({
            comment: commentId
        })

        if (!commentLikeData) {
            throw new ApiError(500, "something went wrong while creating the comment like data")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    commentLikeData,
                    "comment liked successfully"
                )
            )

    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet

    if (!tweetId) {
        throw new ApiError(400, "tweet Id not found")
    }

    const likedTweet = await Likes.findOne({
        tweet: tweetId
    })

    if (likedTweet) {

        await Likes.deleteOne({
            tweet: tweetId
        })

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "tweet dislike successfully"
                )
            )

    } else {

        const tweetLikeData = await Likes.create({
            tweet: tweetId
        })

        if (!tweetLikeData) {
            throw new ApiError(500, "something went wrong while creating the tweet like data")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    tweetLikeData,
                    "tweet liked successfully"
                )
            )

    }

})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideos = await Likes.aggregate(
        [
            {
                $group : {
                    _id : "$Video"
                }
            }
        ]
    )
    console.log("likedVideos :- " , likedVideos)

    if (!likedVideos) {
        throw new ApiError(400 , "videos not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            likedVideos,
            "liked video fetched successfully"
        )
    )

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}