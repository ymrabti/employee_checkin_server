const express = require('express');
const { Socket } = require("socket.io");
const { uploadService } = require('../services');
const httpStatus = require('http-status');
const authQr = require('../middlewares/qr');
const { EVENTS } = require('../websockets/socket.io-config');
const auth = require('../middlewares/auth');
const { MySocketIO } = require('../websockets/socket.io');


const router = express.Router();


/**
 * Router With Socket
 * @param {Socket} socket socket instance from app.js
 * @param {MySocketIO} chatObject router
 * @returns {express.Router} Express router
 */
const ecoRouterRealtime = (socket, chatObject) => {

    router.post('/reset', auth(), (req, res) => {
        chatObject.resetTimer(socket, req.body.timer_in_seconds);
        res.status(httpStatus.OK).json()
    });

    router.post('/scan', auth(), authQr(), (req, res) => {
        socket.to(req.userOfferedQr.id).emit(EVENTS.QR_SCANNE, req.user);
        res.status(httpStatus.OK).json(req.userOfferedQr)
    });


    return router;

}
module.exports = ecoRouterRealtime;