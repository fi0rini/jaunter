#jaunter
module for directory traversal using an event emitter

#install
    npm i jaunter

#example
    var jaunter = require('jaunter');
    
    jaunter('.', {
        async: true,
        exts: ['.json']
    })
    .on('match', (path) => console.log("JSON File:\t", path))
    .on('non-match', (path) => console.log("Non matching path:", path));
