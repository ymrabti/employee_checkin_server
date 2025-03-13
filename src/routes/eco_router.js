const express = require('express');
const { Socket } = require("socket.io");
const { uploadService } = require('../services');
const httpStatus = require('http-status');


const router = express.Router();


/**
 * Router With Socket
 * @param {Socket} socket socket instance from app.js
 * @returns {express.Router} Express router
 */
const ecoRouterRealtime = (socket) => {

    router.post('/upload', uploadService.upload.single('picture'), (req, res) => {
        if (!req.file) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "No file uploaded" });
        }
        try {
            return res.status(httpStatus.OK).json({
                message: 'File uploaded successfully',
                file: req.file
            });
        } catch (err) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                error: err.message
            });
        }
    });

    return router;

}
module.exports = ecoRouterRealtime;