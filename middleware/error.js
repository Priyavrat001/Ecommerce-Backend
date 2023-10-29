const ErrorHandler = require('../errorHandler/errorHandler')


module.exports = (err, req, res, next)=>{
    statusCode = err.statusCode || 500;
    message = err.message || "Internal Server Error.";
    
    // wrong mongodb id error
    if(err.name === "castError"){
        const message = `Source not found Error:${err.path}`;
        err = new ErrorHandler(message, 400)
    }
    if (res.headersSent) {
        const message = `Source not found Error:${err.path}`;
        err = new ErrorHandler(message, 400)
      }
      // mongoose dublicate keyerror
    if(err.code === 11000){
        const message = `Duplicate ${object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message, 400)
    }
      // Wrong jwt error
    if(err.code === "jsonWebTokenError"){
        const message = `Json web Token is invalid please try again.`;
        err = new ErrorHandler(message, 400)
    }
      // Jwt expire error
    if(err.code === "TokenExpireError"){
        const message = `Json web Token is Expire please try again.`;
        err = new ErrorHandler(message, 400)
    }
    res.status(statusCode).json({success:false, message});
}