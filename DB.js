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
});

User.hasMany(Follows, {foreignKey: 'userId'});

module.exports = {
    User: User,
    Follows: Follows,
    Comment:Comment,
    db: db,
};