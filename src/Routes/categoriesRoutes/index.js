const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../../config.js');
const router = express.Router();

const { User, Product, Category } = require('../../Database/schema.js');

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

    req.user = user;
    next();
  });
};

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();

    res.status(200).send({ categories });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

router.get('/:name', async (req, res) => {
  try {
    const category = await Category.findById(req.params.name);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

router.get('/:name/products', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.name });
    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { name: _id } = req.body;
    const category = new Category({ _id });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

router.put('/:name', authenticateJWT, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.name, req.body, { new: true });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

router.delete('/:name', authenticateJWT, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.name);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

module.exports = router;
