const http = require('http');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const axios = require('axios');
const { logMessage } = require('./logevents');

// Replace with your actual API keys
const WEATHER_API_KEY = '0883e6ebcf410b3d04ac118152d15119';
const NEWS_API_KEY = '00ac1c840e5a4d619894c6d5df9fc36a';

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

    if (route === 'styles.css') {
        fs.readFile(path.join(__dirname, 'views', 'styles.css'), (err, data) => {
            if (err) {
                response.writeHead(404, { 'Content-Type': 'text/html' });
                response.end('<h1>404 Not Found</h1>');
                myEmitter.emit('statusCode', 404);
            } else {
                response.writeHead(200, { 'Content-Type': 'text/css' });
                response.end(data);
                myEmitter.emit('statusCode', 200);
            }
        });
    } else if (route === 'daily-info') {
        const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=St.%20John's&appid=${WEATHER_API_KEY}&units=metric`;
        const newsUrl = `https://newsapi.org/v2/top-headlines?country=ca&apiKey=${NEWS_API_KEY}`;

        Promise.all([
            axios.get(weatherUrl),
            axios.get(newsUrl)
        ]).then(([weatherResponse, newsResponse]) => {
            const weatherData = weatherResponse.data;
            const newsData = newsResponse.data.articles;

            const weatherInfo = `
                <h2>Weather Information</h2>
                <p>Location: ${weatherData.name}</p>
                <p>Temperature: ${weatherData.main.temp}°C</p>
                <p>Weather: ${weatherData.weather[0].description}</p>
            `;

            const newsInfo = `
                <h2>News Headlines</h2>
                <ul>
                    ${newsData.map(article => `<li><a href="${article.url}">${article.title}</a></li>`).join('')}
                </ul>
            `;

            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    response.writeHead(404, { 'Content-Type': 'text/html' });
                    response.end('<h1>404 Not Found</h1>');
                } else {
                    const updatedData = data.replace('{{weather}}', weatherInfo).replace('{{news}}', newsInfo);
                    response.writeHead(200, { 'Content-Type': 'text/html' });
                    response.end(updatedData);
                }
            });
            myEmitter.emit('statusCode', 200);
        }).catch(err => {
            console.error(err);
            response.writeHead(500, { 'Content-Type': 'text/html' });
            response.end('<h1>500 Internal Server Error</h1>');
            myEmitter.emit('statusCode', 500);
        });

    } else {
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
    }

    myEmitter.emit('routeAccessed', route);
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
