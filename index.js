var ui = null;

function init(RED) {
    if (!ui) {
        ui = require('./ui')(RED);
    }
}
