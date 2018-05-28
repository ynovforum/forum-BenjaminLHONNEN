const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');
const session = require('express-session');
const request = require('request');
const bcrypt = require('bcrypt');

// bcrypt request express-session cookie-parser passport-local express passport body-parser mysql2 sequalize

const saltRounds = 12;
const {db, User} = require('./DB');
const {COOKIE_SECRET} = require('./const');

app.set('view engine', 'pug');
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


app.get('/', (req, res) => {
    if (req.user !== undefined && req.user !== null) {
        res.render('index', {user: req.user.dataValues});
    } else {
        res.redirect("/login");
    }
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

app.get('/login', (req, res) => {
    // Render the login page
    res.render('login');
});

app.get('/register', (req, res) => {
    // Render the login page
    res.render('register');
});
app.post('/register', (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        User
            .sync()
            .then(() => {
                User.find({
                    where: {
                        mail: req.body.userName,
                    }
                })
            })
            .then((user) => {
                if (user === null || user === undefined) {
                    return User.create({
                        mail: req.body.userName,
                        password: hash,
                        userName: req.body.pseudo,
                    });
                }
            })
            .then((user) => {
                user = user.dataValues;
                console.error(user);
                req.login(user, function (err) {
                    if (err) {
                        console.error(err);
                        res.redirect('/register');
                    } else {
                        res.redirect('/');
                    }
                });
            })
            .catch(() => {
                res.send(500);
            });
    });
});

app.get('/disconnect', (req, res) => {
    req.user = null;
    res.redirect('login');
});

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
        // If an error occured, report it
        .catch(done);
}));

app.listen(3000);
