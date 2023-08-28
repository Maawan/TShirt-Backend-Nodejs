const BigPromise = require("../middlewares/bigPromise");
const User = require("../models/user");
const { sendMail } = require("../utils/sendMail");
const cloudinary = require("cloudinary").v2
exports.signup = BigPromise( async function(req , res , next){

    if(!req.files){
        return res.status(200).json({
            message : "Profile Photo is required"
        })
    }

    const {name , email , password} = req.body;
    if(!email && !name && !password){
        return res.status(200).json({
            message : "Name, Email and Password are required"
        })
    }
    const user = await User.create({
        name , 
        password , 
        email
    })

    let result;
    console.log(req.files.photo);
    result = await cloudinary.uploader.upload(req.files.photo.tempFilePath);
    const token = user.getJwtToken();
    const options = {
        expires : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly : true
    }
    if(result != null){
        user.photo = result.secure_url;
        user.photo_id = result.public_id;
    }
    await user.save();
    res.status(200).cookie('token',token , options).json({
        message : "Your Account has bee Successfully Created !",
        token,
        result
    })
    

})

exports.signin = BigPromise(async function(req , res , next){
    const {email , password} = req.body;
    if(!email || !password){
        return res.status(200).json({
            message : "Email and Password are required"
        })
    }
    const user = await User.findOne({email}).select('+password');
    if(user == null){
        return res.status(200).json({
            message : "You are not Registered with us"
        })
    }
    const isVerified = await user.isValidatedPassword( password , user.password)
    console.log(isVerified + " ....");
    if(!isVerified){
        res.status(200).json({
            message : "Your Password is Incorrect"
        })
    }else{
        const token = user.getJwtToken();
        res.status(200).cookie('token' , token , {expires : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly : true}).json({
                message : "Congrats ! You are Logged in. Grab the token provided",
                user,
                token
            })
    }
})

exports.signout = BigPromise(function(req , res , next){
    res.status(200).cookie('token' , null , {
        expires : new Date(Date.now()),
        httpOnly : true
    }).json({
        message : "You are Logged out"
    })
})

exports.forgotPassword = BigPromise(async function(req , res , next) {
    const {email} = req.body;
    if(!email){
        return res.status(200).json({
            message : "Email is required"
        })
    }
    const user = await User.findOne({email})
    if(user == null){
        return res.status(200).json({
            message : "You are not registed with us"
        })
    }
    const forgotToken = user.getForgotPasswordToken();
    await user.save();
    console.log(forgotToken);
    try {
        await sendMail({
            email : "maawan18@gmail.com",
            subject : "Reset Password",
            message : `${req.protocol}://${req.hostname}:4000/api/v1/reset/password/${forgotToken}`
        })
        res.status(200).json({
            message : "Reset mail has been send"
        })
    } catch (error) {
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await user.save();
        res.status(200).json({
            message : "Something went wrong",
            error : error.message
        })
    }

})

exports.resetPassword = BigPromise(async function(req , res , next){
    const token = req.params.token;
    const password = req.body.password;
    if(!token){
        return res.status(200).json({
            message : "Token is required"
        })
    }
    const user = await User.findOne({
        forgotPasswordToken : token
    })
    if((user != null && user.forgotPasswordExpiry < Date.now()) || user == null){
        return res.status(200).json({
            message : "Token Invalid or expired"
        })
    }
    console.log(user.email + " " + user.forgotPasswordToken + " " + token);
    
    if(!password){
        return res.status(200).json({
            message: "Password is required"
        })
    }
    user.password = password;
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save();
    res.status(200).json({
        message : "Password Changed Successfully !"
    })

})

exports.getUserData = BigPromise(async function(req , res , next){
    console.log("Email " + req.email);
    const user = await User.findOne({email : req.email});
    res.status(200).json({
        user
    })
})

exports.updatePassword = BigPromise(async function(req , res , next){
    const user = await User.findOne({email : req.email}).select("+password");
    const {oldpassword , newpassword} = req.body;
    console.log(req.email + " email");
    if(oldpassword == null || newpassword == null){
        res.status(200).json({
            message : "Old and new Password are required"
        })
    }
    const isPasswordCorrect = await user.isValidatedPassword(oldpassword);
    if(!isPasswordCorrect){
        res.status(200).json({
            message : "Password incorrect"
        })
    }
    user.password = newpassword;
    await user.save();
    res.status(200).json({
        message : "Password Changed Successfully !"
    })

})

exports.update = BigPromise(async function(req , res , next){

    const user = await User.findOne({email : req.email});
    if(req.body.email != null){
        user.email = req.body.email;
    }
    if(req.body.name != null){
        user.name = req.body.name;
    }
    if(req.files != null){
        if(user.photo_id != null){
            await cloudinary.uploader.destroy(user.photo_id);
        }
        const result = cloudinary.uploader.upload(req.files.photo.tempFilePath );
        user.photo = result.secure_url;
        user.photo_id = result.photo_id;
    }
    await user.save();
    const token = user.getJwtToken();
    res.status(200).json({
        message : "Data updated",
        token
    })
})

exports.getAllUser = BigPromise(async function(req , res , next){
    const users = await User.find({role : "user"});
    res.status(200).json({
        users
    })
})