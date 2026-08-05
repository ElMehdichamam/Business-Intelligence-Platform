# auth-service

Authentication and user-management microservice for the Business Intelligence
Platform. Handles registration, login (JWT), and admin user management on top
of the shared `business_intelligence` MySQL database.

## Stack

- Node.js + Express
- MySQL via `mysql2/promise` (no ORM)
- `bcrypt` for password hashing
- `jsonwebtoken` for stateless auth
- Response shape: `{ success, message, data }` on success, `{ success, message, errors }` on failure — consistent with the other microservices in the platform.

## Setup

```bash
cd auth-service
npm install
```

Create the `users` table (or run `schema.sql` against your `business_intelligence` database):

```bash
mysql -u root -p business_intelligence < schema.sql
```

Copy `.env` and fill in real values:

```
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=business_intelligence

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
```

Run it:

```bash
npm run dev     # nodemon, auto-restart
npm start        # plain node
```

## Endpoints

| Method | Route             | Access        | Description                        |
|--------|--------------------|---------------|-------------------------------------|
| POST   | `/auth/register`   | Public        | Create a new user                   |
| POST   | `/auth/login`      | Public        | Authenticate, returns a JWT         |
| GET    | `/auth/profile`    | Authenticated | Returns the logged-in user's data   |
| GET    | `/auth/users`      | Admin only    | List all users                      |
| PUT    | `/auth/users/:id`  | Admin only    | Update a user's username/email/role |
| DELETE | `/auth/users/:id`  | Admin only    | Delete a user                       |

Send the JWT on protected routes as:

```
Authorization: Bearer <token>
```

### POST /auth/register

```json
{
  "username": "mehdi",
  "email": "mehdi@example.com",
  "password": "supersecret1",
  "role": "employee"
}
```

`role` is optional and defaults to `employee`. Valid values: `admin`, `analyst`, `employee`.

### POST /auth/login

```json
{
  "email": "mehdi@example.com",
  "password": "supersecret1"
}
```

Returns `{ data: { token, user } }` on success.

### PUT /auth/users/:id

Accepts any subset of `{ username, email, role }`.

## Notes

- Passwords are hashed with bcrypt (10 salt rounds) before being stored; the hash is never returned in any response.
- `authMiddleware` verifies the JWT and attaches the decoded payload to `req.user`.
- `roleMiddleware('admin')` (or more roles, comma-separated) runs after `authMiddleware` and checks `req.user.role`.
- An admin cannot delete their own account through `DELETE /auth/users/:id` (guards against accidental lockout).
