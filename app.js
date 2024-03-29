const globalErrorHandler = require("./middleware/globalErrorHandler");
const ExpressMongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const connectDB = require("./util/connectDB");
const AppError = require("./util/appError");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const xss = require("xss-clean");
const cors = require("cors");
const http = require("http");
const hpp = require("hpp");
const device = require("express-device");
const apiFeature = require("./middleware/api.feature");
const { stream } = require("./lib/winston");

const socketServer = require("./socket/socketServer");

const app = express();
const server = http.createServer(app);
socketServer.registerSocketServer(server);

// connect to the database
connectDB();

app.use(device.capture());
// socket.io connection

// Set security HTTP headers
app.use(helmet());
app.use(cors());

// Use Morgan middleware with the custom stream
app.use(morgan("combined", { stream }));

// Limit requests from the same IP
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again in an hour!",
});

// app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json());

// data sanitization against NoSQL query injection
app.use(ExpressMongoSanitize());

// data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
const whitelist = ["price", "rate", "location", "distance", "duration"];

app.use(hpp({ whitelist }));

// use routes
app.use("/api/v1", apiFeature, require("./routers"));

// Get Image
app.use("/upload", express.static(__dirname + "/upload/"));

app.get("/", (req, res) => {
    const link = process.env.API_DOC_URL;
    // redirect to documentation
    res.redirect(link);
});

// unhandled routes
app.all("*", (req, res, next) =>
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
);

// global error handler
app.use(globalErrorHandler);

module.exports = server;
