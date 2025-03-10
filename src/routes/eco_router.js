const express = require('express');
const { Socket } = require("socket.io");
const httpStatus = require('http-status');
const { existsSync, mkdirSync } = require('fs');
const { extname, join } = require('path');

const uuidv4 = require('uuid').v4;
const multer = require('multer');
const { userService } = require('../services');
const config = require('../config/config');

const pathUploads = config.DEPLOY_ENV == 'Docker' ? "/usr/src/employees_pointage" : 'static';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = pathUploads;
        const folderPath = resolve(folder);

        if (!existsSync(folderPath)) {
            mkdirSync(folderPath, { recursive: true });
            console.log('Folder created successfully!');
        }
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const router = express.Router();


/**
 * Router With Socket
 * @param {Socket} socket socket instance from app.js
 * @returns {express.Router} Express router
 */
const ecoRouterRealtime = (socket) => {

    router.post('/photo', upload.single('image'), (req, res) => {
        try {
            return res.status(200).json({
                message: 'File uploaded successfully',
                file: req.file
            });
        } catch (err) {
            return res.status(500).json({
                error: err.message
            });
        }
    });

    return router;

}
module.exports = ecoRouterRealtime;