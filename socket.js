// fail-safe connection object for nodes that emit before ui.js initializes Socket.
// once Socket is initialized, connection is overridden.
let connection = {
    emit: () => { console.error('Socket fired mock "emit" function.'); },
    to: () => { console.error('Socket fired mock "to" function.'); },
    on: () => { console.error('Socket fired mock "on" function.'); },
    mock: true
};

class Socket {
    constructor() {
        this.io = null;
    }
    connect(server, opts) {
        this.io = require('socket.io')(server, opts);
    }

    emit(event, data) {
        this.io.emit(event, data);
    }

    to(arg) {
        return this.io.to(arg);
    }

    on(event, handler) {
        this.io.on(event, handler);
    }

    static init(server, opts, sessionMiddleware) {
        if (connection.mock) {
            connection = new Socket();
            connection.connect(server, opts, sessionMiddleware);
        }
    }

    static getConnection() {
        return connection;
    }
}

module.exports = {
    connect: Socket.init,
    connection: Socket.getConnection,
};
