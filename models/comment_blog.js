const mongoose = require("mongoose")

const comment_blog = new mongoose.Schema ({
    name:{
        type:String,
        required: "this field is required"
    },
    email:{
        type:String,
        required: "this field is required"
    },
    comment:{
        type:String,
        required: "this field is required"
    },
    blog:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    },
})

module.exports = mongoose.model('comment-blog',comment_blog);