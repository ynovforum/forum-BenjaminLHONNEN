const router = require('express').Router();
const bcrypt = require('bcrypt');
const fs = require('fs');
const {db, User, Comment, Post, Category, LinkPostCategory} = require('../DB');
const passport = require('passport');
const {saltRounds} = require('../const');
const formidable = require('formidable');


router.get('/addPost', (req, res) => {
    if (req.user !== undefined && req.user !== null) {
        Category.sync()
            .then(()=>{
                return Category.findAll();
            })
            .then((categories)=>{
                res.render('formAddPost', {user: req.user,categories});
            });
    } else {
        res.redirect("/login");
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
                post['prettyDate'] = prettyDate(post['createdAt']);
                res.render('postDetail', {post, user: req.user});
            });
    } else {
        res.redirect("/login");
    }
});
router.get('/updatePost-:idPost', (req, res) => {
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
                if (post.user.id === req.user.id) {
                    post['prettyDate'] = prettyDate(post['createdAt']);
                    res.render('updatePost', {post, user: req.user});
                } else {
                    res.render('postDetail', {post, user: req.user});
                }
            });
    } else {
        res.redirect("/login");
    }
});
router.post('/updatePost-:idPost', (req, res) => {
    if (req.user !== undefined && req.user !== null) {
        Post
            .sync()
            .then(() => {
                return Post.find({
                    where: {
                        id: req.params.idPost
                    },
                    include: [User]
                });
            })
            .then((post) => {
                if (post.user.id === req.user.id) {
                    Post.sync()
                        .then(() => {
                            Post
                                .update({
                                    title: req.body.title,
                                    content: req.body.content,
                                    category: req.body.category,
                                }, {
                                    where: {id: req.params.idPost}
                                })
                                .then(() => {
                                    res.redirect('postDetail-' + post.id);
                                });
                        });
                } else {
                    res.render('postDetail', {post, user: req.user});
                }
            });
    } else {
        res.redirect("/login");
    }
});

router.get('/', (req, res) => {
    if (req.user !== undefined && req.user !== null) {
        res.render('index', {user: req.user});
    } else {
        res.redirect("/login");
    }
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

router.get('/login', (req, res) => {
    res.render('login');

});

router.get('/register', (req, res) => {
    res.render('register');
});
router.post('/register', (req, res) => {
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
                User
                    .count()
                    .then((count) => {
                        let role = "default";
                        if (count === 0) {
                            role = "admin";
                        }
                        let form = new formidable.IncomingForm();
                        //Formidable uploads to operating systems tmp dir by default
                        form.uploadDir = "./tmp";       //set upload directory
                        form.keepExtensions = true;     //keep file extension

                        form.parse(req, function (err, fields, files) {
                            console.log(fields);
                            console.log("form.bytesReceived");
                            //TESTING
                            console.log("file size: " + JSON.stringify(files.fileUploaded.size));
                            console.log("file path: " + JSON.stringify(files.fileUploaded.path));
                            console.log("file name: " + JSON.stringify(files.fileUploaded.name));
                            console.log("file type: " + JSON.stringify(files.fileUploaded.type));
                            console.log("astModifiedDate: " + JSON.stringify(files.fileUploaded.lastModifiedDate));

                            var timestamp = "default";
                            if(files.fileUploaded.size !== 0){
                                timestamp = Date.now();
                                fs.rename(files.fileUploaded.path, './public/assets/upload/img/' + timestamp + ".png", function (err) {
                                    if (err)
                                        throw err;
                                    console.log('renamed complete');
                                });
                            }

                            bcrypt.hash(fields.password, saltRounds, function (err, hash) {
                                User
                                    .sync()
                                    .then(() => {
                                        return User.create({
                                            mail: fields.userName,
                                            password: hash,
                                            pseudo: fields.pseudo,
                                            bio: fields.bio,
                                            role: role,
                                            imgSrc: './assets/upload/img/' + timestamp + '.png',
                                        })
                                    })
                                    .then((user) => {
                                        req.login(user, function (err) {
                                            if (err) {
                                                console.error(err);
                                                res.redirect('/register');
                                            } else {

                                                res.redirect('/');
                                            }
                                        });
                                    });

                            });
                        });
                    });
            }
        })
        .catch(() => {
            res.send(500);
        });
});

router.get('/disconnect', (req, res) => {
    req.user = null;
    res.redirect('login');
});


function prettyDate(time) {
    var date = new Date(time),
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400),
        month_diff = Math.floor(diff / (86400 * 31));

    if (isNaN(day_diff) || day_diff < 0)
        return;

    return day_diff == 0 && (
        (diff < 60 && month_diff === 0) && "à l'instant" ||
        (diff < 120 && month_diff === 0) && "Il y a 1 minute" ||
        (diff < 3600 && month_diff === 0) && "Il y a " + Math.floor(diff / 60) + " minutes" ||
        (diff < 7200 && month_diff === 0) && "Il y a 1 heure" ||
        (diff < 86400 && month_diff === 0) && "Il y a " + Math.floor(diff / 3600) + " heures") ||
        (day_diff === 1 && month_diff === 0) && "Hier " ||
        (day_diff < 7 && month_diff === 0) && "Il y a " + day_diff + " jours" ||
        (day_diff < 31 && month_diff === 0) && "Il y a " + Math.ceil(day_diff / 7) + " semaines" ||
        month_diff === 1 && "1 mois " ||
        month_diff > 0 && "Il y a " + month_diff + " mois";
}

module.exports = router;