const axios = require("axios");
const { response } = require("express");

exports.video_movie = (req,res) => {
    console.log(`https://api.themoviedb.org/3/movie/${req.params.id}/videos?api_key=0b4a78f3f6df40ca3779248e701f90e5&language=en-US`)
    axios.get(`https://api.themoviedb.org/3/movie/${req.params.id}/videos?api_key=0b4a78f3f6df40ca3779248e701f90e5&language=en-US`).then(response => {
        res.render("detail.ejs", {movie_video: response.data})
    })
}

exports.api_all = (req,res) => {
    let detail = `https://api.themoviedb.org/3/movie/${req.params.id}?api_key=0b4a78f3f6df40ca3779248e701f90e5&language=en-US`
    let video = `https://api.themoviedb.org/3/movie/${req.params.id}/videos?api_key=0b4a78f3f6df40ca3779248e701f90e5&language=en-US`

    const requestdetail = axios.get(detail);
    const requestvideo = axios.get(video);

    axios.all([requestdetail,requestvideo]).then((responsedetail,responsevideo) => {
        console.log(responsedetail.data, responsevideo.data)
        res.render("detail.ejs", {movie:responsedetail.data, video:responsevideo.data})
    })
}

