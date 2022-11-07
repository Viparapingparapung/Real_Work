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
const bodyParser = require("body-parser")

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
const Post = require("./models/post_blog");
const post_blog = require('./models/post_blog');
const JWT_SECRET = 'some super secret...'

// middleware
app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(express.static(__dirname + '/public'));
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

app.get('/test', (req, res) => {
  res.render('detail.ejs')
})


app.get('/', (req, res) => {
  res.render('register.ejs')
})

//
app.get('/login', (req, res) => {
  res.render('login.ejs')
})

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user) => {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/home'); }

    req.logIn(user, (err) => {
      if (err) { return next(err); }
      return res.render("main1.ejs",{email:user.email,password:user.password});
    })
  })(req, res, next)
})

/*
app.get('/:id' , (req,res) => {
  try {
    const author = User.findById(req.params.id)
    res.render('iduserprofile.ejs', {
      author: author
    })

  } catch {
    res.redirect('/')
  }
})

app.put('/:id' , async (req,res) => {
  let author
  try {
    author = await User.findById(req.params.id)
    author.name = req.body.name
    await author.save()
    res.redirect(`/profile/${author.id}`)
  } catch {
    if (author == null) {
      res.redirect('/')
    } else {
      res.render('edit', {
        author : author,
        errorMessage: 'Error Update'
      })
    }
  }
})
app.get('/:id/edit', async (req,res) => {
  try {
    const author = await User.findById(req.params.id)
    res.render('edit' , {author: author})
  } catch {
    res.redirect('/profile')
  }
}) 

app.delete('/:id', async (req,res) => {
  let author
  try {
    author = await User.findById(req.params.id)
    await author.remove()
    res.redirect('/profile')
  } catch {
    if (author == null) {
      res.redirect('/')
    } else {
      res.redirect(`/profile/${author.id}`)
    }
  }
});
*/

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

app.get("/logout", (req, res) => {
  req.logout();
  req.redirect("/main");
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

app.get("/title/:id", (req, res) => {
  Post.findById(req.params.id)
    .populate('comments')
    .exec(function (err, results) {
      if (err) { console.log(err) }
      res.render('detail', { title: "Post detail", post: results, comments: results.comments })
    })
})

app.get('/title/:id/comment', (req, res) => {
  res.render('post-comment', { title: 'Post a comment' })
})

app.post('/title/:id/comment', async (req, res) => {
  const comment = new Comment({ text: req.body.text });
  const post = await Post.findById(req.params.id);
  const savedPost = post.comments.push(comment);

  savedPost.save(function (err, results) {
    if (err) { console.log(err) }
    res.render('detail', { title: 'Post detail', comments: results.comments })
  })
})

app.get('/main', (req, res) => {
  console.log(req.user)
  res.render('main1.ejs')
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

app.get("/home", function (req, res) {
  res.render("main1.ejs", {email: "1",password:"1"})
})

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

