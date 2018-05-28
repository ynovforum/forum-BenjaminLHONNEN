const mysql2 = require('mysql2');
const Sequelize = require('sequelize');


const db = new Sequelize('forum', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

const User = db.define('user', {
    mail: {type: Sequelize.STRING},
    password: {type: Sequelize.STRING},
    userName: {type: Sequelize.STRING},
    role: {type: Sequelize.STRING},
    imgSrc: {type: Sequelize.STRING},
    bio: {type: Sequelize.TEXT},
});

const Post = db.define('post', {
    title: {type: Sequelize.STRING},
    content: {type: Sequelize.STRING},
    category: {type: Sequelize.STRING},
    imgSrc: {type: Sequelize.STRING},
    idUser: {type: Sequelize.INTEGER},
});

const Comment = db.define('comment', {
    content: {type: Sequelize.STRING},
    idPost: {type: Sequelize.INTEGER},
    idUser: {type: Sequelize.INTEGER},
});

User.hasMany(Post, {foreignKey: 'idUser'});
Post.belongsTo(User, {foreignKey: 'idUser'});

Post.hasMany(Comment, {foreignKey: 'idPost'});
Comment.belongsTo(Post, {foreignKey: 'idPost'});

User.hasMany(Comment, {foreignKey: 'idUser'});
Comment.belongsTo(User, {foreignKey: 'idUser'});

User.sync();
Comment.sync();
Post.sync();


module.exports = {
    User: User,
    Comment: Comment,
    Post: Post,
    db: db,
};