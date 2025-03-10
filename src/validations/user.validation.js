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
            totalPoints: Joi.string().allow(null),
            email: Joi.string().email().allow(null),
            gender: Joi.string().allow(null).valid('male', 'female'),
            dateOfBirth: Joi.date().allow(null).iso(),
            address: Joi.object().keys({
                Type: Joi.string().allow(null),
                commune: Joi.string().allow(null),
                quartier: Joi.string().allow(null),
                streetName: Joi.string().allow(null),
                houseNumber: Joi.string().allow(null)
            }).allow(null),
            identityCard: Joi.string().allow(null),
            scholar: Joi.string().allow(null),
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
    updateUser,
    deleteUser,
};
