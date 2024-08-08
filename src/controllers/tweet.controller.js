import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweets.models.js"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { tweetContent } = req.body

    if (!tweetContent) {
        throw new ApiError(400, "tweetContent is required")
    }

    const createTweet = await Tweet.create({
        owner: req.user?._id,
        content: tweetContent
    })

    if (!createTweet) {
        throw new ApiError(500, "something went wrong while creating the data")
    }

    const tweetData = await Tweet.findById({ _id: createTweet?._id })

    if (!tweetData) {
        throw new ApiError(500, "Data not fonud in database")
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
    const { userId } = req.params
    // TODO: get user tweets

    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id found")
    }

    const checkUserTweet = await Tweet.findOne({ owner: userId })

    console.log(checkUserTweet)

    if (!checkUserTweet) {
        return res
            .status(404)
            .json(
                new ApiResponse(
                    404,
                    checkUserTweet,
                    "user does not tweet anything"
                )
            )
    } else {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    checkUserTweet,
                    "user tweet fetched successfully"
                )
            )
    }

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {newTweetContent} = req.body
    const {tweetId} = req.params

    if (!newTweetContent) {
        throw new ApiError(404 , "tweet content is required")
    }

    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400 , "Invalid tweet id")
    }

    const tweetData = await Tweet.findByIdAndUpdate({ _id : tweetId } , 
        {
            content : newTweetContent
        },
        {
            new : true
        }
    )

    if (!tweetData) {
        throw new ApiError(404 , "tweet data not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweetData,
            "tweet updated successfully"
        )
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params

    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400 , "Invalid tweet id")
    }

    const deleteTweet = await Tweet.findOneAndDelete({ _id : tweetId })

    if (!deleteTweet) {
        throw new ApiError(500 , "something went wrong while ddeleting the tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "tweet deleted successfully"
        )
    )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}