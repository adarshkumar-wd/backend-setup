import mongoose from "mongoose"
import {Comment} from "../models/comment.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {commentContent} = req.body
    const {videoId} = req.params

    if (!commentContent) {
        throw new ApiError(400 , "comment content must be required")
    }

    if (!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400 , "Invalid video Id")
    }

    const createComment = await Comment.create(
        {
            content : commentContent,
            video : videoId,
            owner : req.user?._d
        }
    )

    if (!createComment) {
        throw new ApiError(500 , "Something went Wrong while save the comment data in database")
    }

    const CommentData = await Comment.findById(createComment._id)

    if (!CommentData) {
        throw new ApiError(401 , "Comment data not found in database")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            CommentData,
            "Comment created successfully"
        )
    )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }