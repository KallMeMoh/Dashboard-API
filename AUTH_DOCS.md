## Authentication Endpoints

### POST /auth/register

This endpoint registers a new user.

**Example:**

```javascript
fetch('/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'NewUser',
    password: 'Password123!',
  }),
})
.then(response => response.json())
.then(data => console.log(data));
```

### POST /auth/login

This endpoint logs in a user and returns access and refresh tokens.

**Example:**

```javascript
fetch('/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'ExistingUser',
    password: 'Password123!',
  }),
})
.then(response => response.json())
.then(data => console.log(data));
```

### POST /auth/refresh-token

This endpoint refreshes the access token using a refresh token.

**Example:**

```javascript
fetch('/auth/refresh-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + refreshToken,
  },
})
.then(response => response.json())
.then(data => console.log(data));
```

### POST /auth/logout

This endpoint logs out a user by invalidating the access token.

**Example:**

```javascript
fetch('/auth/logout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + accessToken,
  },
})
.then(response => response.json())
.then(data => console.log(data));
```