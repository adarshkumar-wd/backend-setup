const asyncHandler = (requestHandler) => {
    return (req , res , next) => {
        Promise.resolve(requestHandler(req , res , next)).catch((error) => next(error))
    }
}

export {asyncHandler}




// const asyncHandler = (function) => {
//     async(res , req , next) => { }
// }

// const asyncHandler = (func) => async(res , req , next) => {
//     try {
//         await func(req , res, next);
//     } catch (error) {
//         next(error)
//     }
// }