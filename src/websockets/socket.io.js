const { Socket } = require("socket.io");
const logger = require("../config/logger");
const moment = require('moment');
const passport = require('passport');
const { EVENTS } = require("./socket.io-config");
const config = require("../config/config");
const { generateToken } = require("../services/token.service");
const { tokenTypes } = require("../config/tokens");
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
        }

        function handleQr() {
            const qrExpires = moment().add(config.jwt.qrExpirationSeconds, 'seconds');
            const qr_new = generateToken(msocket.user.id, qrExpires, tokenTypes.QR);
            msocket.emit(EVENTS.QR_STREAM, {
                qr: qr_new,
                generated: (new Date()).toISOString(),
                lifecyle_in_seconds: config.jwt.qrExpirationSeconds,
            });
        }
        logger.info(`NEW CLIENT CONNECTED ${msocket.id}, 
            ID: ${msocket.user.id}
            Role = ${msocket.user.role}`);
        if (msocket.user.role === 'fieldWorker') {
            handleQr();
            setInterval(() => {
                handleQr();
            }, config.jwt.qrExpirationSeconds * 1000);
        }
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