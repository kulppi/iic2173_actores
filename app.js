
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.locals({
    title: 'Node-Neo4j Template'    // default title
});

// Routes

app.get('/', routes.site.index);

app.get('/actors', routes.actors.list);
app.post('/actors', routes.actors.create);
app.get('/actors/:id', routes.actors.show);
app.post('/actors/:id', routes.actors.edit);
app.del('/actors/:id', routes.actors.del);

app.post('/actors/:id/follow', routes.actors.follow);
app.post('/actors/:id/unfollow', routes.actors.unfollow);

app.get('/movies', routes.movies.list);
app.post('/movies', routes.movies.create);
app.get('/movies/:id', routes.movies.show);
app.post('/movies/:id', routes.movies.edit);
app.del('/movies/:id', routes.movies.del);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
