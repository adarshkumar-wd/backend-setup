import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
    try {
        const connectionObject = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        // console.log(`\n MongoDB connected  ! DB HOST : ${connectionObject}`);
        
    } catch (error) {
        console.log("MongoDB connection error",error);
        process.exit(1) // READ ABOUT PROCESS FROM DOCUMENTATION OF NODE JS
    }
}

export default connectDB