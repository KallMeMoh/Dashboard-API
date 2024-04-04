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
  // GET /products: Retrieves a list of all products.
});

router.get("/:id", (req, res) => {
  // GET /api/v1/products/:id
  // GET /products/:id: Retrieves a specific product by ID.
});

// PROTECTED PRODUCTS ROUTES
/*
NOTE FOR ME: 
  Remember to always check if the user data exists in your database
  before proceeding with any operations. This is to ensure that the
  user is still valid and has not been deleted from the database after
  the token was issued.
*/
router.post("/", authenticateJWT, (req, res) => {
  // POST /products: Creates a new product (requires authentication for admin users).
});

router.put("/:id", authenticateJWT, (req, res) => {
  // PUT /products/:id: Updates an existing product (requires authentication for admin users).
});

router.delete("/:id", authenticateJWT, (req, res) => {
  // DELETE /products/:id: Deletes a product (requires authentication for admin users).
});

module.exports = router;
