const Joi = require('joi');

const sendOTP = {
    body: Joi.object().keys({
        phoneNumber: Joi.string().required(),
    }),
};

const verifyOTP = {
    body: Joi.object().keys({
        phoneNumber: Joi.string().required(),
        otp: Joi.string().required(),
    }),
};

module.exports = {
    sendOTP,
    verifyOTP,
};
