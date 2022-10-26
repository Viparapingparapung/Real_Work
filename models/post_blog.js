const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title:{
        type:String,
        required: "this field is required"
    },
    description:{
        type:String,
        required: "this field is required"
    },
    img:{
        type:String,
        required:"this field is required"
    },
    comment:[
        {
            type:mongoose.Schema.Types.ObjectId, ref:'Comment'
        }
    ]
})

postSchema.virtual('url').get(function(){
    return '/title/' + this._id
})

module.exports = mongoose.model('Post', postSchema)