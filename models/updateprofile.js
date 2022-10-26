const mongoose = require("mongoose");
const User = require("./users");

var url = process.env.CON_DB;

exports.editUserDetails = (req, res) => {
    mongoose.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db(process.env.CON_DB_NAME);
        var myquery = { id: req.user.id };
        var newvalues = {
            $set: {
                email: req.body.editProfileEmail,
                username: req.body.editProfileUsername,
                },
            };
        dbo
        .collection(process.env.CON_DB_COLLECTION)
        .updateOne(myquery, newvalues, function (err, res) {
            if (err) throw err;
            console.log("Account 1 document updated");
            db.close();
        });
    });
    req.user.email = req.body.editProfileEmail;
    req.user.username = req.body.editProfileUsername;
    res.redirect("/profile");
};



/* Update Controller*/ 
exports.updateUserProfile = (req,res)  =>{
    User.findByIdAndUpdate(
        {_id: req.params.taskId },
        req.body,
        {new: true},
        (err, User) => {
            if (err) res.send(err);
            res.json(User)
        }
    )
};

/* Delete Controllers */
exports.deleteUserProfile = (req, res) => {
    User.deleteOne({ _id: req.params.taskId}, err => {
        if (err) res.send(err);
        res.json({
            message: "task successfully deleted" ,
            _id: req.params.taskId
        });
    });
};
