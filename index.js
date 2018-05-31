// bcrypt request express-session cookie-parser passport-local express passport body-parser mysql2 sequalize twig
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const routes = require('./routes');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const cookieParser = require('cookie-parser');
const session = require('express-session');

const request = require('request');

let {db, User} = require('./DB');
const {COOKIE_SECRET} = require('./const');


app.set('view engine', 'twig');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cookieParser(COOKIE_SECRET));
app.use(session({
    secret: COOKIE_SECRET,
    resave: false,
    saveUninitialized: false
}));


// Initialize passport, it must come after Express' session() middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(routes);

app.listen(3000);

passport.serializeUser((user, cb) => {
    cb(null, user.mail);
});
passport.deserializeUser((mail, cb) => {
    // Get a user from a cookie's content: his email
    User
        .findOne({where: {mail}})
        .then((user) => {
            cb(null, user);
        })
        .catch(cb);
});

passport.use(new LocalStrategy((mail, password, done) => {
    User
        .findOne({where: {mail}})
        .then(function (user) {
            if (user) {
                bcrypt.compare(password, user.dataValues.password, function (err, res) {
                    if (res === true) {
                        return done(null, user);
                    } else {
                        return done(null, false, {
                            message: 'Invalid credentials'
                        });
                    }
                });

            } else {
                return done(null, false, {
                    message: 'Invalid credentials'
                });
            }
        })
        .catch(done);
}));


module.exports = {
    passport: passport,
};
