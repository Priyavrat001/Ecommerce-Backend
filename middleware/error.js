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
    res.status(statusCode).json({success:false, message});
}