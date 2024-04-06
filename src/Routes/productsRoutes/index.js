const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../../config.js');
const router = express.Router();

const { User, Product, Token } = require('../../Database/schema.js');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or malformed authorization header' });
  }

  const token = authHeader.match(/Bearer (.*)/)[1];

  if (!token) {
    return res.status(401).json({ message: 'Missing token in authorization header' });
  }

  jwt.verify(token, config.jwt.accessSecret, async (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const dbUser = await User.findById(user.userId);
    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const dbToken = await Token.findOne(user.userId);
    if (!dbToken) {
      return res.status(404).json({ message: 'Expired Token' });
    }

    req.user = user;
    next();
  });
};

router.get('/', async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).send({ products });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }
    res.status(200).send(product);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

router.post('/', authenticateJWT, async (req, res) => {
  const { name, price, image, category } = req.body;

  try {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).send({ message: 'Category not found' });
    }

    const product = new Product({ name, price, image, category });
    await product.save();

    res.status(201).send(product);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

router.put('/:id', authenticateJWT, async (req, res) => {
  const { name, price, image, category } = req.body;

  try {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).send({ message: 'Category not found' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        price, 
        image, 
        category 
      },{ 
        new: true
      }
    );
    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }
    res.status(200).send(product);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }
    res.status(200).send({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

module.exports = router;
