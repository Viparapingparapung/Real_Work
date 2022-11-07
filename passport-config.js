const LocalStrategy = require("passport-local").Strategy
const bcrypt = require('bcrypt')
var MongoClient = require("mongodb").MongoClient;
var url = process.env.CON_DB;

/*Find User register/login something*/
function initialize(passport) {
    const authenticateUser = async (email, password , done) => {
        MongoClient.connect(url, function (err,db) {
            if (err) throw err;
            var dbo = db.db("test");
            var query = {email:email};
            dbo
                .collection("brabs")
                .find(query)
                .toArray(async function (err, result) {
                    if (err) throw err;
                    query = result[0];
                    db.close;

                    const user = query;
                    console.log(user);
                    if (query?.username == null) {
                        return done(null, false,{ message : "No user with that email"});
                    }
                    try {
                        if (await bcrypt.compare(password, user.password)){
                            return done(null,user)
                        } else {
                            return done(null, false, { message : "Password incorrect" })
                        }
                    } catch (e) {
                        return done(e);
                    }
                });
        });
    };

        
    //Passport.js
    passport.use(new LocalStrategy({usernameField : "email",passwordField : "password"}, authenticateUser))
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => {
        return done(null, user);
    })
}

module.exports = initialize
