const { Socket } = require("socket.io");
const logger = require("../config/logger");
const passport = require('passport');
const { EVENTS } = require("./socket.io-config");
const users = new Map()
class MySocketIO {
    socket;
    /**
     * 
     * @param {Socket} socket 
     */
    constructor(sock) {
        this.socket = sock;
        this.socket.use(this.authSocket);
        this.socket.on('connection', this.onConnection);
    }

    /**
     * auth for Socket.io
     * @param {Socket} sockett socketto
     * @param {*} next next
     */
    async authSocket(sockett, next) {
        await passport.authenticate('jwtSocketHeaders', { session: false }, (err, user, info) => {
            if (err || !user) {
                logger.error('Authentication error => ', err || info);
                sockett.disconnect(true);
                return;
            }
            sockett.user = user;
            sockett.join(user.id);
            users.set(sockett.id, {
                id: user.id,
                name: user.name,
            });
            next();
        })(sockett.request, {}, next);
    }

    /**
     *
     * @param {Socket} msocket msocket
     */
    onConnection(msocket) {
        function disconnect(reason) {
            logger.info(`CLIENT DISCONNECTED WITH A REASON: ${reason}`);
            msocket.broadcast.emit(EVENTS.USER_LEAVE, null)
            users.delete(msocket);
        }

        logger.info(`NEW CLIENT CONNECTED ${msocket.id}, ID: ${msocket.user.id}`);
        // logger.info(JSON.stringify(msocket.user, null, 4));
        msocket.on(EVENTS.DISCONNECT, (reason) => disconnect(reason));
        msocket.on(EVENTS.CONNECT_ERROR, (err) => {
            logger.info(`CONNECT_ERROR DUE TO ${err.message}`);
        });
    }
}

module.exports = {
    MySocketIO
}