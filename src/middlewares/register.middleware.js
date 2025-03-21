const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const uuidv4 = require('uuid').v4;
const { rename } = require('fs');
const { IncomingForm } = require('formidable');
const { Request, Response, NextFunction } = require('express');
const { resolve, join } = require('path');
const { uploadService } = require('../services');
const { existsSync, mkdirSync } = require('fs');
const { authValidation } = require('../validations');
const { makeIfNorExists } = require('../services/upload.service');

/**
 * 
 * @param {Request} req request
 * @param {Response} res response
 * @param {NextFunction} next next
 * @returns 
 */
async function registerMiddleware(req, res, next) {
    const uploadDirectory = resolve(uploadService.pathUploads, '_temp_');
    makeIfNorExists(uploadDirectory)

    let fileName;
    const form = new IncomingForm({
        uploadDir: uploadDirectory,
        keepExtensions: true,
        multiples: true,
        filename: (name, extension) => {
            const fn = `${uuidv4()}${extension}`;
            fileName = fn;
            return fn;
        }
    });

    const validSchema = pick(authValidation.register, ['params', 'query', 'body', 'files']);

    try {
        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve([fields, files]);
            });
        });

        // Merge parsed fields with req.body
        const ffields = {}
        for (const key in fields) {
            if (Object.prototype.hasOwnProperty.call(fields, key)) {
                ffields[key] = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
            }
        }

        req.body = { ...req.body, ...ffields, photo: fileName };

        const object = {
            ...pick(req, Object.keys(validSchema))
        };

        const { value, error } = Joi.compile(validSchema)
            .prefs({ errors: { label: 'key' }, abortEarly: false })
            .validate(object);

        if (error) {
            const errorMessage = error.details.map((details) => details.message).join(', ');
            return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
        }

        const tmpPath = join(uploadDirectory, fileName);
        const newPath = resolve(uploadService.pathUploads, req.body.username, fileName);
        makeIfNorExists(newPath)
        rename(
            tmpPath,
            newPath, (err) => {
                if (err) {
                    console.error('Error moving file:', err);
                } else {
                    console.log('File moved successfully!');
                }
            });
        Object.assign(req, value);
        req.file = files
        return next();
    } catch (err) {
        console.log(err);
        return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error processing form data'));
    }
};
module.exports = registerMiddleware