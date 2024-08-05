import mongoose, {isValidObjectId} from "mongoose"
import { Playlist } from "../models/playlists.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.models.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {playlistName, description} = req.body
    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(400 , "user not found")
    }

    //TODO: create playlist

    // take data from the from the frontend
    // add validation
    // store all data  in an object
    // create new playlists field in database which is an array
    // push the created playlist into the playlists array
    // after than dave the user
    // send the object as a response to frontend

    if (!playlistName) {
        throw new ApiError(401 , "playlistName must be required")
    }

    if (!description) {
        throw new ApiError(401 , "Description must be required")
    }

    const createdPlaylistDetail = {
        playlistName,
        description,
        owner : user._id
    }

    const playlist = new Playlist(createdPlaylistDetail);
    await playlist.save();

    user.playlists = user.playlists || [];
    user.playlists.push(playlist);
    await user.save({ validateBeforeSave: false });
    console.log("user :  " , user.playlists[0])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "playlist created"
        )
    )



})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}