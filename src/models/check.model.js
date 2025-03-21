const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const checkSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
        },
        qrOffer: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
        },
        snapshotAt: {
            type: Date,
            required: true,
        },
        geolocation: {
            type: {
                latitude: mongoose.SchemaTypes.Number,
                longitude: mongoose.SchemaTypes.Number
            },
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

checkSchema.plugin(toJSON);

/**
 * @typedef Check
 */
const Check = mongoose.model('Check', checkSchema);

module.exports = Check;
