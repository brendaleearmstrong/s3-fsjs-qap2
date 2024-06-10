const fs = require('fs');
const path = require('path');
const { logEvent } = require('./logevents');

const handleRequest = (req, res) => {
    const route = req.url === '/' ? 'index' : req.url.slice(1);
    const filePath = path.join(__dirname, 'views', `${route}.html`);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            logEvent('404 Not Found', req.url, 'File not found');
            res.writeHead(404, { 'Content-Type': 'text/html' });
            fs.readFile(path.join(__dirname, 'views', '404.html'), (error, notFoundData) => {
                res.end(notFoundData);
            });
        } else {
            logEvent('200 OK', req.url, 'File served successfully');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        }
    });
};

module.exports = { handleRequest };

