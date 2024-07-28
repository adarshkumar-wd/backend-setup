
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path : './env'
})


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000 , () => {
        console.log(`Server is running on ${process.env.PORT}`);
    })
})
.catch(error => console.log('Database connection failed' , error))







// ;( async() => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         app.on("error" , (error) => {
//             console.log("application not able to talk with database")
//             throw error
//         })

//         app.listen(process.env.PORT , () => {
//             console.log(`App is listning on port ${process.env.PORT}`)
//         })

//     } catch (error) {
//         console.log(error)
//     }
// })()