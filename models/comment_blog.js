const mongoose = require("mongoose")
// Detail from Comment
const comment_blog = new mongoose.Schema ({
    id:{
        type:String,
        required:true
    },
    user_id: {
        type:String,
        required:true
    },
    date:{
        type:Date,
        required: true
    },
    content: {
        type:String,
        required: true
    }
})

module.exports = mongoose.model('comment-blog',comment_blog);