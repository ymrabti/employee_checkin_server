const Joi = require('joi');

const getAddress = {
    query: Joi.object().keys({
        lat: Joi.number().required(),
        lng: Joi.number().required(),
    }),
};

const getStreetsByQuid = {
    params: Joi.object().keys({
        quid: Joi.string().required(),
    }),
};

module.exports = {
    getAddress,
    getStreetsByQuid,
};
