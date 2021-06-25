const fs = require('fs');
const fsPromises = fs.promises;

module.exports = {
    getLog,
    getLogsList,
};

async function getLog(filename) {
    try {
        return await fsPromises.readFile(__dirname + '/../../audit/' + filename, 'utf-8');
    } catch (error) {
        console.log(error);
    }
}

async function getLogsList() {
    try {
        return await fsPromises.readdir(__dirname + '/../../audit');
    } catch (error) {
        console.log(error);
    }
}
