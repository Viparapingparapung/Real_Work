if (process.env.NODE_ENV !== "production") {
  require('dotenv').config()
}

const express = require("express");
const app = express();
const bcrypt = require("bcrypt")
const passport = require("passport")
const flash = require('express-flash')
const session = require('express-session')
const mongoose = require("mongoose")
const fs = require('fs')
const bodyparser = require("body-parser");
const axios = require("axios")
const path = require('path')
const initializePassport = require('./passport-config')
initializePassport(
  passport
)

const multer = require("multer")
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now)
  }
});
const upload = multer({ storage: storage });

const connectDB = async () => {
  try {
    const con = await mongoose.connect(
      "mongodb+srv://Summaries_Vipara123:Pxgamer22@cluster0.i4eya.mongodb.net/test"
    );
    console.log(`MongoDB connected: ${con.connection.host}`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
connectDB();

const User = require("./models/users");
const Comment = require("./models/comment_blog")
const Result = require("./models/Result")
const Check = require("./models/onboardingcheck")
const Post = require("./models/post_blog");
const post_blog = require('./models/post_blog');
const JWT_SECRET = 'some super secret...'
const Api = require("./controllers/api");
const { response } = require('express');
// middleware
app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(bodyparser.json({ type: "application/*+json" }));
app.use("/services", express.static("services"))
app.use(express.static(__dirname + '/public'));
app.use("/public", express.static("public"))
app.use('/dist', express.static('dist'))
app.use('/picture', express.static('picture'))
app.use('/Movie', express.static('Movie'))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
//

//Router
app.get('/', (req, res) => {
  res.render('register.ejs')
})

/*LOGIN FORM*/
app.get('/login', (req, res) => {
  res.render('login.ejs')
})

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user) => {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }

    req.logIn(user, (err) => {
      if (err) { return next(err); }
      return res.redirect("/home");
    })
  })(req, res, next)
})

/*REGISTER FORM*/ 
app.get('/register', (req, res) => {
  res.render('register.ejs')

})
app.post('/register', async (req, res) => {
  try {
    console.log(req.body)
    // setup our admin user
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const data = new User({
      id: Date.now().toString(),
      username: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      gender: req.body.gender
    })
    data.save();
    res.redirect('/login')
  } catch (err) {
    res.redirect('/register')
  }
  //
});
/* LOGOUT FORM*/
app.get("/logout", (req, res) => {
  req.logout();
  req.redirect("/main1");
})


app.get('/profileuser', (req, res) => {
  res.render('userprofile.ejs')
})

app.post(
  "/profileuser",
  async (req, res) => {
    if (await bcrypt.compare(req.body.editProfilePassword, req.user.password)) {
      try {
        console.log("connect!!!!");
        editProfileProcess.editUserDetails(req, res);
      } catch (e) {
        console.log(e);
      }
    } else {
      res.redirect("login.ejs");
    }
  }
)

//genre
app.get("/genre/:name", (req,res) => {

  const list = ["Action","Adventure","Animation","Comedy","Crime","Documentary","Drama","Family","Fantasy","History","Horror","Music","Mystery","Romance","Science Fiction","TV Movie","Thriller","War","Western"]

  let url_top_hit = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=0b4a78f3f6df40ca3779248e701f90e5"
  let url_for_you = `http://165.22.3.172:8000/get-form-genres?gen=${req.params.name}`
  let url_movie_slide = `https://api.themoviedb.org/3/movie/62177/recommendations?api_key=0b4a78f3f6df40ca3779248e701f90e5&language=en-US`
  
  const reques_top_hit = axios.get(url_top_hit);
  const reques_for_you = axios.get(url_for_you);
  const reques_movie_slide = axios.get(url_movie_slide);
  axios.all([reques_top_hit, reques_for_you, reques_movie_slide]).then((responses) => {
    responses_top_hit = responses[0]
    responses_for_you = responses[1]
    responses_movie_slide = responses[2]
    //console.log(responses_genre.data.genres)
    res.render("main.ejs", { email: "1", password: "1", movie_top: responses_top_hit.data.results, movie_rec: responses_for_you.data.results, movie_show: responses_movie_slide.data.results,})

  }).catch(err => console.log(err))
})
//movie detail page
app.get("/movie/:id", (req,res) => {
  const requestdetail = axios.get(`https://api.themoviedb.org/3/movie/${req.params.id}?api_key=0b4a78f3f6df40ca3779248e701f90e5&language=en-US`)
  const requestvideo = axios.get(`https://api.themoviedb.org/3/movie/${req.params.id}/videos?api_key=0b4a78f3f6df40ca3779248e701f90e5&language=en-US`)
  const requestrecomment = axios.get(`http://165.22.3.172:8000/id?m_id=${req.params.id}&random=true`);

  axios.all([requestdetail,requestvideo,requestrecomment]).then(axios.spread((responsedetail,responsevideo,responserecomment) => {
    console.log(responserecomment.data)
    res.render("detail.ejs", {movie: responsedetail.data, video: responsevideo.data.results, recomment: responserecomment.data.results})
  }))
})




//Test comment
app.get("/posts/:id", function (req, res) {
  post_blog.findOne({ "_id": (req.params.id) }, function (err, post) {
    res.render("detail.ejs", { post: post })
  })
})

app.post("/do-comment", function (req, res) {
  post_blog.updateOne({ "_id": (req.body.post_id) }, {
    $push: {
      "comment": { name: req.body.name, email: req.body.email, comment: req.body.comment }
    }
  }, function (err, post) {
    res.send("comment success")
  });
});
//
app.get("/data", async (req,res) => {
  const data = await Result.findOne({_id:'6384a235d458e76a49cbb0bf'});
  console.log(data.idmovie.join(','))
  
})

//home page
app.get("/home", async (req, res) => {
  const datas = await Result.findOne({_id:'6384a235d458e76a49cbb0bf'});


  let url_top_hit = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=0b4a78f3f6df40ca3779248e701f90e5"
  let url_for_you = `http://165.22.3.172:8000/id?m_id=${datas.idmovie.join(',')}&random=true`
  let url_movie_slide = `https://api.themoviedb.org/3/movie/62177/recommendations?api_key=0b4a78f3f6df40ca3779248e701f90e5&language=en-US`

  const reques_top_hit = axios.get(url_top_hit);
  const reques_for_you = axios.get(url_for_you);
  const reques_movie_slide = axios.get(url_movie_slide);
  const list = ["Action","Adventure","Animation","Comedy","Crime","Documentary","Drama","Family","Fantasy","History","Horror","Music","Mystery","Romance","Science Fiction","TV Movie","Thriller","War","Western"]
  // results
  axios.all([reques_top_hit, reques_for_you, reques_movie_slide]).then((responses) => {
    responses_top_hit = responses[0]
    responses_for_you = responses[1]
    responses_movie_slide = responses[2]
    console.log(responses_movie_slide.data.results)
    res.render("main1.ejs", { email: "1", password: "1", movie_top: responses_top_hit.data.results, movie_rec: responses_for_you.data.results, movie_show: responses_movie_slide.data.results, list_genre: list})

  }).catch(err => console.log(err))

});
//choosing movie
app.get("/onboarding" , (req,res) => {
  axios.get("https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=0b4a78f3f6df40ca3779248e701f90e5").then(response => {
    console.log(response.data.results)
    res.render("choosemovie.ejs", {movie : response.data.results})
  }).catch(err => console.log(err))
})

app.post("/onboarding/get_data", (req,res) => {

  console.log(req.body);
  const data = new Result({
    idmovie: req.body
  });
  data.save();
});

//profile page
app.get("/user", async (req, res) => {
  res.render("Profileform.ejs")
})

app.get("/check", async (req, res) => {
  res.render("check.ejs", { email: req.body.email })
});



app.listen(3000, function () {
  console.log(
    "Express server listening on port %d  http://localhost:3000/",
    this.address().port
  );
});

