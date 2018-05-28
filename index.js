const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');
const session = require('express-session');
const request = require('request');
const bcrypt = require('bcrypt');

// bcrypt request express-session cookie-parser passport-local express passport body-parser

const saltRounds = 12;
const {db, User, Follows, Comment} = require('./DB');
const {COOKIE_SECRET, YOUTUBE_API_KEY} = require('./const');

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
app.get('/following', (req, res) => {
    if (req.user !== undefined && req.user !== null) {
        res.render("following", {user: req.user.dataValues});
    } else {
        res.redirect("/login");
    }
});


app.get('/api/get/following', (req, res) => {
    if (req.user !== undefined && req.user !== null) {
        Follows
            .sync()
            .then(() => {
                return Follows
                    .findAll({
                        where: {
                            userId: req.user.id,
                        }
                    })
            })
            .then((channelsIds) => {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(channelsIds));
            });
    } else {
        res.redirect("/login");
    }
});

app.get('/api/get/comments-:videoId', (req, res) => {
    if (req.user !== undefined && req.user !== null) {
        Comment
            .sync()
            .then(() => {
                return Comment
                    .findAll({
                        where: {
                            idVideo: req.params.videoId,
                        },
                        include:[User]
                    })
            })
            .then((comments) => {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(comments));
            });
    } else {
        res.redirect("/login");
    }
});

app.get('/api/get/getLastVideos-:channelId', (req, res) => {
    const url = "https://www.googleapis.com/youtube/v3/search?part=id&channelId=" + req.params.channelId + "&maxResults=10&order=date&type=video&key=" + YOUTUBE_API_KEY;
    request({
        headers: {
            'User-Agent': 'Node App',
        },
        uri: url
    }, (err, response, body) => {
        if (err) {
            res.sendStatus(500);
        } else if (Math.floor(response.statusCode / 100) === 2) {
            let tmp = JSON.parse(body);
            tmp['channelId'] = req.params.channelId;
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(tmp));
        } else {
            res.sendStatus(403);
        }
    });
});
app.get('/api/get/channel-:channelId', (req, res) => {
    const url = "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=" + req.params.channelId + "&key=" + YOUTUBE_API_KEY;
    request({
        headers: {
            'User-Agent': 'Node App',
        },
        uri: url
    }, (err, response, body) => {
        if (err) {
            res.sendStatus(500);
        } else if (Math.floor(response.statusCode / 100) === 2) {
            let tmp = JSON.parse(body);
            tmp['channelId'] = req.params.channelId;
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(tmp));
        } else {
            res.sendStatus(403);
        }
    });
});

app.get('/api/get/videos-:videosIds', (req, res) => {
    const url = "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics,player&id=" + req.params.videosIds + "&key=" + YOUTUBE_API_KEY;
    request({
        headers: {
            'User-Agent': 'Node App',
        },
        uri: url
    }, (err, response, body) => {
        if (err) {
            res.sendStatus(500);
        } else if (Math.floor(response.statusCode / 100) === 2) {
            console.log("err : ", err);
            console.log("response.statusCode : ", response.statusCode);
            res.setHeader('Content-Type', 'application/json');
            res.send(body);
        } else {
            res.sendStatus(403);
        }
    });
});


app.get('/api/post/follow-:channelId', (req, res) => {
    if (req.user !== undefined && req.user !== null && req.params.channelId !== undefined && req.params.channelId !== null) {
        Follows
            .sync()
            .then(() => {
                return Follows.findOne({
                    where: {
                        userId: req.user.id,
                        channelId: req.params.channelId,
                    }
                })
            })
            .then((follow) => {
                if (follow === null) {
                    Follows.create({
                        userId: req.user.id,
                        channelId: req.params.channelId,
                    });
                    res.sendStatus(200);
                } else {
                    res.sendStatus(403);
                }
            });
    } else {
        res.sendStatus(403);
    }
});

app.post('/api/post/comment-:videoId', (req, res) => {
    if (req.user !== undefined && req.user !== null && req.params.videoId !== undefined && req.params.videoId !== null) {
        Comment
            .sync()
            .then(() => {
                console.log("Create Comment : ");
                console.log("comment : ", req.body.comment);
                console.log("user.id : ", req.user.id);
                console.log("videoId : ",req.params.videoId);
                Comment.create({
                    idUser: req.user.id,
                    comment: req.body.comment,
                    idVideo: req.params.videoId,
                });
                res.sendStatus(200);
            });
    } else {
        res.sendStatus(403);
    }
});

app.get('/api/get/channels-:search', (req, res) => {
    // "https://www.googleapis.com/youtube/v3/search?key="+ YOUTUBE_API_KEY +"&q=" + req.params.search+"&maxResults=10&type=channel&part=snippet"
    const url = "https://www.googleapis.com/youtube/v3/search?key=" + YOUTUBE_API_KEY + "&q=" + req.params.search + "&maxResults=10&type=channel&part=snippet";
    request({
        headers: {
            'User-Agent': 'Node App',
        },
        uri: url
    }, (err, response, body) => {
        console.log(response.statusCode);
        console.log(url);
        if (err) {
            console.error(err);
        } else if (Math.floor(response.statusCode / 100) === 2) {

            let channels = JSON.parse(body);

            let urlChannels = "https://www.googleapis.com/youtube/v3/channels?key=" + YOUTUBE_API_KEY + "&part=id,snippet,statistics&id=";
            channels.items.forEach(function (value, index, array) {
                urlChannels += (value.id.channelId);
                if (index !== array.length - 1) {
                    urlChannels += ",";
                }
            });

            request({
                headers: {
                    'User-Agent': 'Node App',
                },
                uri: urlChannels
            }, (err, response, body) => {
                if (err) {
                } else if (Math.floor(response.statusCode / 100) === 2) {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(body);
                } else {
                    res.sendStatus(500);
                }
            });
        } else {
            res.sendStatus(500);
        }
    });
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
