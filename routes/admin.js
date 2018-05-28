const router = require('express').Router();

router.get('/admin', (req, res) => {
    res.render("index");
});

module.exports = router;