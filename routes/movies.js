
// movies.js
// Routes to CRUD movies.

var Actor = require('../models/actor');
var Movie = require('../models/movie');

/**
 * GET /movies
 */
exports.list = function (req, res, next) {
    Movie.getAll(function (err, movies) {
        if (err) return next(err);
        res.render('movies', {
            movies: movies
        });
    });
};

/**
 * POST /movies
 */
exports.create = function (req, res, next) {
    Movie.create({
        name: req.body['name']
    }, function (err, movie) {
        if (err) return next(err);
        res.redirect('/movies/' + movie.id);
    });
};

/**
 * GET /movies/:id
 */
exports.show = function (req, res, next) {
    Movie.get(req.params.id, function (err, movie) {
        if (err) return next(err);
        // TODO also fetch and show followers? (not just follow*ing*)
        movie.getActorsAndOthers( Actor, function (err, actors, others) {
            if (err) return next(err);
            res.render('movie', {
                movie: movie,
                actors: actors,
                others: others
            });
        });
    });
};

/**
 * POST /movies/:id
 */
exports.edit = function (req, res, next) {
    Movie.get(req.params.id, function (err, movie) {
        if (err) return next(err);
        movie.name = req.body['name'];
        movie.save(function (err) {
            if (err) return next(err);
            res.redirect('/movies/' + movie.id);
        });
    });
};

/**
 * DELETE /movies/:id
 */
exports.del = function (req, res, next) {
    Movie.get(req.params.id, function (err, movie) {
        if (err) return next(err);
        movie.del(function (err) {
            if (err) return next(err);
            res.redirect('/movies');
        });
    });
};


/**
 * POST /actors/:id/follow
 */
exports.hire = function (req, res, next) {
    Movie.get(req.params.id, function (err, movie) {
        if (err) return next(err);
        Actor.get(req.body.actor.id, function (err, actor) {
            if (err) return next(err);
            actor.acts(movie, function (err) {
                if (err) return next(err);
                res.redirect('/movies/' + movie.id);
            });
        });
    });
};

/**
 * POST /actors/:id/unfollow
 */
exports.kickout = function (req, res, next) {
    Movie.get(req.params.id, function (err, movie) {
        if (err) return next(err);
        Actor.get(req.body.actor.id, function (err, actor) {
            if (err) return next(err);
            actor.kickout(movie, function (err) {
                if (err) return next(err);
                res.redirect('/movies/' + movie.id);
            });
        });
    });
};
