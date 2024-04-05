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

  // Extract the token using a regular expression
  const token = authHeader.match(/Bearer (.*)/)[1];

  jwt.verify(token, config.jwt.accessSecret, async (err, user) => {
    if (err) {
      // Provide a more specific error message
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    const dbUser = await User.findById(user.userId);

    if (!dbUser) {
      // Send a 404 status if the user is not found
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

router.get("/:id", async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.json(category);
});

router.get("/:id/products", async (req, res) => {
  const products = await Product.find({ category: req.params.id });
  res.json({ products });
});

router.post("/", authenticateJWT, async (req, res) => {
  const category = new Category(req.body);
  await category.save();
  res.status(201).json(category);
});

router.put("/:id", authenticateJWT, async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.json(category);
});

router.delete("/:id", authenticateJWT, async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.json({ message: "Category deleted" });
});

module.exports = router;
