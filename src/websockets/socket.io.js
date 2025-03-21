const { Socket } = require("socket.io");
const logger = require("../config/logger");
const moment = require('moment');
const { v4 } = require('uuid');
const passport = require('passport');
const { EVENTS } = require("./socket.io-config");
const config = require("../config/config");
const { generateToken } = require("../services/token.service");
const { tokenTypes } = require("../config/tokens");

class MySocketIO {
    /** */
    timer;
    socket;

    /**
     * auth for Socket.io
     * @param {Socket} socket socketto
     * @param {*} next next
     */
    async authSocket(socket, next) {
        await passport.authenticate(
            'jwtSocketHeaders',
            { session: false, failWithError: true },
            (err, user, info) => {
                if (err || !user || info) {
                    console.log({ info: Object.keys(info) });
                    console.log(info.expiredAt);
                    logger.error('Authentication error => ', err || info);
                    socket.emit(EVENTS.JWT_EXPIRED, '');
                    return;
                }

                socket.user = user;
                socket.join(user.id);
                next();
            }
        )(socket.request, {}, next);
    }

    /**
     * 
     * @param {Socket} socket 
     */
    constructor(sock) {
        this.socket = sock;
        this.socket.use(this.authSocket);
        /**
         *
         * @param {Socket} socket msocket
         */

        this.socket.on('connection', (socket) => {
            this.resetTimer(socket, config.jwt.qrExpirationSeconds);

            // logger.info(JSON.stringify(msocket.user, null, 4));
            socket.on(EVENTS.DISCONNECT, (reason) => this.disconnect(socket, reason));
            socket.on(EVENTS.CONNECT_ERROR, (err) => {
                logger.info(`CONNECT_ERROR DUE TO ${err.message}`);
            });

            logger.info(`NEW CLIENT CONNECTED ${socket.id}, 
            ID: ${socket.user.id}
            Role = ${socket.user.role}`);
        });

        /* this.socket.on('connection', (socket) => {
            this.resetTimerTest(socket, config.jwt.qrExpirationSeconds);
        }); */
    }

    /**
     *
     * @param {Socket} socket msocket
     * @param {number} newTimer msocket
     */
    resetTimerTest(socket, newTimer) {
        clearInterval(this.timer);
        socket.emit(EVENTS.QR_STREAM, v4());
        this.timer = setInterval(() => {
            socket.emit(EVENTS.QR_STREAM, v4());
        }, newTimer * 1000);
    }

    /**
     *
     * @param {Socket} socket msocket
     * @param {number} newTimer msocket
     */
    resetTimer(socket, newTimer) {
        if (`${socket.user.role}`.trim() === 'fieldWorker') {
            if (this.timer != null) clearInterval(this.timer);
            this.handleQr(socket);
            this.timer = setInterval(() => {
                this.handleQr(socket);
            }, newTimer * 1000);
        }
    }


    /**
     *
     * @param {Socket} socket msocket
     * @param {any} reason msocket
     */
    disconnect(socket, reason) {
        logger.info(`CLIENT DISCONNECTED WITH A REASON: ${reason}`);
        socket.broadcast.emit(EVENTS.USER_LEAVE, null)
    }

    /**
     *
     * @param {Socket} msocket msocket
     */
    handleQr(msocket) {
        const qrExpires = moment().add(config.jwt.qrExpirationSeconds, 'seconds');
        const qr_new = generateToken(msocket.user.id, qrExpires, tokenTypes.QR);
        msocket.emit(EVENTS.QR_STREAM, {
            qr: qr_new,
            generated: (new Date()).toISOString(),
            lifecyle_in_seconds: config.jwt.qrExpirationSeconds,
        });
    }
}

module.exports = {
    MySocketIO
}