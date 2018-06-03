const mysql2 = require('mysql2');
const Sequelize = require('sequelize');
const fs = require('fs');

let isAdminCreate = true;

const db = new Sequelize('forum', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

const User = db.define('user', {
    mail: {type: Sequelize.STRING},
    password: {type: Sequelize.STRING},
    pseudo: {type: Sequelize.STRING},
    role: {type: Sequelize.STRING},
    imgSrc: {type: Sequelize.STRING},
    bio: {type: Sequelize.TEXT},
});

const Post = db.define('post', {
    title: {type: Sequelize.STRING},
    content: {type: Sequelize.TEXT},
    imgSrc: {type: Sequelize.STRING},
    idUser: {type: Sequelize.INTEGER},
    resolved: {type: Sequelize.BOOLEAN},
});

const Comment = db.define('comment', {
    content: {type: Sequelize.TEXT},
    idPost: {type: Sequelize.INTEGER},
    idUser: {type: Sequelize.INTEGER},
});
const Category = db.define('category', {
    txt: {type: Sequelize.STRING},
});
const LinkPostCategory = db.define('linkpostcategory', {
    idPost: {type: Sequelize.INTEGER},
    idCategory: {type: Sequelize.INTEGER},
});

User.hasMany(Post, {foreignKey: 'idUser'});
Post.belongsTo(User, {foreignKey: 'idUser'});

Post.hasMany(Comment, {foreignKey: 'idPost'});
Comment.belongsTo(Post, {foreignKey: 'idPost'});

Post.hasMany(LinkPostCategory, {foreignKey: 'idPost'});
LinkPostCategory.belongsTo(Post, {foreignKey: 'idPost'});

Category.hasMany(LinkPostCategory, {foreignKey: 'idCategory'});
LinkPostCategory.belongsTo(Category, {foreignKey: 'idCategory'});

User.hasMany(Comment, {foreignKey: 'idUser'});
Comment.belongsTo(User, {foreignKey: 'idUser'});

User.sync();
Comment.sync();
Post.sync();
Category.sync();
LinkPostCategory.sync();

User.sync();
Comment.sync();
Post.sync();
Category.sync();
LinkPostCategory.sync();


module.exports = {
    User,
    Comment,
    Post,
    LinkPostCategory,
    Category,
    db,
};