if (process.env.NODE_ENV !== "production") {
  require('dotenv').config()
}

const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts")
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
initializePassport(passport)
const {isLoggedIn,isLoggedOut} = require('./passport-auth');
const db = require('./config/keys').mongoURI

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
    const con = await mongoose.connect(db,{useNewUrlParser: true});
    console.log(`MongoDB connected: ${con.connection.host}`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
connectDB();

//database
const User = require("./models/users");
const Comment = require("./models/comment_blog")
const Result = require("./models/Result")
const post_blog = require('./models/post_blog');

// middleware
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(bodyparser.json({ type: "application/*+json" }));
app.use("/services", express.static("services"));
app.use(express.static(__dirname + '/public'));
app.use("/public", express.static("public"));
app.use('/dist', express.static('dist'));
app.use('/picture', express.static('picture'));
app.use('/Movie', express.static('Movie'));
app.use(flash()); //conectflash
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}));
app.use((req,res,next) => { //Global variable
  res.locals.success_message = req.flash('success_message');
  res.locals.error_message = req.flash('error_message');
  res.locals.error = req.flash('error');
  next();
});
app.use(passport.initialize());
app.use(passport.session());

//

//register
app.get('/register', isLoggedOut , async (req,res) => {
    res.render("register.ejs")
});

app.post("/register", async(req,res) => {
  const { username, email, password, password2, firstname, lastname, phonenumber } = req.body;
  let errors = [];

  if (!username || !email || !password || !password2 || !firstname || !lastname || !phonenumber) {
    errors.push({ message: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ message: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ message: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      username,
      email,
      password,
      password2,
      firstname,
      lastname,
      phonenumber
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ message: 'Email already exists' });
        res.render('register', {
          errors,
          username,
          email,
          password,
          password2,
          firstname,
          lastname,
          phonenumber
        });
      } else {
        const newUser = new User({
          username,
          email,
          password,
          firstname,
          lastname,
          phonenumber
        });
        newUser.save()
        console.log(newUser);

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_message',
                  'You are now registered and can log in'
                );
                res.redirect('/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
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


//login
app.get('/login', isLoggedOut , async (req,res) => {
  res.render("login.ejs")
});

app.post('/login', (req,res,next) => {
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
  })(req,res,next);
});

//logout
app.get('/logout' , (req,res) =>{
  req.logOut(req.user, err => {
    if(err) {return next(err);}
    req.flash('success_message', 'You are logout now');
    res.redirect('/login')
  });
  
});

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
  const requestdirector = axios.get(`https://api.themoviedb.org/3/movie/${req.params.id}/credits?api_key=0b4a78f3f6df40ca3779248e701f90e5`)

  axios.all([requestdetail,requestvideo,requestdirector,requestrecomment]).then(axios.spread((responsedetail,responsevideo,responsedirector,responserecomment) => {
    const DWA = ['Directing', 'Writing', 'Acting']
    let A
    let data = []
    for (let i = 0; i < 3; i++) {
      A = responsedirector.data.crew.filter((val) => {
        return val.known_for_department === DWA[i];
      })
      if (A.length > 0) {
        data.push(A[0])
      }
    }
    res.render("detail.ejs", { movie: responsedetail.data, video: responsevideo.data.results,recomment: responserecomment.data.results, director: data });
  }));
});




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
app.get("/home", isLoggedIn , async (req, res) => {
  const datas = await Result.findOne({_id:'6384a235d458e76a49cbb0bf'});


  let url_top_hit = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=0b4a78f3f6df40ca3779248e701f90e5"
  let url_for_you = `http://165.22.3.172:8000/id?m_id=${datas.idmovie.join(',')}&random=true`
  let url_movie_slide = `https://api.themoviedb.org/3/movie/62177/recommendations?api_key=0b4a78f3f6df40ca3779248e701f90e5&language=en-US`

  const reques_top_hit = axios.get(url_top_hit);
  const reques_for_you = axios.get(url_for_you);
  const reques_movie_slide = axios.get(url_movie_slide);
  const list = ["Action","Adventure","Animation","Comedy","Crime","Documentary","Drama","Family","Fantasy","History","Horror","Music","Mystery","Romance","Science Fiction","TV Movie","Thriller","War","Western"]
  // results

  const g_background = ['https://images2.minutemediacdn.com/image/upload/c_fill,w_720,ar_16:9,f_auto,q_auto,g_auto/shape/cover/sport/646987-jasin-boland-c-2012-warner-bros-entertainment-inc-54e2f8c553776eafbfd8ede11121a700.jpg',
    'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/screen-shot-2021-01-08-at-2-12-55-pm-1610133207.png?crop=1.00xw:0.853xh;0,0.0364xh&resize=480:*',
    'https://parade.com/.image/ar_1:1%2Cc_fill%2Ccs_srgb%2Cq_auto:good%2Cw_1200/MTkwNTc4NzcxNjIxOTE0NDky/soul.png',
    'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/90s-comedy-films-1656424588.jpg?crop=0.502xw:1.00xh;0.250xw,0&resize=640:*',
    'https://img.mensxp.com/media/content/2017/Dec/the-top-10-crime-thriller-movies-of-20171400-1513772701.jpg',
    'https://m.media-amazon.com/images/M/MV5BMTM1NDc5MDYxMl5BMl5BanBnXkFtZTcwMjMzNDAzMQ@@._V1_.jpg',
    'https://media.glamour.com/photos/5ec2e91dccfbc8c1a8fe8cbf/master/w_3000,h_2032,c_limit/MSDTITA_FE057.jpg',
    'https://m.media-amazon.com/images/M/MV5BYTYxNGMyZTYtMjE3MS00MzNjLWFjNmYtMDk3N2FmM2JiM2M1XkEyXkFqcGdeQXVyNjY5NDU4NzI@._V1_.jpg',
    'https://resizing.flixster.com/__VmvRyUjYI4gnH0orpsMFY8-QQ=/fit-in/180x240/v2/https://flxt.tmsimg.com/assets/p10569326_p_v8_af.jpg',
    'https://img3.hulu.com/user/v3/artwork/8f60494d-e543-4427-9375-1bd990c47132?base_image_bucket_name=image_manager&base_image=d7bd284c-1b70-452c-96e5-fbc1712fa592&size=550x825&format=jpeg',
    'https://www.gbhbl.com/wp-content/uploads/2019/11/Wake-Up-Pic-4-350x445.jpg',
    'https://www.indiewire.com/wp-content/uploads/2020/12/sia-music-casting-backlash.png',
    'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/pkdhjf35g-1657660911.jpeg?crop=1xw:1xh;center,top&resize=480:*',
    'https://www.brides.com/thmb/eBXervXGRNFOScHEbRG8sM3vDWM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/MeBeforeYou-3273ea3e643c4fd1808bf76e2f7f7fcd.jpg',
    'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/mv5bmtexmzu0odcxndheqtjeqwpwz15bbwu4mde1oti4mzay-v1-1589813214.jpg?crop=1xw:0.960205078125xh;center,top&resize=480:*',
    'https://m.media-amazon.com/images/M/MV5BYjlhNTRiMDUtZjQxZS00MzllLTg4MjUtOWMzMmNhMTFjYTE1XkEyXkFqcGdeQXVyMTQyNDk2NzE@._V1_FMjpg_UX1000_.jpg',
    'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/en-us-intrsn-main-vertical-27x40-rgb-pre-1646151073.jpg?crop=1xw:0.8438343834383438xh;center,top&resize=480:*',
    'https://upload.wikimedia.org/wikipedia/en/6/6f/War_official_poster.jpg',
    'https://hips.hearstapps.com/vader-prod.s3.amazonaws.com/1661459858-best-western-movies-the-power-of-the-dog-1661459812.jpg'
  ]
  axios.all([reques_top_hit, reques_for_you, reques_movie_slide]).then((responses) => {
    responses_top_hit = responses[0]
    responses_for_you = responses[1]
    responses_movie_slide = responses[2]
    console.log(responses_movie_slide.data.results)
    res.render("main1.ejs", { email: "1", password: "1", movie_top: responses_top_hit.data.results, movie_rec: responses_for_you.data.results, movie_show: responses_movie_slide.data.results, list_genre: list, bg: g_background})

  }).catch(err => console.log(err))

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

