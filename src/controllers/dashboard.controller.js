import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.models.js"
import {Subscription} from "../models/subscription.models.js"
import {Likes} from "../models/likes.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const {channelId} = req.params

    if (!channelId || !isValidObjectId(channelId)) {
        throw new ApiError(401 , "Invalid user Id")
    }


    const channelVideos = await User.aggregate(
        [
            {
              $match: {
                _id : new mongoose.Types.ObjectId(channelId)
              }
            },
            {
              $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "video"
              }
            },
            {
              $project: {
                video : 1,
                _id : 0
              }
            },
            {
              $unwind: "$video"
            }
          ]
    )

    if (!channelVideos) {
        return res
        .status(200)
        .json(
            new ApiResponse(
                200 ,
                {},
                "User does't uploaded any videos"
            )
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            channelVideos,
            "User videos fetched"
        )
    )

})

export {
    getChannelStats, 
    getChannelVideos
    }