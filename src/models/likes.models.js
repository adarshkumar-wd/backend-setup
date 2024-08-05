import mongoose , {Schema} from "mongoose";

const likesSchema = new Schema({

    comment : {
        type : mongoose.Types.ObjectId,
        ref :"Comment"
    },
    Video : {
        type : mongoose.Types.ObjectId,
        ref :"Video"
    },
    likesBy : {
        type : mongoose.Types.ObjectId,
        ref :"User"
    },
    tweet : {
        type : mongoose.Types.ObjectId,
        ref :"Tweet"
    },


} , {timestamps : true})

export const Likes = mongoose.model("Likes" , likesSchema)