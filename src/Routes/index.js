const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const productsRoutes = require('./productsRoutes');
const categoriesRoutes = require('./categoriesRoutes');

console.log({ authRoutes, productsRoutes, categoriesRoutes });

router.get('/', (req, res) => {
  res.status(200).send({ version: '^1.0.0' });
});

router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);

module.exports = router;
