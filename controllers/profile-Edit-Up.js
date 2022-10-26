const bcrypt =require('bcrypt')
const User = require("../models/users");

exports.changes_Password = (req,res) =>{

}


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