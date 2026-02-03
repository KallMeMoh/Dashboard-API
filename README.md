# E-commerce Dashboard API

A RESTful API for managing an online store's products and categories, with secure authentication and admin dashboard functionality.

## Features

- Complete CRUD operations for products and categories
- Admin dashboard endpoints for store management
- Public endpoints for displaying products on storefront
- JWT authentication with access and refresh tokens
- Secure API with token rotation

## Tech Stack

- Node.js
- Express
- MongoDB
- Helmet
- Bcrypt
- Express-Validator
- JWT (authentication)

## API Endpoints

### Authentication

- User registration and login
- Token refresh mechanism
- Secure session management

### Products

- Create, read, update, delete products
- Filter and search products
- Category-based product listing

### Categories

- Manage product categories
- Hierarchical category structure

## Documentation

All endpoints are documented with request/response examples. See the `/docs` folder for detailed API documentation.

## Security

- JWT access tokens with short expiration
- Refresh token rotation for extended sessions
- Protected admin routes
- Input validation and sanitization

---

**Note:** This API was built for a client's e-commerce store and includes full documentation for all endpoints.
