const httpStatus = require('http-status');
const pick = require('../utils/pick');
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
    const profilePicture = resolve(uploadService.pathUploads, user.guid, user.photo)
    res.status(httpStatus.OK).sendFile(profilePicture);
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
};
