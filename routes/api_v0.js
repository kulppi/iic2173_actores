// actors.js
// Routes to CRUD actors.

var Actor = require('../models/actor');
var Movie = require('../models/movie');

var $ = require('jquery').create();
/**
 * GET /actors/:id/bacon
 */
exports.bacon = function (req, res, next) {
    Actor.get(req.params.id, function (err, actor) {
        if (err) return next(err);
        Actor.get(req.body.actor.id, function (err, other) {
            actor.shortestPath(other, function (err, bacon) {
                if (err) return next(err);
                var body =  "{\"bacon\" :\"" + bacon+"\"}";
				res.setHeader('Content-Type', 'text/plain');
				res.setHeader('Content-Length', body.length);
				res.end(body);          
            });
        });
    });
};

/**
 * GET /actors/bacon
 */
exports.baconName = function (req, res, next) {
	if( req.body.actor.initial_name != null){ 
			type = "name";
			indentifier_1 = req.body.actor.initial_name;
			indentifier_2 = req.body.actor.end_name;
		}
	else{
			type = "provider_id";
			indentifier_1 = req.body.actor.initial_id;
			indentifier_2 = req.body.actor.end_id;
		}

    Actor.getBy(type,indentifier_1, function (err, actor) {
        if (err) return next(err);
        Actor.getBy(type,indentifier_2, function (err, other) {
        	var body= "{\"bacon\" :\"" ;
        	if (actor != null && other != null){
	            actor.shortestPath(other, function (err, bacon) {
	                if (err) return next(err);
	                 body = body + bacon+"\"}";
    				console.log("status:","success");

					res.setHeader('Content-Type', 'text/plain');
					res.setHeader('Content-Length', body.length);
					res.end(body);   
	                 console.log("body:",body);
	            });
        	}
        	else{
    			console.log("status:","fail");

                 body = body + "not found\", \"Details\":\"Actors not found\"}";
				res.setHeader('Content-Type', 'text/plain');
				res.setHeader('Content-Length', body.length);
				res.end(body);   	
        	};
       
        });
    });
};



/**
 * GET /actors/bacon
 *
 * TODO : No permitir que se formen multiples relaciones.
 */
exports.AddActorsToMovie = function (req, res, next) {
	
	//movie
	var data = { name: req.body.movie['name'] };
	if (req.body.movie["provider_id"]) data.provider_id = req.body.movie["provider_id"] ;
	Movie.getBy("name",data.name, function (err, movie) {
		console.log("err", movie._node);
		//actors
		
		if (movie._node == null){
			Movie.create( data ,  function(err, movie){
				console.log("create", err);

				$.parseJSON(req.body.actors).forEach( function(entry){
					console.log ("entry",entry);
					var data_actor = { name: entry.name };
					if (entry.provider_id) data_actor.provider_id = entry.provider_id ;
					actor = null;
					Actor.getBy("name",data_actor.name, function (err, actor) {
						if (actor && actor._node  == null){
							Actor.create( data_actor , function (err, actor) {
					        	if (err) return next(err);
					        	//Acts in movie
								 actor.acts(movie, function (err) {
					                //if (err) return next(err);
					            });

						    });
						}
						else{
							actor.acts(movie, function (err) {
					             //   if (err) return next(err);
					        });
						}
					});

				});
			});	
		}
		else{
			console.log("in", err);
			$.parseJSON(req.body.actors).forEach( function(entry){
				console.log ("entry",entry);
					var data_actor = { name: entry.name };
					if (entry.provider_id) data_actor.provider_id = entry.provider_id ;
					actor = null;
					Actor.getBy("name",data_actor.name, function (err, actor) {
						if (actor && actor._node  == null){
							Actor.create( data_actor , function (err, actor) {
					        	if (err) return next(err);
					        	//Acts in movie
								 actor.acts(movie, function (err) {
					                //if (err) return next(err);
					            });

						    });
						}
						else{
							actor.acts(movie, function (err) {
					             //   if (err) return next(err);
					        });
						}
					});


			});
		}
	});	

	body = "DATA IN";
	res.setHeader('Content-Type', 'text/plain');
	res.setHeader('Content-Length', body.length);
	res.end(body);  
};



