# Node-Neo4j Bacon calculator

This is a bacon calculator app using actors and movies as nodes. It uses the
[node-neo4j][] library, available on npm as `neo4j` and Node.js.

The app is a simple social network manager: it lets you add and remove actors, movies and
 "Acts" relationships between them.

This app supports deploying to DCC server system, and a demo is in fact running live at
[http://arqui3.ing.puc.cl/](http://arqui3.ing.puc.cl/).


## Installation

```bash
# Install the required dependencies
npm install

# Install a local Neo4j instance
curl http://dist.neo4j.org/neo4j-community-1.8.2-unix.tar.gz --O neo4j-community-1.8.2-unix.tar.gz
tar -zxvf neo4j-community-1.8.2-unix.tar.gz
rm neo4j-community-1.8.2-unix.tar.gz
ln -s neo4j-community-1.8.2/bin/neo4j neo4j

#jQuery (case sensitive)
npm install jQuery
npm install jquery
```



## Usage

```bash
# Start the local Neo4j instance
./neo4j start

# Run the app!
node app
```

The app will now be accessible at [http://localhost:3000/](http://localhost:3000/).

The UI is admittedly quite crappy, but hopefully it shows the functionality.
This will be working only by API (TODO)

## API V0.1

#### Bacon by id
```bash
#Post to /api/0.1/actors/:id/bacon
:id => initial actor

#content
actor[id] => target actor
```
#### Bacon by name
```bash
#Post to /api/0.1/actors/bacon

#content by name
actor[initial_name] => intial search actor
actor[end_name] => target actor

#content by provider id
actor[initial_id] => intial search actor
actor[end_id] => target actor

#Example in Python (By Augusto)
import requests
body = {'actor[initial_name]': 'Kevin Bacon', 'actor[end_name]': 'test2'}
r = requests.post("**Replace with server url**:27017/api/0.1/actors/bacon", data=body)
print r.content (Here is the result of the request)

#Example in Rails
@actor1='Robert Pattinson'
@actor2='Tom Felton'
@r = HTTParty.post("**Replace with server url**:27017/api/0.1/actors/bacon", :body=>{'actor[initial_name]'=>@actor1, 'actor[end_name]'=> @actor2})
@r.body #Here is the result of the request 

```
#### Add Actor and movies
```bash
#Post to /api/0.1/actorsandmovies

# params 
movie[name] => Movie name
movie[provider_id] => your own movie id, useful to find it later

actors => Json array with name and provider
EX: [{"provider_id":"1", "name":"na_1"}, {"provider_id":"2", "name":"na_2"}]

#Example in Python (By Augusto)
import requests
import json
actor_list = ['Kevin', 'Jack']
movie_name= 'La gran estafa 3'
actors=json.dumps([dict(name=actor) for actor in actor_list])
body = {'movie[name]': movie_name,'actors': actors}
r = requests.post("**Replace with server url**:27017/api/0.1/actorsandmovies", data=body)
print r.content (Here is the result of the request)
```



## Miscellany

- MIT license.
- Questions/comments/etc. are welcome.


[Neo4j]: http://www.neo4j.org/
[node-neo4j]: https://github.com/thingdom/node-neo4j

[coffeescript]: http://www.coffeescript.org/
