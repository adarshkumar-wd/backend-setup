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
        subscriber: req.user?.id
    })

    if (checkSubscribedOrNot) {
        await Subscription.deleteOne({
            channel: channelId,
            subscriber: req.user._id
        });

        return res.status(200).json(new ApiResponse(200, null, "Unsubscribed successfully"));
    } else {
        const newSubscription = new Subscription({
            channel: channelId,
            subscriber: req.user._id
        });

        await newSubscription.save();

        return res.status(200).json(new ApiResponse(200, newSubscription, "Subscribed successfully"));
    }



})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}