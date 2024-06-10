const http = require('http');
const routes = require('./routes');
const { logEvent } = require('./logevents');

const server = http.createServer((req, res) => {
    routes.handleRequest(req, res);
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
