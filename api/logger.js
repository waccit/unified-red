/**
 * Simple logger that formats messages in Node-RED style
 */

function formatDate() {
    const d = new Date();
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${day} ${month} ${hours}:${minutes}:${seconds}`;
}

function formatMessage(msg) {
    if (msg instanceof Error) {
        return msg.toString();
    }
    if (typeof msg === 'object') {
        try {
            return JSON.stringify(msg);
        } catch (e) {
            return '[Object]';
        }
    }
    return msg.toString();
}

module.exports = {
    info: function (msg, ...args) {
        const additionalArgs = args.length > 0 ? ' ' + args.map(formatMessage).join(' ') : '';
        console.log(`${formatDate()} - [info] ${formatMessage(msg)}${additionalArgs}`);
    },
    warn: function (msg, ...args) {
        const additionalArgs = args.length > 0 ? ' ' + args.map(formatMessage).join(' ') : '';
        console.warn(`${formatDate()} - [warn] ${formatMessage(msg)}${additionalArgs}`);
    },
    error: function (msg, ...args) {
        const additionalArgs = args.length > 0 ? ' ' + args.map(formatMessage).join(' ') : '';
        console.error(`${formatDate()} - [error] ${formatMessage(msg)}${additionalArgs}`);
    },
    debug: function (msg, ...args) {
        const additionalArgs = args.length > 0 ? ' ' + args.map(formatMessage).join(' ') : '';
        console.log(`${formatDate()} - [debug] ${formatMessage(msg)}${additionalArgs}`);
    },
    trace: function (msg, ...args) {
        const additionalArgs = args.length > 0 ? ' ' + args.map(formatMessage).join(' ') : '';
        console.log(`${formatDate()} - [trace] ${formatMessage(msg)}${additionalArgs}`);
    },
};
