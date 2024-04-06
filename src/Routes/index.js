const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const productsRoutes = require('./productsRoutes');
const categoriesRoutes = require('./categoriesRoutes');

function errorHandler(err, req, res, next) {
  console.error(err.message);
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  res.status(err.statusCode).send(err.message);
}

router.use((err, req, res, next) => {
  errorHandler(err, req, res, next);
});

router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);

router.get('/', (req, res) => {
  res.status(200).send({ version: '^1.0.0' });
});

module.exports = router;
