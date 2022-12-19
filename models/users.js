const mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstname:{
    type: String,
    required : true,
  },
  lastname:{
    type: String,
    required : true,
  },
  phonenumber:{
    type: Number,
    required : true,
  },
  idmovie:{
    type:Array,
    required:true
  },
  date: {
    type: Date,
    default: Date.now
  },
  ratings: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rating"
  },
  results: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "result"
  },
  
  post_comments: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "comment-blog"
  }

});




const User = mongoose.model("User", userSchema);

module.exports = User;


