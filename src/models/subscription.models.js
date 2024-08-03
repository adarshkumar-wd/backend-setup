import mongoose , {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber : {
        type : Schema.Types.ObjectId,  // who subscribe
        ref : "User",
    },
    channel : {
        type : Schema.Types.ObjectId,   // whose channel subscribe
        ref : "User",
    }

} , {timestamps : true})

const Subscription = mongoose.model("Subscription" , subscriptionSchema)