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
  profile_image: {
    type : String,
    require:true
  }
});




const User = mongoose.model("Brab", Schema);

module.exports = User;