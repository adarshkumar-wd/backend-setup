import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser =  asyncHandler(async(req , res) => {

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
    const { fullName , email , userName , password} = req.body
    // console.log("req.body :  ",req.body);

    if(
        [fullName , email , userName , password].some((field) => field?.trim() === "")  //if any field satisfy the condition then it returns true
    ) {
        throw new ApiError(400 , "All field are required");
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

    const existedUserName = await User.findOne({userName});
    // console.log("existed userName : ",existedUserName)

    if (existedUserName) {
        throw new ApiError( 409 , "userName already existed" );
    }

    const existedUserEmail = await User.findOne({email});

    if (existedUserEmail) {
        throw new ApiError( 409 , "email already existed" );
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
        throw new ApiError(400 , "avatar must be required");
    }

    // UPLOAD THE FILES ON CLOUDINARY....

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(500 , "something went wrong while uploading the avtar");
    }

    // save user data in database

     const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        userName : userName.toLowerCase()
    })

    // check that data save or not in the database

    const userData = await User.findById(user._id).select("-password -refreshToken")    
    // whenever any entry save in mongo db it add one property that is _id
    // .select use to remove the given keys from the  pointed object or data

    if (!userData) {
        throw new ApiError(500 , "server error data not registered on database")
    }

    return res.status(201).json(
        new ApiResponse(200 , userData , "user Registered Successfully")
    )

})

export {registerUser}