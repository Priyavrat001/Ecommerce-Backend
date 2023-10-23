const express = require('express')
const app = express()
const errorMiddleWare = require("./middleware/error")
const db = require('./db')
// const cookieParser = require('cookie-parser');
const port = 4000

db()
app.use(express.json())
// app.use(cookieParser())
// import all routes here
const product = require("./routes/productRoute");
app.use('/api/product', product);
// app.use('/api/user', user);

// middleware for the error
app.use(errorMiddleWare)
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })