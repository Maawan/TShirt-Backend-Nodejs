const BigPromise = require("./bigPromise");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
exports.isLoggedIn = BigPromise( async function(req , res , next){
    const token = req.cookies.token || (req.header("Authorization") && req.header("Authorization").replace("Bearer " , ""));
    if(!token){
        res.status(200).json({
            message : "You are not Logged In"
        })
    }
    const decoded = jwt.verify(token , process.env.JWT_SECRET);
    req.email = decoded.email;
    console.log(decoded);
    next();
})

exports.customRole = (...role) => {
    return async (req , res , next) => {
        const user = await User.findOne({email : req.email}).select("+role");
        if(!role.includes(user.role)){
            return res.status(200).json({
                message : "You are not allowed to access this Resource"
            })
        }
        next();
    }
}