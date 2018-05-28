const mysql2 = require('mysql2');
const Sequelize = require('sequelize');


const db = new Sequelize('youtube', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

const User = db.define('user', {
    mail: {type: Sequelize.STRING},
    password: {type: Sequelize.STRING},
    userName: {type: Sequelize.STRING},
});

const Follows = db.define('follow', {
    userId: {type: Sequelize.INTEGER},
    channelId: {type: Sequelize.STRING},
});

const Comment = db.define('comment', {
    idVideo: { type: Sequelize.STRING },
    idUser: { type: Sequelize.INTEGER },
    comment: { type: Sequelize.TEXT },
});

User.hasMany(Follows, {foreignKey: 'userId'});
Follows.belongsTo(User, {foreignKey: 'userId'});

User.hasMany(Comment, { foreignKey: 'idUser' });
Comment.belongsTo(User, { foreignKey: 'idUser' });

User.sync();
Comment.sync();
Follows.sync();

module.exports = {
    User: User,
    Follows: Follows,
    Comment:Comment,
    db: db,
};