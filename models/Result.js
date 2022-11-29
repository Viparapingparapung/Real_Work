const mongoose = require("mongoose")
// Result movie
const Result_movie_DB = new mongoose.Schema ({
    idmovie:{
        type:Array,
        required:true
    }
})

const ResultOfMovie = mongoose.model("result", Result_movie_DB)
module.exports = ResultOfMovie