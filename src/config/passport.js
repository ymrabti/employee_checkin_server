const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
const { tokenTypes } = require('./tokens');
const { User } = require('../models');

const jwtOptions = {
    secretOrKey: config.jwt.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtSocketOptions = {
    secretOrKey: config.jwt.secret,
    jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
};

const jwtSocketHeadersOptions = {
    secretOrKey: config.jwt.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};
const qrBodyOptions = {
    secretOrKey: config.jwt.secret,
    jwtFromRequest: ExtractJwt.fromBodyField('Qr'),
};

const jwtVerify = async (payload, done) => {
    try {
        if (payload.type !== tokenTypes.ACCESS) {
            throw new Error('Invalid token type');
        }
        const user = await User.findById(payload.sub);
        if (!user) {
            return done(null, false);
        }
        done(null, user);
    } catch (error) {
        done(error, false);
    }
};

const qrVerify = async (payload, done) => {
    try {
        if (payload.type !== tokenTypes.QR) {
            throw new Error('Invalid Qr Code');
        }
        const user = await User.findById(payload.sub);
        if (!user) {
            return done(null, false);
        }
        done(null, user);
    } catch (error) {
        done(error, false);
    }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
const jwtSocketStrategy = new JwtStrategy(jwtSocketOptions, jwtVerify);
const jwtSocketHeadersStrategy = new JwtStrategy(jwtSocketHeadersOptions, jwtVerify);
const qrAuthFromBodyStrategy = new JwtStrategy(qrBodyOptions, qrVerify);

module.exports = {
    jwtStrategy,
    jwtSocketStrategy,
    jwtSocketHeadersStrategy,
    qrAuthFromBodyStrategy,
};
