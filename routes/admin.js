const router = require('express').Router();
const {db, User, Comment, Post, Category, LinkPostCategory} = require('../DB');
const bcrypt = require('bcrypt');
const {saltRounds} = require('../const');


router.get('/deleteCategory-:idCategory', (req, res) => {
    if (req.user.role === "admin") {
        Category.destroy({where:{id:req.params.idCategory}});
        LinkPostCategory.destroy({where:{idCategory:req.params.idCategory}});
        res.redirect('/admin')
    }
});
router.get('/createCategory', (req, res) => {
    if (req.user.role === "admin") {
        res.render('createCategory', {user: req.user});
    }
});

router.post('/createCategory', (req, res) => {
    if (req.user.role === "admin") {
        Category.sync()
            .then(() => {
                Category.create({
                    txt: req.body.txt
                });
            })
            .then(() => {
                res.redirect('/admin')
            });
    }
});

router.get('/', (req, res) => {
    if (req.user.role === "admin") {
        User.sync()
            .then(() => {
                return User.findAll({
                    include: [Post]
                });
            })
            .then((users) => {
                for (var y = 0; y < users.length; y++) {
                    users[y]['prettyDate'] = prettyDate(users[y].createdAt);
                    for (var x = 0; x < users[y].posts.length; x++) {
                        users[y]['posts'][x]['prettyDate'] = prettyDate(users[y]['posts'][x].createdAt);
                        if (users[y]['posts'][x].resolved) {
                            users[y]['posts'][x]['resolved'] = "Résolu";
                        } else {
                            users[y]['posts'][x]['resolved'] = "En Attente";
                        }
                    }
                }
                return users;
            })
            .then((users) => {
                Category.sync()
                    .then(() => {
                        return Category.findAll();
                    })
                    .then((categories) => {
                        res.render('dashboard', {user: req.user, users, categories});
                    });
            });
    } else {
        res.redirect("/");
    }
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