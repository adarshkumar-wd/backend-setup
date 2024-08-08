import mongoose, { isValidObjectId } from "mongoose"
import { Likes } from "../models/likes.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video

    if (!videoId || !isValidObjectId(videoId)) {
        return res.status(400).json(
            new ApiError(400, "Invalid or missing video ID")
        );
    }

    const likedVideo = await Likes.findOne({ Video: videoId, likesBy: req.user?._id })

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
            Video: videoId,
            likesBy: req.user?._id
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

    if (!commentId || !isValidObjectId(videoId)) {
        return res.status(400).json(
            new ApiError(400, "Invalid or missing video ID")
        );
    }

    const likedComment = await Likes.findOne({
        comment: commentId , 
        likesBy: req.user?._id 
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

    if (!tweetId || !isValidObjectId(videoId)) {
        return res.status(400).json(
            new ApiError(400, "Invalid or missing video ID")
        );
    }

    const likedTweet = await Likes.findOne({
        tweet: tweetId,
        likesBy: req.user?._id 
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
    const likedVideos = await Likes.aggregate([
        {
            $match: {
                likesBy: req.user?._id
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "Video",
                foreignField: "_id",
                as: "result"
            }
        },
        {
            $unwind: "$result"
        },
        {
            $project: {
                result: 1
            }
        }
    ]);

    if (likedVideos.length === 0) {
        throw new ApiError(404, "No liked videos found");
    }

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}