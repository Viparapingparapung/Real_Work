const mongoose = require("mongoose")
// Result movie
const Result_movie_DB = new mongoose.model ({
    Id:{
        type: String,
        required: true
    },
    NameMovie: {
        type: String,
        required: true
    },
    Overview: {
        type: String,
        required: true
    },
    Type: {
        type: String,
        required: true
    },
    Score: {
        type: Number ,
        required: true
    },
    Url: {
        type:  String,
        required: true
    },
    Writer: {
        type: String,
        required: true
    },
    Directior:{
        type: String,
        required: true
    },
})

const ResultOfMovie = mongoose.model("result", Result_movie_DB)
module.exports = ResultOfMovie