const { existsSync, mkdirSync } = require('fs');
const { extname, resolve } = require('path');

const uuidv4 = require('uuid').v4;
const multer = require('multer');
const config = require('../config/config');

const pathUploads = resolve(config.DEPLOY_ENV == 'Docker' ? "/usr/src/employees_pointage" : 'static');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const destination = resolve(pathUploads, req.user.username)
        if (!existsSync(destination)) {
            mkdirSync(destination, { recursive: true });
            console.log('Folder created successfully!');
        }
        cb(null, destination);
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

module.exports = { upload, pathUploads }