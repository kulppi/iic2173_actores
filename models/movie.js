// movie.js
// Movie model logic.


//var Actor = require('../models/actor');
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(process.env.NEO4J_URL || 'http://localhost:7474');

// constants:


var INDEX_NAME = 'nodes';
var INDEX_KEY = 'type';
var INDEX_VAL = 'actor';
var INDEX_VAL_MOVIE = 'movie';
var BACON_INDEX_NAME = "bacon_movie_name"

var _REL = 'acts';

// private constructor:

var Movie = module.exports = function Movie(_node) {
    // all we'll really store is the node; the rest of our properties will be
    // derivable or just pass-through properties (see below).
    this._node = _node;
}

// public instance properties:

Object.defineProperty(Movie.prototype, 'id', {
    get: function () { return this._node.id; }
});

Object.defineProperty(Movie.prototype, 'exists', {
    get: function () { return this._node.exists; }
});

Object.defineProperty(Movie.prototype, 'name', {
    get: function () {
        return this._node.data['name'];
    },
    set: function (name) {
        this._node.data['name'] = name;
    }
});

// private instance methods:

Movie.prototype._getFollowingRel = function (other, callback) {
    var query = [
        'START movie=node({movieId}), other=node({otherId})',
        'MATCH (other) -[rel?:_REL]-> (movie)',
        'RETURN rel'
    ].join('\n')
        .replace('_REL', _REL);

    var params = {
        movieId: this.id,
        otherId: other.id,
    };

    db.query(query, params, function (err, results) {
        if (err) return callback(err);
        var rel = results[0] && results[0]['rel'];
        callback(null, rel);
    });
};

// public instance methods:

Movie.prototype.save = function (callback) {
    this._node.save(function (err) {
        callback(err);
    });

    this._node.index(BACON_INDEX_NAME, "name", this.name, function (err) {
        if (err) return callback(err);
        callback(null, this);
    });
    
    if(this.provider_id != null)
    this._node.index(BACON_INDEX_NAME, "provider_id", this.provider_id, function (err) {
        if (err) return callback(err);
        callback(null, this);
    });
};

Movie.prototype.del = function (callback) {
    this._node.del(function (err) {
        callback(err);
    }, true);   // true = yes, force it (delete all relationships)
};
Movie.prototype.acts = function (other, callback) {
    this._node.createRelationshipTo(other._node, 'acts', {}, function (err, rel) {
        callback(err);
    });
};

Movie.prototype.kickout = function (other, callback) {
    this._getFollowingRel(other, function (err, rel) {
        if (err) return callback(err);
        if (!rel) return callback(null);
        rel.del(function (err) {
            callback(err);
        });
    });
};

// calls callback w/ (err, actors, others) where movies is an array of
// movies this actor has acted, and others is all other movies where he has not.
Movie.prototype.getActorsAndOthers = function (Actor, callback) {
    // query all actors and whether we follow each one or not:
    var query = [
        'START movie=node({movieId}), other=node:INDEX_NAME(INDEX_KEY="INDEX_VAL")',
        'MATCH (other) -[rel?:_REL]-> (movie)',
        'RETURN other, COUNT(rel)'  // COUNT(rel) is a hack for 1 or 0
    ].join('\n')
        .replace('INDEX_NAME', INDEX_NAME)
        .replace('INDEX_KEY', INDEX_KEY)
        .replace('INDEX_VAL', INDEX_VAL)
        .replace('_REL', _REL);

    var params = {
        movieId: this.id,
    };

    var movie = this;
    db.query(query, params, function (err, results) {
        if (err) return callback(err);

        var actors = [];
        var others = [];

        for (var i = 0; i < results.length; i++) {
            var other = new Actor(results[i]['other']);
            var acts = results[i]['COUNT(rel)'];

            if (movie.id === other.id) {
                continue;
            } else if (acts) {
                actors.push(other);
            } else {
                others.push(other);
            }
        }

        callback(null, actors, others);
    });
};


// static methods:

Movie.get = function (id, callback) {
    db.getNodeById(id, function (err, node) {
        if (err) return callback(err);
        callback(null, new Movie(node));
    });
};

Movie.getBy = function (property, value, callback) {
    db.getIndexedNode(BACON_INDEX_NAME, property, value, function (err, node) {
        if (err) return callback(err);
        callback(null, new Movie(node));
    });
};

Movie.getAll = function (callback) {
    db.getIndexedNodes(INDEX_NAME, INDEX_KEY, INDEX_VAL_MOVIE, function (err, nodes) {
        // if (err) return callback(err);
        // XXX FIXME the index might not exist in the beginning, so special-case
        // this error detection. warning: this is super brittle!!
        if (err) return callback(null, []);
        var movies = nodes.map(function (node) {
            return new Movie(node);
        });
        callback(null, movies);
    });
};

// creates the movie and persists (saves) it to the db, incl. indexing it:
Movie.create = function (data, callback) {
    var node = db.createNode(data);
    var movie = new Movie(node);
    node.save(function (err) {
        if (err) return callback(err);
        node.index(INDEX_NAME, INDEX_KEY, INDEX_VAL_MOVIE, function (err) {
            if (err) return callback(err);
            callback(null, movie);
        });
        node.index(BACON_INDEX_NAME, "name", movie.name, function (err) {
            if (err) return callback(err);
            callback(null, movie);
        });
        if(movie.provider_id != null)
        node.index(BACON_INDEX_NAME, "provider_id", movie.provider_id, function (err) {
            if (err) return callback(err);
            callback(null, movie);
        });
    });

};
