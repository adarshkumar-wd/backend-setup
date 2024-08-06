import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)  // this is not a good practice so after completing project ooptimise this file name
      // console.log("file - " , file)
    }
  })

  export const upload = multer({ storage : storage }) // use can also write only storage here because of ES6 feature both parameter and input is eql