const { existsSync, mkdirSync } = require('fs');
const { extname, resolve } = require('path');

const uuidv4 = require('uuid').v4;
const multer = require('multer');
const config = require('../config/config');

const pathUploads = resolve(config.DEPLOY_ENV == 'Docker' ? "/usr/src/employees_pointage" : 'static');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!existsSync(pathUploads)) {
            mkdirSync(pathUploads, { recursive: true });
            console.log('Folder created successfully!');
        }
        cb(null, pathUploads);
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

module.exports = { upload, pathUploads }