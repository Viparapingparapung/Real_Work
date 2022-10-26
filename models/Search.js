const mongoose = require("mongoose");

const search_Schema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    description : {
        type: String,
        required: true
    },

})