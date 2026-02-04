const mongoose = require('mongoose');
const { mongooseURI } = require('../config.js');

const connectDB = async () => {
  try {
    await mongoose.connect(mongooseURI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error({ err });
    process.exit(1);
  }
};

module.exports = connectDB;
