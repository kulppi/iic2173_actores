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


## Miscellany

- MIT license.
- Questions/comments/etc. are welcome.


[Neo4j]: http://www.neo4j.org/
[node-neo4j]: https://github.com/thingdom/node-neo4j

[coffeescript]: http://www.coffeescript.org/
