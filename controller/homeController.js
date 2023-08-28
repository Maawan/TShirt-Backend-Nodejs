const BigPromise = require("../middlewares/bigPromise");

exports.home = BigPromise(async(req , res) => {
    res.status(200).json({
        message : "Success",
        Greeting : "Hello From Api"
    })
})