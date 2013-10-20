// actors.js
// Routes to CRUD actors.

var Actor = require('../models/actor');
var Movie = require('../models/movie');

/**
 * GET /actors
 */
exports.list = function (req, res, next) {
    Actor.getAll(function (err, actors) {
        if (err) return next(err);
        res.render('actors', {
            actors: actors
        });
    });
};

/**
 * POST /actors
 */
exports.create = function (req, res, next) {
    Actor.create({
        name: req.body['name']
    }, function (err, actor) {
        if (err) return next(err);
        res.redirect('/actors/' + actor.id);
    });
};

/**
 * GET /actors/:id
 */
exports.show = function (req, res, next) {
    Actor.get(req.params.id, function (err, actor) {
        if (err) return next(err);
        // TODO also fetch and show followers? (not just follow*ing*)
        Actor.getAll(function (err, actors) {
            actor.getMoviesAndOthers(function (err, movies, others) {
                if (err) return next(err);
                res.render('actor', {
                    actor: actor,
                    actors: actors,
                    movies: movies,
                    others: others
                });
            });
        });
    });
};

/**
 * POST /actors/:id/bacon
 */
exports.bacon = function (req, res, next) {
    Actor.get(req.params.id, function (err, actor) {
        if (err) return next(err);
        Actor.get(req.body.actor.id, function (err, other) {
            actor.shortestPath(other, function (err, bacon) {
                if (err) return next(err);
                res.render('bacon', {
                    actor: actor,
                    other: other,
                    bacon: bacon
                });                    
            });
        });
    });
};



/**
 * POST /actors/:id
 */
exports.edit = function (req, res, next) {
    Actor.get(req.params.id, function (err, actor) {
        if (err) return next(err);
        actor.name = req.body['name'];
        actor.save(function (err) {
            if (err) return next(err);
            res.redirect('/actors/' + actor.id);
        });
    });
};

/**
 * DELETE /actors/:id
 */
exports.del = function (req, res, next) {
    Actor.get(req.params.id, function (err, actor) {
        if (err) return next(err);
        actor.del(function (err) {
            if (err) return next(err);
            res.redirect('/actors');
        });
    });
};

/**
 * POST /actors/:id/follow
 */
exports.hire = function (req, res, next) {
    Actor.get(req.params.id, function (err, actor) {
        if (err) return next(err);
        Movie.get(req.body.movie.id, function (err, other) {
            if (err) return next(err);
            actor.acts(other, function (err) {
                if (err) return next(err);
                res.redirect('/actors/' + actor.id);
            });
        });
    });
};

/**
 * POST /actors/:id/unfollow
 */
exports.kickout = function (req, res, next) {
   Actor.get(req.params.id, function (err, actor) {
        if (err) return next(err);
        Movie.get(req.body.movie.id, function (err, other) {
            if (err) return next(err);
            actor.kickout(other, function (err) {
                if (err) return next(err);
                res.redirect('/actors/' + actor.id);
            });
        });
    });
};
