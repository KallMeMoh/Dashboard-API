const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../../config.js");
const router = express.Router();

const { User, Product } = require("../../Database/index.js");

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
  const products = await Product.find();

  res.status(200).send({ products: products });
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).send({ message: "Product not found" });
  }
  res.status(200).send({ product });
});

// PROTECTED PRODUCTS ROUTES
/*
NOTE FOR ME: 
  Remember to always check if the user data exists in your database
  before proceeding with any operations. This is to ensure that the
  user is still valid and has not been deleted from the database after
  the token was issued.
*/
router.post("/", authenticateJWT, async (req, res) => {
  const newProduct = new Product(req.body);
  const savedProduct = await newProduct.save();
  res.status(201).send({ product: savedProduct });
});

router.put("/:id", authenticateJWT, async (req, res) => {
  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updatedProduct) {
    return res.status(404).send({ message: "Product not found" });
  }
  res.status(200).send({ product: updatedProduct });
});

router.delete("/:id", authenticateJWT, async (req, res) => {
  const deletedProduct = await Product.findByIdAndDelete(req.params.id);
  if (!deletedProduct) {
    return res.status(404).send({ message: "Product not found" });
  }
  res.status(200).send({ message: "Product deleted" });
});

module.exports = router;
