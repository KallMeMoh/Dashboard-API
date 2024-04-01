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

router.get("/", (req, res) => {
  // GET /api/v1/categories
  // GET /categories: Retrieves a list of all categories.
});

router.get("/:id", (req, res) => {
  // GET /api/v1/categories/:id
  // GET /categories/:id: Retrieves a specific category by ID.
});

router.get("/:id/products", (req, res) => {
  // GET /api/v1/categories
  // GET /categories: Retrieves a list of all products in a categoy by ID.
});

// PROTECTED categories ROUTES
/*
NOTE FOR ME: 
  Remember to always check if the user data exists in your database
  before proceeding with any operations. This is to ensure that the
  user is still valid and has not been deleted from the database after
  the token was issued.
*/
router.post("/", authenticateJWT, (req, res) => {
  // POST /categories: Creates a new product (requires authentication for admin users).
});

router.put("/:id", authenticateJWT, (req, res) => {
  // PUT /categories/:id: Updates an existing product (requires authentication for admin users).
});

router.delete("/:id", authenticateJWT, (req, res) => {
  // DELETE /categories/:id: Deletes a product (requires authentication for admin users).
});

module.exports = router;
