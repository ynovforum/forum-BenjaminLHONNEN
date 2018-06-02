const router = require('express').Router();
const {db, User, Comment, Post, Category, LinkPostCategory} = require('../DB');
const formidable = require('formidable');
const fs = require('fs');

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
router.get('/get/post-:filtre', (req, res) => {
    Post
        .sync()
        .then(() => {
            let tmp = req.params.filtre.split(";");
            let filtre = {};
            for (var y = 0; y < tmp.length; y++) {
                tmp[y] = tmp[y].split("=");
                filtre[tmp[y][0]] = tmp[y][1];
            }

            let order = ['createdAt', 'DESC'];
            if (typeof filtre['order'] !== 'undefined') {
                if (filtre['order'] === "dateASC") {
                    order = ['createdAt', 'ASC'];
                } else if (filtre['order'] === "dateDESC") {
                    order = ['createdAt', 'DESC'];
                } else if (filtre['order'] === "open") {
                    order = ['resolved', 'ASC'];
                } else if (filtre['order'] === "close") {
                    order = ['resolved', 'DESC'];
                }
            }

            let where = {};
            if (typeof filtre['where'] !== 'undefined') {
                if (filtre['where'] === "open") {
                    where = {resolved: false};
                } else if (filtre['where'] === "close") {
                    where = {resolved: true};
                }
            }

            let limit = (typeof filtre['limit'] !== 'undefined') ? filtre['limit'] : 10;

            console.log("limit : ", limit);
            console.log("order : ", order);
            console.log("where : ", where);
            console.log("obj : ", {
                order: [order],
                where: where
            });
            return Post.findAll(
                {
                    limit: 10,
                    order: [order],
                    include: [
                        User,
                        {model: Comment, include: User}
                    ],
                    where: where
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

        var timestamp = "no-img";
        if (files.fileUploaded.size !== 0) {
            timestamp = Date.now();
            fs.rename(files.fileUploaded.path, './public/assets/upload/img/' + timestamp + ".png", function (err) {
                if (err)
                    throw err;
                console.log('renamed complete');
            });
        }
        Post
            .create({
                title: fields.title,
                content: fields.content,
                category: fields.category,
                imgSrc: './assets/upload/img/' + timestamp + '.png',
                resolved: false,
                idUser: req.user.id,
            })
            .then((post)=>{
                console.log("categoryBis : ", fields.categoryBis);
                let categories = fields.categoryBis.split(',');
                for(let y=0; y < categories.length;y++){
                    if(categories[y]){
                        LinkPostCategory.create({
                            idPost:post.id,
                            idCategory:categories[y],
                        });
                    }
                }
            })
            .then(()=>{
                res.redirect("/");
            })
    });

});

router.get('/post/postResolved-:idPost', (req, res) => {
    Post
        .sync()
        .then(() => {
            Post.update({
                resolved: true
            }, {
                where: {
                    id: req.params.idPost
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
                idUser: req.user.id,
                idPost: req.body.idPost,
                content: req.body.content,
                resolved: false,
            });
        }).then((comment) => {
        res.sendStatus(200);
    })
});
router.post('/update/comment-:idComment', (req, res) => {
    Comment
        .sync()
        .then(() => {
            console.log(req.body);
            return Comment.update({
                content: req.body.content,
            }, {
                where: {
                    id: req.params.idComment,
                    idUser: req.user.id,
                }
            });
        }).then((comment) => {
        res.sendStatus(200);
    })
});

module.exports = router;