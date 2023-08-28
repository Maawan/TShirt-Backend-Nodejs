const mongoose = require("mongoose");
exports.connectToDB = function(){
    mongoose.connect(process.env.DB_URL , {
        useUnifiedTopology : true,
        useNewUrlParser : true
    }).then(console.log("DB Connected Successfully"))
    .catch((err) => console.log("Error in Connecting DB " + err))
}