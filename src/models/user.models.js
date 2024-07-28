import mongoose ,{Schema} from "mongoose";

const userSchema = new Schema({
    userName : {
        type : String,
        required : true,
        unique : true , 
        lowercase : true ,
        trim : true , 
        index : true
    },

    email: {
        type : String,
        required : true,
        unique : true , 
        lowercase : true ,
        trim : true
    },

    fullName : {
        type : String,
        required : true,
        trim : true , 
        index : true
    },

    avatar : {
        type :String,// cloudinary
        required : true ,  
    },

    coverImage : {
        type :String,// cloudinary
    },

    watchHistory : [
        {
            type : mongoose.Schema.ObjectId,
            ref : "Video",
        },
    ],

    password : {
        type : String,
        required : [true , "password is required"]
    },

    refreshToken : {
        type : String
    }

} , {timestamps : true});

export const User = mongoose.model("User" , userSchema);