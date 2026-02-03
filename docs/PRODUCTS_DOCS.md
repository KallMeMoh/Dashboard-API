## Products Endpoints

### GET /products

This endpoint retrieves all products.

**Example:**

```javascript
fetch('/products', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
.then(response => response.json())
.then(data => console.log(data));
```

### GET /products/:id

This endpoint retrieves a product by its ID.

**Example:**

```javascript
fetch('/products/123', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
.then(response => response.json())
.then(data => console.log(data));
```

### POST /products

This endpoint creates a new product. It requires JWT authentication.

**Example:**

```javascript
fetch('/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  },
  body: JSON.stringify({
    name: 'New Product',
    price: 99.99,
    image: 'http://example.com/image.jpg',
    category: '123',
  }),
})
.then(response => response.json())
.then(data => console.log(data));
```

### PUT /products/:id

This endpoint updates a product by its ID. It requires JWT authentication.

**Example:**

```javascript
fetch('/products/123', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  },
  body: JSON.stringify({
    name: 'Updated Product',
    price: 89.99,
    image: 'http://example.com/new-image.jpg',
    category: '456',
  }),
})
.then(response => response.json())
.then(data => console.log(data));
```

### DELETE /products/:id

This endpoint deletes a product by its ID. It requires JWT authentication.

**Example:**

```javascript
fetch('/products/123', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  },
})
.then(response => response.json())
.then(data => console.log(data));
```