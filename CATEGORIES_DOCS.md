## Categories Endpoints

### GET /categories

This endpoint retrieves all categories.

**Example:**

```javascript
fetch('/categories', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
.then(response => response.json())
.then(data => console.log(data));
```

### GET /categories/:name

This endpoint retrieves a category by its name.

**Example:**

```javascript
fetch('/categories/Books', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
.then(response => response.json())
.then(data => console.log(data));
```

### GET /categories/:name/products

This endpoint retrieves all products in a category.

**Example:**

```javascript
fetch('/categories/Books/products', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
.then(response => response.json())
.then(data => console.log(data));
```

### POST /categories

This endpoint creates a new category. It requires JWT authentication.

**Example:**

```javascript
fetch('/categories', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  },
  body: JSON.stringify({
    name: 'New Category',
  }),
})
.then(response => response.json())
.then(data => console.log(data));
```

### PUT /categories/:name

This endpoint updates a category by its name. It requires JWT authentication.

**Example:**

```javascript
fetch('/categories/Books', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  },
  body: JSON.stringify({
    name: 'Updated Category',
  }),
})
.then(response => response.json())
.then(data => console.log(data));
```

### DELETE /categories/:name

This endpoint deletes a category by its name. It requires JWT authentication.

**Example:**

```javascript
fetch('/categories/Books', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  },
})
.then(response => response.json())
.then(data => console.log(data));
```