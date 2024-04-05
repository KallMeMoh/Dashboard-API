const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../../config.js");
const router = express.Router();

const { User, Product, Category } = require("../../Database/index.js");

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or malformed authorization header" });
  }

  const token = authHeader.match(/Bearer (.*)/)[1];

  if (!token) {
    return res.status(401).json({ message: "Missing token in authorization header" });
  }

  jwt.verify(token, config.jwt.accessSecret, async (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const dbUser = await User.findById(user.userId);

    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  });
};

router.get("/", async (req, res) => {
  const categories = await Category.find();

  res.status(200).send({ categories });
});

router.get("/:name", async (req, res) => {
  const category = await Category.findById(req.params.name);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.json(category);
});

router.get("/:name/products", async (req, res) => {
  const products = await Product.find({ category: req.params.name });
  res.json({ products });
});

router.post("/", authenticateJWT, async (req, res) => {
  const { name: _id } = req.body;
  const category = new Category({ _id });
  await category.save();
  res.status(201).json(category);
});

router.put("/:name", authenticateJWT, async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.name, req.body, { new: true });
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.json(category);
});

router.delete("/:name", authenticateJWT, async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.name);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.json({ message: "Category deleted" });
});

module.exports = router;
