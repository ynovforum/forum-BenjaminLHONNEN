const router = require('express').Router();
const {db, User, Comment, Post} = require('../DB');

router.get('/get/post', (req, res) => {
    Post
        .sync()
        .then(() => {
            return Post.findAll(
                {
                    limit: 10,
                    order: [['createdAt', 'DESC']],
                    include: [
                        User,
                        {model: Comment, include: User}
                    ]
                });
        })
        .then((posts) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(posts));
        })
});
router.get('/get/post-:idPost', (req, res) => {
    Post
        .sync()
        .then(() => {
            return Post.find(
                {
                    where: {id: req.params.idPost},
                    include: [
                        User,
                        {model: Comment, include: User}
                    ]
                });
        })
        .then((post) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(post));
        })
});
router.post('/post/post', (req, res) => {
    Post
        .create({
            title: req.body.title,
            content: req.body.content,
            category: req.body.category,
            imgSrc: "",
            idUser: req.user.id,
        })
        .then(
            res.redirect("/")
        )
});

router.post('/post/postResolved-:idPost', (req, res) => {
    Post
        .sync()
        .then(()=>{
            Post.update({
                resolved:true
            },{
                where:{
                    id:req.params.idPost
                }
            })
        })
        .then(
            res.sendStatus(200)
        )
});


router.get('/get/comment-:idPost', (req, res) => {
    Comment
        .sync()
        .then(() => {
            return Comment.findAll(
                {
                    where: {idPost: req.params.idPost},
                    include: [
                        User
                    ]
                });
        })
        .then((comments) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(comments));
        })
});

router.post('/add/comment', (req, res) => {
    Comment
        .sync()
        .then(() => {
            console.log(req.body);
            return Comment.create({
                idUser:req.user.id,
                idPost:req.body.idPost,
                content:req.body.content,
                resolved:false,
            });
        }).then((comment)=>{
            res.sendStatus(200);
    })
});
router.post('/update/comment-:idComment', (req, res) => {
    Comment
        .sync()
        .then(() => {
            console.log(req.body);
            return Comment.update({
                content:req.body.content,
            },{
                where:{
                    id:req.params.idComment,
                    idUser:req.user.id,
                }
            });
        }).then((comment)=>{
            res.sendStatus(200);
    })
});

module.exports = router;