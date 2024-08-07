import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription

    if (!channelId) {
        throw new ApiError(400, "channel Id not found")
    };

    const checkSubscribedOrNot = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user?._id
    })
    console.log(checkSubscribedOrNot)

    if (checkSubscribedOrNot) {
        await Subscription.deleteOne({
            channel: channelId,
            subscriber: req.user._id
        });

        return res.status(200).json(new ApiResponse(200, null, "Unsubscribed successfully"));
    } else {
        const newSubscription = await Subscription.create({
            channel: channelId,
            subscriber: req.user._id
        })

        if (!newSubscription) {
            new ApiError(500, "something went wrong while save the subscription data")
        }

        const subscriptionData = await Subscription.findById(newSubscription._id)

        if (!subscriptionData) {
            throw new ApiError(401, "Data not found")
        }

        return res.status(200).json(new ApiResponse(200, subscriptionData, "Subscribed successfully"));
    }



})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId) {
        throw new ApiError(400, "Channel Id not found")
    }

    const subscribers = await Subscription.aggregate(
        [
            {
                $match: {
                    channel: new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $group: {
                    _id: "$subscriber"
                }
            }
        ]
    )

    if (!subscribers) {
        throw new ApiError(300 , "subscribers not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscribers,
            "subscribers fetched sucessfully"
        )
    )

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!subscriberId) {
        throw new ApiError(400, "Channel Id not found")
    }

    const subscribedChannel = await Subscription.aggregate(
        [
            {
                $match: {
                    subscriber: new mongoose.Types.ObjectId(subscriberId)
                }
            },
            {
                $group: {
                    _id: "$channel"
                }
            }
        ]
    )

    if (!subscribedChannel) {
        throw new ApiError(300 , "subscribed channel not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscribedChannel,
            "subscribed channel fetched sucessfully"
        )
    )

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}