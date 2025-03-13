const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

const userSchema = mongoose.Schema(
    {
        guid: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Invalid email');
                }
            },
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 8,
            validate(value) {
                if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
                    throw new Error('Password must contain at least one letter and one number');
                }
            },
            private: true, // used by the toJSON plugin
        },
        role: {
            type: String,
            enum: roles,
            default: 'user',
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        isPhoneVerified: {
            type: Boolean,
            default: false,
        },
        username: {
            type: String,
            trim: true,
            unique: true,
            required: true,
        },
        photo: {
            type: String,
            trim: true,
            unique: true,
            required: true,
        },
        phoneNumber: {
            type: String,
            trim: true,
            unique: true,
            validate(value) {
                if (!validator.isMobilePhone(value)) {
                    throw new Error('Invalid Phone number');
                }
            },
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        dateOfBirth: {
            type: Date,
        },
        identityCard: {
            type: String,
        },
        userName: {
            type: String,
        },
        gender: {
            type: String,
            enum: ['male', 'female']
        },
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if phoneNumber is taken
 * @param {string} phoneNumber - The user's phoneNumber
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isPhoneTaken = async function (phoneNumber, excludeUserId) {
    if (!phoneNumber) return false
    const user = await this.findOne({ phoneNumber, _id: { $ne: excludeUserId } });
    return !!user;
};

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
    if (!email) return false
    const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
    return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
    const user = this;
    return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
