const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();

const corsOptions = {
  // origin: "https://"
};

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  validate: {
    xForwardedForHeader: false,
    default: true,
  },
}); // max: 100 req/5min

app.use(limiter);
app.use(express.json());
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('combined'));

const Routes = require("./Routes");

app.use("/api/v1", Routes);

module.exports = app;