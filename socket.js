let connection = null;

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
        if (!connection) {
            connection = new Socket();
            connection.connect(server, opts, sessionMiddleware);
        }
    }

    static getConnection() {
        if (!connection) {
            throw new Error('no active connection');
        }
        return connection;
    }
}

module.exports = {
    connect: Socket.init,
    connection: Socket.getConnection,
};
