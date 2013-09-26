// actor.js
// Actor model logic.

var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(process.env.NEO4J_URL || 'http://localhost:7474');

// constants:


var INDEX_NAME = 'nodes';
var INDEX_KEY = 'type';
var INDEX_VAL = 'actor';

var _REL = 'acts';

// private constructor:

var Actor = module.exports = function Actor(_node) {
    // all we'll really store is the node; the rest of our properties will be
    // derivable or just pass-through properties (see below).
    this._node = _node;
}

// public instance properties:

Object.defineProperty(Actor.prototype, 'id', {
    get: function () { return this._node.id; }
});

Object.defineProperty(Actor.prototype, 'exists', {
    get: function () { return this._node.exists; }
});

Object.defineProperty(Actor.prototype, 'name', {
    get: function () {
        return this._node.data['name'];
    },
    set: function (name) {
        this._node.data['name'] = name;
    }
});

// private instance methods:

Actor.prototype._getFollowingRel = function (other, callback) {
    var query = [
        'START actor=node({actorId}), other=node({otherId})',
        'MATCH (actor) -[rel?:_REL]-> (other)',
        'RETURN rel'
    ].join('\n')
        .replace('_REL', _REL);

    var params = {
        actorId: this.id,
        otherId: other.id,
    };

    db.query(query, params, function (err, results) {
        if (err) return callback(err);
        var rel = results[0] && results[0]['rel'];
        callback(null, rel);
    });
};

// public instance methods:

Actor.prototype.save = function (callback) {
    this._node.save(function (err) {
        callback(err);
    });
};

Actor.prototype.del = function (callback) {
    this._node.del(function (err) {
        callback(err);
    }, true);   // true = yes, force it (delete all relationships)
};

Actor.prototype.follow = function (other, callback) {
    this._node.createRelationshipTo(other._node, 'follows', {}, function (err, rel) {
        callback(err);
    });
};

Actor.prototype.unfollow = function (other, callback) {
    this._getFollowingRel(other, function (err, rel) {
        if (err) return callback(err);
        if (!rel) return callback(null);
        rel.del(function (err) {
            callback(err);
        });
    });
};

// calls callback w/ (err, following, others) where following is an array of
// actors this actor follows, and others is all other actors minus him/herself.
Actor.prototype.getFollowingAndOthers = function (callback) {
    // query all actors and whether we follow each one or not:
    var query = [
        'START actor=node({actorId}), other=node:INDEX_NAME(INDEX_KEY="INDEX_VAL")',
        'MATCH (actor) -[rel?:_REL]-> (other)',
        'RETURN other, COUNT(rel)'  // COUNT(rel) is a hack for 1 or 0
    ].join('\n')
        .replace('INDEX_NAME', INDEX_NAME)
        .replace('INDEX_KEY', INDEX_KEY)
        .replace('INDEX_VAL', INDEX_VAL)
        .replace('_REL', _REL);

    var params = {
        actorId: this.id,
    };

    var actor = this;
    db.query(query, params, function (err, results) {
        if (err) return callback(err);

        var following = [];
        var others = [];

        for (var i = 0; i < results.length; i++) {
            var other = new Actor(results[i]['other']);
            var follows = results[i]['COUNT(rel)'];

            if (actor.id === other.id) {
                continue;
            } else if (follows) {
                following.push(other);
            } else {
                others.push(other);
            }
        }

        callback(null, following, others);
    });
};

// static methods:

Actor.get = function (id, callback) {
    db.getNodeById(id, function (err, node) {
        if (err) return callback(err);
        callback(null, new Actor(node));
    });
};

Actor.getAll = function (callback) {
    db.getIndexedNodes(INDEX_NAME, INDEX_KEY, INDEX_VAL, function (err, nodes) {
        // if (err) return callback(err);
        // XXX FIXME the index might not exist in the beginning, so special-case
        // this error detection. warning: this is super brittle!!
        if (err) return callback(null, []);
        var actors = nodes.map(function (node) {
            return new Actor(node);
        });
        callback(null, actors);
    });
};

// creates the actor and persists (saves) it to the db, incl. indexing it:
Actor.create = function (data, callback) {
    var node = db.createNode(data);
    var actor = new Actor(node);
    node.save(function (err) {
        if (err) return callback(err);
        node.index(INDEX_NAME, INDEX_KEY, INDEX_VAL, function (err) {
            if (err) return callback(err);
            callback(null, actor);
        });
    });
};
