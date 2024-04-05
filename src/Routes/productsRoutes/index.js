const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../../config.js");
const router = express.Router();

const { User, Product } = require("../../Database/index.js");

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or malformed authorization header" });
  }

  const token = authHeader.match(/Bearer (.*)/)[1];

  jwt.verify(token, config.jwt.accessSecret, async (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
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
  const products = await Product.find();

  res.status(200).send({ products });
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).send({ message: "Product not found" });
  }
  res.status(200).send(product);
});

router.post("/", authenticateJWT, async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.status(201).send(product);
});

router.put("/:id", authenticateJWT, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) {
    return res.status(404).send({ message: "Product not found" });
  }
  res.status(200).send(product);
});

router.delete("/:id", authenticateJWT, async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(404).send({ message: "Product not found" });
  }
  res.status(200).send({ message: "Product deleted" });
});

module.exports = router;
