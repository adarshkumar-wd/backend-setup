import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"  // COME DEFAULTLY WITH NODE JS TO MANAGE THE FIL SYSTEM

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // upload the file
        const res = await cloudinary.uploader.upload(localFilePath , {
            resource_type : "auto"
        });

        //file has been upload successfully
        // console.log('file upload successfully on cloudinary ', res.url);
        // console.log(res);
        fs.unlinkSync(localFilePath)

        return res;
        
    } catch (error) {
        fs.unlinkSync(localFilePath) // REMOVE THE LOCALLY SAVED TEMPORARY FILE AS THE UPLOAD OPERATION GET FAILED
        return null;
    }
};

export {uploadOnCloudinary}