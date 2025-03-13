const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const express = require('express');
const { authService, userService, tokenService } = require('../services');
const logger = require('../config/logger');
/**
 * get Streets By QUID
 * @param {express.Request} req request
 * @param {express.Response} res response
 */
const register = async (req, res) => {
    if (!req.file) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "No file uploaded" });
    }
    const user = await userService.createUser({
        ...req.body,
        phoneNumber: req.body.phone,
    });
    const tokens = await tokenService.generateAuthTokens(user);
    res.status(httpStatus.CREATED).send({ user, tokens });
};
/**
 * get Streets By QUID
 * @param {express.Request} req request
 * @param {express.Response} res response
 */
const login = async (req, res) => {
    const { email, phoneNumber, password } = req.body;
    const user = await authService.loginUserWithEmailAndPassword(email, phoneNumber, password);
    const tokens = await tokenService.generateAuthTokens(user);
    res.send({
        user,
        tokens,
    });
};
/**
 * get Streets By QUID
 * @param {express.Request} req request
 * @param {express.Response} res response
 */
const logout = async (req, res) => {
    await authService.logout(req.body.refreshToken);
    res.status(httpStatus.NO_CONTENT).send();
};
/**
 * get Streets By QUID
 * @param {express.Request} req request
 * @param {express.Response} res response
 */
const refreshTokens = async (req, res) => {
    const tokens = await authService.refreshAuth(req.body.refreshToken);
    res.send({ ...tokens });
};
/**
 * get Streets By QUID
 * @param {express.Request} req request
 * @param {express.Response} res response
 */
const sendOTP = async (req, res) => {
    var user = userService.getUserByUsernameOrEmail(req.body.username)
    const resetPasswordToken = await tokenService.generateResetPasswordToken(user.email);
    res.status(httpStatus.NO_CONTENT).send();
};
/**
 * get Streets By QUID
 * @param {express.Request} req request
 * @param {express.Response} res response
 */
const resetPassword = async (req, res) => {
    await authService.resetPassword(req.query.token, req.body.password);
    res.status(httpStatus.NO_CONTENT).send();
};
/**
 * get Streets By QUID
 * @param {express.Request} req request
 * @param {express.Response} res response
 */
const sendVerificationEmail = async (req, res) => {
    if (!req.user.email) {
        res.status(httpStatus.BAD_REQUEST).send();
        return;
    }
    const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
    res.status(httpStatus.NO_CONTENT).send();
};
/**
 * get Streets By QUID
 * @param {express.Request} req request
 * @param {express.Response} res response
 */
const changePassword = async (req, res) => {
    const user = await userService.updateUserById(req.user.id, {
        ...req.body
    });
    res.send(user);
};
/**
 * get Streets By QUID
 * @param {express.Request} req request
 * @param {express.Response} res response
 */
const verifyEmail = async (req, res) => {
    await authService.verifyEmail(req.query.token);
    res.status(httpStatus.NO_CONTENT).send();
};

module.exports = {
    register: catchAsync(register),
    login: catchAsync(login),
    logout: catchAsync(logout),
    refreshTokens: catchAsync(refreshTokens),
    sendOTP: catchAsync(sendOTP),
    resetPassword: catchAsync(resetPassword),
    changePassword: catchAsync(changePassword),
    sendVerificationEmail: catchAsync(sendVerificationEmail),
    verifyEmail: catchAsync(verifyEmail),
};
