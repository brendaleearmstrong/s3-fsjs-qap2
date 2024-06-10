const fs = require('fs');
const path = require('path');

const getLogFilePath = () => {
    const date = new Date();
    const logDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }
    return path.join(logDir, `${date.toISOString().split('T')[0]}.log`);
};

const logMessage = (message) => {
    const logFilePath = getLogFilePath();
    const logEntry = `${new Date().toISOString()} - ${message}\n`;
    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) console.error('Error writing to log file', err);
    });
};

module.exports = { logMessage };
