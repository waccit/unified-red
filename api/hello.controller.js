const router = require('express').Router();

// routes
router.get('/', getAll);
router.get('/:id', getById);

module.exports = router;

function getAll(req, res, next) {
    res.json({ "result" : "World" });
    // userService.getAll()
    //     .then(users => res.json(users))
    //     .catch(err => next(err));
}

function getById(req, res, next) {
    res.json({ "result" : req.params.id });
    // userService.getById(req.params.id)
    //     .then(user => user ? res.json(user) : res.sendStatus(404))
    //     .catch(err => next(err));
}
