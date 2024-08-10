import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.models.js"
import {Subscription} from "../models/subscription.models.js"
import {Likes} from "../models/likes.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views,_, total videos, total likes etc.
    const {channelId} = req.params

    if (!channelId || !isValidObjectId(channelId)) {
        throw new ApiError(401 , "Invalid channelId")
    }
    // 66b131d25c9702d0d648a596
    const countSubscriber = await User.aggregate(
            [
                {
                  $match: {
                    _id : new mongoose.Types.ObjectId(channelId)
                  }
                },
                {
                  $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                  }
                },
                {
                  $project: {
                    subscribers : 1,
                    _id : 0
                  }
                },
                {
                  $unwind: "$subscribers"
                },
                {
                  $count: 'subscribers'
                }
            ] 
    )

    if (!countSubscriber) {
        throw new ApiError(500 , "Something went wrong while count the subscribers")
    }

    const totalViews = await Video.aggregate(
        [
            {
              $match: {
                owner : new mongoose.Types.ObjectId(channelId)
              }
            },
            {
              $project: {
                views : 1,
                _id : 0,
              }
            },
            
          ]
    )
    let totalNumberOfViews = 0
    totalViews.forEach((viewObj) => totalNumberOfViews = totalNumberOfViews + viewObj.views )

    const countVideo = await Video.aggregate(
        [
            {
              $match: {
                owner : new mongoose.Types.ObjectId(channelId)
              }
            },
            {
              $count: 'count'
            }
            
          ]
    )

    let totalVideos = countVideo[0].count
    let totalSubscribers = countSubscriber[0].subscribers


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                totalNumberOfSubscribers : totalSubscribers,
                totalNumberOfViews,
                totalNumberOfVideos : totalVideos
            },
            "data fetched"
        )
    )

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