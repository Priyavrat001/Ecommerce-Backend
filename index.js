const express = require('express');
const app = express();
const errorMiddleWare = require("./middleware/error");
var cors = require('cors')
const db = require('./db');
const cookieParser = require('cookie-parser');
const port = 5000;

db()
app.use(cors())
app.use(express.json())
app.use(cookieParser())

// import all routes here
const user = require("./routes/userRoute")
const product = require("./routes/productRoute");
const order = require("./routes/orderRoute");

app.use('/api/product', product);
app.use('/api/user', user);
app.use('/api/order', order);

// middleware for the error
app.use(errorMiddleWare)
app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}`)
  })

  // for my learning purpose how to handle unhandleRejection
// Unhandle Promise rejection
// process.on('unhandledRejection', err=>{
//   console.log(`Error:${err.mssage}`);
//   console.log("Shutting down the server due to unhandle Promise Rejection.");
//   server.close(()=>{
//     process.exit()
//   })
// })