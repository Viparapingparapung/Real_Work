const mongoose = require("mongoose");

var Schema = new mongoose.Schema({
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
  gender : {type:String},
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




const User = mongoose.model("Brab", Schema);

module.exports = User;


