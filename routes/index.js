const router = require('express').Router();
const user = require('./user');
const admin = require('./admin');
const api = require('./api');

function isAuthenticatedAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        return next();
    }

    return res.redirect('/');
}
function isAuthenticated(req, res, next) {
    if (req.user) {
        return next();
    }

    return res.redirect('/');
}

router.use('/', user);
router.use('/api',isAuthenticated, api);
router.use('/admin', isAuthenticatedAdmin, admin);

module.exports = router;