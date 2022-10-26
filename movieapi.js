//TMDB
const API_KEY = 'api_key=0b4a78f3f6df40ca3779248e701f90e5';
const BASE_URL = 'https://api.themoviedb.org/3/';
const API_URL = BASE_URL + '/discover/movie?sort_by=popularity.desc&'+ API_KEY;
const IMG_URL = 'https://image.tmdb.org/t/p/w500/';

getMovies(API_URL);

function getMovies(url) {
    fetch(url).then(res => res.json()).then(data => {
        console.log(data.results)
        showMovies(data.results);
    })
}