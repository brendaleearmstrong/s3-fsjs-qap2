const http = require('http');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const { logMessage } = require('./logger');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

myEmitter.on('routeAccessed', (route) => {
    const message = `Route accessed: ${route}`;
    console.log(message);
    logMessage(message);
});

myEmitter.on('statusCode', (code) => {
    const message = `Status code: ${code}`;
    console.log(message);
    logMessage(message);
});

const server = http.createServer((request, response) => {
    const route = request.url === '/' ? 'index' : request.url.slice(1);
    const filePath = path.join(__dirname, 'views', `${route}.html`);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            response.writeHead(404, { 'Content-Type': 'text/html' });
            fs.readFile(path.join(__dirname, 'views', '404.html'), (error, notFoundData) => {
                if (error) {
                    response.end('<h1>404 Not Found</h1>');
                } else {
                    response.end(notFoundData);
                }
            });
            myEmitter.emit('statusCode', 404);
        } else {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(data);
            myEmitter.emit('statusCode', 200);
        }
    });

    myEmitter.emit('routeAccessed', route);
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});