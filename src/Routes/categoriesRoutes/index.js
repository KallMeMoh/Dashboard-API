const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../../config.js");
const router = express.Router();

const { User, Products, Category } = require("../../Database/index.js");

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res
      .status(401)
      .json({ message: "Missing or malformed authorization header" });

  const token = authHeader.split(" ")[1]; // Bearer <Token>

  jwt.verify(token, config.jwt.accessSecret, async (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    const dbUser = await User.findById(user.userId);

    if (!dbUser) {
      return res.sendStatus(401);
    }

    req.user = user;
    next();
  });
};

router.get("/", async (req, res) => {
  const categories = await Category.find({});
  res.json(categories);
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
  res.json(products);
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
