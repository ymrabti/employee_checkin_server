const httpStatus = require('http-status');
const pick = require('../utils/pick');
const fs = require('fs');
const express = require('express');
const { resolve } = require('path');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, uploadService } = require('../services');
/**
 * get Streets By QUID
 * @param {express.Request} req request
 * @param {express.Response} res response
 */
const createUser = (async (req, res) => {
    const user = await userService.createUser(req.body);
    res.status(httpStatus.CREATED).send(user);
});
/**
 * get Streets By QUID
 * @param {express.Request} req request
 * @param {express.Response} res response
 */
const getUsers = (async (req, res) => {
    const filter = pick(req.query, ['name', 'role']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await userService.queryUsers(filter, options);
    res.send(result);
});

/**
 * Check User
 * @param {express.Request} req Request
 * @param {express.Response} res Response
 */
async function checkUser(req, res) {
    const user = await userService.getUserByUsernameOrEmail(req.query.username, req.query.email);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    res.sendStatus(httpStatus.OK).end();
}
/**
 * Check User
 * @param {express.Request} req Request
 * @param {express.Response} res Response
 */
async function getUserPhoto(req, res) {
    const user = await userService.getUserByUsernameOrEmail(req.params.username);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    const profilePicture = resolve(uploadService.pathUploads, user.username, user.photo)
    const filename = user.photo;
    const fileSize = fs.statSync(profilePicture).size;
    res.setHeader("content-disposition", `inline; filename="${filename}"; size=${fileSize}`);
    res.setHeader("Content-Length", fileSize);
    res.status(httpStatus.OK).sendFile(profilePicture);
}
/**
 * Check User
 * @param {express.Request} req Request
 * @param {express.Response} res Response
 */
async function updateProfilePicture(req, res) {
    const username = req.params.username;
    const user = await userService.getUserByUsernameOrEmail(username);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (user.username !== username) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Unauthorized');
    }

    await userService.updateUserById(user.id, { photo: req.file.filename })

    if (!req.file) {
        res.status(httpStatus.BAD_REQUEST).json({ message: "No file uploaded" });
    }
    try {
        res.status(httpStatus.OK).json({
            message: 'File uploaded successfully',
            file: req.file
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            error: err.message
        });
    }
}

/**
 * get Streets By QUID
 * @param {express.Request} req request
 * @param {express.Response} res response
 */
const getUser = (async (req, res) => {
    const user = await userService.getUserByUsernameOrEmail(req.query.username, req.query.email);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    res.send(user);
});

/**
 * get Streets By QUID
 * @param {express.Request} req request
 * @param {express.Response} res response
 */
const updateUser = (async (req, res) => {
    const user = await userService.updateUserById(req.body.id, req.body);
    res.send(user);
});

/**
 * get Streets By QUID
 * @param {express.Request} req request
 * @param {express.Response} res response
 */
const deleteUser = (async (req, res) => {
    await userService.deleteUserById(req.params.userId);
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    createUser: catchAsync(createUser),
    getUsers: catchAsync(getUsers),
    getUser: catchAsync(getUser),
    checkUser: catchAsync(checkUser),
    updateUser: catchAsync(updateUser),
    deleteUser: catchAsync(deleteUser),
    getUserPhoto: catchAsync(getUserPhoto),
    updateProfilePicture: catchAsync(updateProfilePicture),
};
