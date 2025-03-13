const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createUser = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
        password: Joi.string().required().custom(password),
        name: Joi.string().required(),
        role: Joi.string().required().valid('user', 'admin'),
    }),
};

const getUsers = {
    query: Joi.object().keys({
        name: Joi.string(),
        role: Joi.string(),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const getUserPhoto = {
    params: Joi.object().keys({
        username: Joi.string().required(objectId),
    }),
};

const getUser = {
    params: Joi.object().keys({
        userId: Joi.string().custom(objectId),
    }),
};

const updateUser = {
    body: Joi.object()
        .keys({
            id: Joi.string().required(),
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            email: Joi.string().email().allow(null),
            gender: Joi.string().allow(null).valid('male', 'female'),
            dateOfBirth: Joi.date().allow(null).iso(),
            identityCard: Joi.string().allow(null),
        })
        .min(1),
};

const deleteUser = {
    params: Joi.object().keys({
        userId: Joi.string().custom(objectId),
    }),
};

module.exports = {
    createUser,
    getUsers,
    getUser,
    getUserPhoto,
    updateUser,
    deleteUser,
};
