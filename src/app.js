const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const { createServer } = require('http');
const cors = require('cors');
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { Server } = require('socket.io');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy, jwtSocketStrategy, jwtSocketHeadersStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const ecoRouter = require('./routes/eco_router');
const routes = require('./routes');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const { MySocketIO } = require('./websockets/socket.io');
const { resolve } = require('path');

const app = express();
const httpServer = createServer(app);

const generateSwaggerSpec = () => {
    return swaggerJsdoc({
        definition: {
            openapi: "3.0.0",
            info: {
                title: "Dynamic API Docs",
                version: "1.0.0",
            },
        },
        apis: ["./src/routes/*.js", "./src/routes/*.js"],
    });
};
app.use("/api-docs", swaggerUi.serve, async (req, res) => {
    return res.send(swaggerUi.generateHTML(generateSwaggerSpec()));
});

// ! // // // // // SOCKET // // // // // // // 

const socketServer = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
const socket = socketServer.of('/ecogeste/');
new MySocketIO(socket);

// ! // // // // // //  SOCKET // // // // // // // 
if (config.env !== 'test') {
    app.use(morgan.successHandler);
    app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwtSocketHeaders', jwtSocketHeadersStrategy);
passport.use('jwtSocket', jwtSocketStrategy);
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
    app.use('/Auth', authLimiter);
}

// api routes
const other = ecoRouter(socket);

const topStatic = resolve('static');
app.get('/', (req, res) => {
    res.redirect('/api-docs');
}
);
app.use('/cdn', express.static(topStatic))
app.use('/api', routes);
app.use('/api/Agent', other);
// send back a 404 error for any unknown api request
/**
 * get Streets By QUID
 * @param {express.Request} req request
 * @param {express.Response} res response
 */
app.use((req, res, next) => {
    console.log(req.path + 'path Not found');
    next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = { httpServer };
