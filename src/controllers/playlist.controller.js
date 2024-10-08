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
    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400 , "Invalid Object Id")
    }

    const user = await User.findById(userId).select("-password -refreshToken");
    console.log("user : " ,user)

    if (!user) {
        throw new ApiError(400 , "user not found")
    }

    const playlists = await Playlist.find({owner : userId})
    console.log(playlists);
    

    if (!playlists) {
        throw new ApiError(400 , "playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlists,
            "playlists fetched sucessfully"
        )
    )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400 , "Invalid playlist Id")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400 , "playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "playlist fetched sucessfully"
        )
    )

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400 , "Invalid playlist Id")
    }

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400 , "Invalide video id")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(401 , "playlist not found in database")
    }

    // const isVideoAvailble = false;

    for(let i = 0 ; i < playlist.videos.length ; i++){
        if (playlist.videos[i].equals(videoId)) {
            throw new ApiError(401 , "video is already available in playlist")
        }
    }

    await playlist.videos.push(videoId)
    await playlist.save({validateBeforeSave : true})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "video added sucessfully"
        )
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // TODO: remove video from playlist
    const {playlistId, videoId} = req.params

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400 , "playlist id not found")
    }

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400 , "video id not found")
    }

    const playlist = await Playlist.findById(playlistId)
    console.log(playlist.videos[0])

    if (!playlist) {
        throw new ApiError(401 , "playlist not found in database")
    }

    const updatedPlaylist = await playlist.videos.filter((item) => {
        return !item.equals(videoId);
    })

    playlist.videos = updatedPlaylist
    await playlist.save({validateBeforeSave : true})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "video remove sucessfully "
        )
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400 , "Invalid playlist Id")
    }

    const deletePlaylist = await Playlist.deleteOne({_id : playlistId})

    if (deletePlaylist.deletedCount === 0) {
        throw new ApiError(401 , "Playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "playlist deleted"
        )
    )

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {playlistName, description} = req.body
    //TODO: update playlist

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400 , "Playlist id not found")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId , 
        {
            $set : {
                playlistName,
                description
            }
        },
        {
            new : true
        }
    )

    if (!playlist) {
        throw new ApiError(401 , "playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            playlist,
            "playlist update successfully"
        )
    )

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