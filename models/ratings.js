const API_KEY = 'api_key=0b4a78f3f6df40ca3779248e701f90e5'

const mongoose = require("mongoose")

const rating_DB = new mongoose.Schema({

    MovieName: {
        type:String,
        required: true
    },
    rating: {
        type:String,
        required: true
    }
    
})

const ratings = mongoose.model("Rating" , rating_DB)
module.exports = ratings