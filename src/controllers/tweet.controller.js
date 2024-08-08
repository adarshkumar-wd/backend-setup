import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweets.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {tweetContent} = req.body

    if (!tweetContent) {
        throw new ApiError(400 , "tweetContent is required")
    }

    const createTweet = await Tweet.create({
        owner : req.user?._id,
        content : tweetContent
    })

    if (!createTweet) {
        throw new ApiError(500 , "something went wrong while creating the data")
    }

    const tweetData = await Tweet.findById({_id : createTweet?._id})

    if (!tweetData) {
        throw new ApiError(500 , "Data not fonud in database")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweetData,
            "tweet create successfully"
        )
    )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}