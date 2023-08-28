require("dotenv").config();
const express = require("express");
const morgan = require('morgan');
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const home = require("./routes/home");
const user = require("./routes/user");
const cloudinary = require("cloudinary").v2
const {connectToDB} = require("./config/db")

const app = express();
connectToDB();
app.use(express.json());
app.use(express.urlencoded({urlencoded : true}));

// Cookies and Files Middleware

app.use(cookieParser());
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : "/tmp/"
}));

// Cloudinary Config
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_API_SECRET 
});


// Morgan Middleware
app.use(morgan("tiny"));

app.use('/api/v1' , home);
app.use('/api/v1' , user);




module.exports = app;