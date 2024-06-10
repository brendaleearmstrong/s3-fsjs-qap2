const fs = require('fs');
const path = require('path');

// Function to get the log file path for the current date
function getLogFilePath() {
    const date = new Date();
    const logDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }
    return path.join(logDir, `${date.toISOString().split('T')[0]}.log`);
}

// Function to log a message to the log file
function logMessage(message) {
    const logFilePath = getLogFilePath();
    fs.appendFile(logFilePath, `${new Date().toISOString()} - ${message}\n`, (err) => {
        if (err) console.error('Error writing to log file', err);
    });
}

module.exports = { logMessage };