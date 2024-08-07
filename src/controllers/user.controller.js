import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })  // save is inbuilt method in mongodb to save the data

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    // Take detail from the frontend
    // Validation - not empty
    // check if user already exist or not using email or username
    // required file available or not - check for avatar
    // if avialable upload to cloudinary , avatar
    // create an object - create entry in database
    // remove password and refresh token from response
    // check for user creation
    // return response

    // VALIDATION...
    const { fullName, email, userName, password } = req.body
    // console.log("req.body :  ",req.body);

    if (
        [fullName, email, userName, password].some((field) => field?.trim() === "")  //if any field satisfy the condition then it returns true
    ) {
        throw new ApiError(400, "All field are required");
    }

    // FINDING DUPLICATES ACCOUNT...
    // user able to access our database because it comes from mongoose
    // user have some built methods findOne is one of them it find one value thats equal to our given key
    // $or used when you wnats to give more than one key

    // const existedUser = User.findOne({
    //     $or: [{ userName } , { email }]
    // })

    // if (existedUser) {
    //     throw new ApiError( 409 , "userName or email already existed" );
    // }

    const existedUserName = await User.findOne({ userName });
    // console.log("existed userName : ",existedUserName)

    if (existedUserName) {
        throw new ApiError(409, "userName already existed");
    }

    const existedUserEmail = await User.findOne({ email });

    if (existedUserEmail) {
        throw new ApiError(409, "email already existed");
    }

    //  EXTRACT THE PATH OF OUR FILES ..... 
    // files property comes from middleware which you add before calling registerUser controller
    // whenever a file comes , it contain so many properties like type- png,jpg so at 0th position it contains the path that we try to extract

    const avatarLocalPath = req.files?.avatar[0]?.path
    console.log("avatar local path : ", avatarLocalPath);
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    // console.log("req.files : ", req.files)

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar must be required");
    }

    // UPLOAD THE FILES ON CLOUDINARY....

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(500, "something went wrong while uploading the avtar");
    }

    // save user data in database

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    })

    // check that data save or not in the database

    const userData = await User.findById(user._id).select("-password -refreshToken")
    // whenever any entry save in mongo db it add one property that is _id
    // .select use to remove the given keys from the  pointed object or data

    if (!userData) {
        throw new ApiError(500, "server error data not registered on database")
    }

    return res.status(201).json(
        new ApiResponse(200, userData, "user Registered Successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // userName or email check
    // find the user
    // password check
    // generate access and refresh token
    // send cookie
    // send response 

    const { email, userName, password } = req.body

    // if (!email) {
    //     throw new ApiError(400, "email must be required")
    // // }
    // console.log("email " , email)
    // console.log("userName " , userName)

    if (!email && !userName) {
        throw new ApiError(401 , "email and username must be required")
    }

    if (!password) {
        throw new ApiError(400, "password must be required")
    }

    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })

    // console.log("user : " , user)

    if (!user) {
        throw new ApiError(404, "user does not exist")
    }

    // the methods you build to check the password in user model or generate token methods is available in user which is saved in mongodb 

    const isPasswordCorrect = await user.isPasswordCorrect(password)
    console.log( "isPasswordCorrect : " ,isPasswordCorrect)
    if (!isPasswordCorrect) {
        throw new ApiError(401, "password incorrect")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    // console.log(accessToken)
    // console.log(refreshToken)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    console.log("loggedUser : " ,  loggedInUser)

    // to send cookies 

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    refreshToken,
                    accessToken
                },
                "User logged in successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req , res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken : undefined
            },
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(
        new ApiResponse(
            200,
            {},
            "user logged out successfully"
        )
    )
})

const refreshAccessToken = asyncHandler(async (req , res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401 , "unauthorised request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401 , "Invalid Refresh Token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401 , "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {accessToken , refreshToken } = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" , refreshToken , options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken
                },
                "Access token refreshed successfully"
                
            )
        )
    } catch (error) {
        throw new ApiError(401 , error?.message || "Invalid Refresh Token")
    }

})

const changeCurrentPassword = asyncHandler(async (req , res) => {
    const {oldPassword , newPassword} = req.body

    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(400 , "User not exised")
    }

    const isPasswordCorrect =  await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400 , "Enter correct password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "password changed sucessfully"
        )
    )

})

const getCurrentUser = asyncHandler(async (req , res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            req.user,
            "Current user successfully fetched"
        )
    )
})

const updateAccountDetail = asyncHandler(async (req ,res) => {
    const {fullName , email} = req.body

    if (!(fullName || email)) {
        throw new ApiError(401 , "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email : email
            }
        },
        {
            new : true
        }
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "Account details updated successfully"
        )
    )

})

const updateUserAvatar = asyncHandler(async (req , res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400  , "Avatar is not available")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar) {
        throw new ApiError(500  , "error while uploading the avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set :{
                avatar : avatar.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "avatar upload successfully"
        )
    )

})

const updateUserCoverImage = asyncHandler(async (req , res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400  , "coverImage is not available")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage) {
        throw new ApiError(500  , "error while uploading the coverImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set :{
                coverImage : coverImage.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "coverImage upload successfully"
        )
    )

})

const getUserChannelProfile = asyncHandler(async (req , res) => {
    const {userName} = req.params

    if (!userName?.trim()) {
        throw new ApiError(400 , "userName is not defined")
    }

    const channel = await User.aggregate([
        {
            $match : {
                userName : userName?.toLowerCase()
            }
        },

        {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "channel",
                as : "subscribers"
            }
        },

        {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "subscriber",
                as : "subscribedTo"
            }
        },

        {
            $addFields : {
                subscribersCount : {
                    $size : "$subscribers"
                },

                channelsSubscribedToCount : {
                    $size : "$subscribedTo"
                },

                isSubscribed : {
                    $cond : {
                        if: {$in : [req.user?._id , "$subscribers.subscriber"]},
                        then : true,
                        else : false
                    }
                }
            }
        },

        {
            $project : {
                fullName : 1,
                userName : 1,
                subscribersCount : 1,
                channelsSubscribedToCount : 1,
                isSubscribed : 1,
                avatar : 1,
                coverImage : 1,
                email : 1
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404 , "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            channel[0],
            "user channel fetched sucessfully"
        )
    )

})

const getWatchHistory = asyncHandler(async (req , res) => {
    const user = await User.aggregate([
        {
            $match : {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },

        {
            $lookup : {
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as :"watchHistory",
                pipeline : [
                    {
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "owner",
                            pipeline : [
                                {
                                    $project : {
                                        fullName : 1,
                                        userName : 1,
                                        avatar : 1
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ])


    if (!getWatchHistory) {
        throw new ApiError(500 , "watch history not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "watch history fetch successfully"
        )
    )

})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetail,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
} 