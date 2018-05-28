const router = require('express').Router();
const bcrypt = require('bcrypt');
let {isAdminCreate} = require('../params');
const fs = require('fs');
const {db, User, Post, Comment} = require('../DB');
const passport = require('passport');
const {saltRounds} = require('../const');


router.get('/addPost', (req, res) => {
    if (req.user !== undefined && req.user !== null) {
        res.render('formAddPost', {user: req.user});
    } else if (isAdminCreate) {
        res.redirect("/login");
    } else {
        res.redirect("/register");
    }
});
router.get('/postDetail-:idPost', (req, res) => {
    if (req.user !== undefined && req.user !== null) {
        Post
            .sync()
            .then(() => {
                return Post.find({
                    where: {
                        id: req.params.idPost
                    },
                    include: [
                        User,
                        {model: Comment, include: User}
                    ]
                });
            })
            .then((post) => {
                res.render('postDetail', {post,user: req.user});
            });
    } else if (isAdminCreate) {
        res.redirect("/login");
    } else {
        res.redirect("/register");
    }
});

router.get('/', (req, res) => {
    if (req.user !== undefined && req.user !== null) {
        res.render('index', {user: req.user});
    } else if (isAdminCreate) {
        res.redirect("/login");
    } else {
        res.redirect("/register");
    }
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

router.get('/login', (req, res) => {
    if (isAdminCreate) {
        res.render('login');
    } else {
        res.redirect("/register");
    }
});

router.get('/register', (req, res) => {
    // Render the login page
    res.render('register', {isAdminCreate});
});
router.post('/register', (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        User
            .sync()
            .then(() => {
                return User.find({
                    where: {
                        mail: req.body.email,
                    }
                })
            })
            .then((user) => {
                if (user === null || user === undefined) {
                    let role = "default";
                    if (isAdminCreate === false) {
                        role = "admin";
                    }
                    return User.create({
                        mail: req.body.userName,
                        password: hash,
                        pseudo: req.body.pseudo,
                        bio: req.body.bio,
                        role: role,
                        imgSrc: "/assets/user-img/default.png",
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
                        if (isAdminCreate === false) {
                            isAdminCreate = true;
                            fs.writeFile('../params.js', "const isAdminCreate = true;\n" +
                                "module.exports = {\n" +
                                "    isAdminCreate: isAdminCreate,\n" +
                                "};",
                                function (err) {
                                    if (err) throw err;
                                    console.log('It\'s saved!');
                                });
                        }
                        res.redirect('/');
                    }
                });
            })
            .catch(() => {
                res.send(500);
            });
    });
});

router.get('/disconnect', (req, res) => {
    req.user = null;
    res.redirect('login');
});

module.exports = router;