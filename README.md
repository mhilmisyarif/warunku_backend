# Warunku - Backend API

This is the backend API for the Warunku application, designed to manage products, customers, and customer debts for a small store or "warung".

## Description

The backend is built with Node.js and Express.js, using MongoDB as its database with Mongoose ODM. It provides RESTful API endpoints for the Flutter frontend to interact with, enabling functionalities such as:

- Product management (CRUD operations, image uploads)
- Customer management (CRUD operations)
- Customer debt tracking (creating new debts itemized by products, viewing debts, managing payments)

The application is structured for clarity and maintainability, with separate modules for routes, controllers, models, middleware, and configuration. It also includes support for running within a Docker environment for consistent development and deployment.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18.x or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js) or [Yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/try/download/community) (if running locally without Docker)
- [Docker](https://www.docker.com/products/docker-desktop/) and [Docker Compose](https://docs.docker.com/compose/install/) (if you prefer to run the backend and database in containers)

## Getting Started

### 1. Clone the Repository (if applicable)

If this were a remote repository, you'd clone it. For your local setup, ensure you are in the backend project's root directory.

### 2. Install Dependencies

Navigate to the backend project directory in your terminal and run:

```bash
npm install
```

or if you use Yarn:

```bash
yarn install
```

### 3. Environment Variables

Create a .env file in the root of the backend project. Copy the contents of .env.example (if you have one) or use the following template:

```env
NODE_ENV=development
PORT=3000

# For local MongoDB instance
MONGO_URL=mongodb://localhost:27017/inventory

# If using Docker Compose, MONGO_URL is typically set in docker-compose.yml
# and might look like: MONGO_URL=mongodb://mongo:27017/inventory
```

Replace mongodb://localhost:27017/inventory with your actual MongoDB connection string if it's different or if you're using a cloud-hosted MongoDB instance.

## Running the Application

You can run the application either directly using Node.js or with Docker Compose.

### Locally with Node.js

- Development Mode (with nodemon for auto-restarts):

```bash
npm run dev
```

- Production Mode:

```bash
npm start
```

The server will typically start on `http://localhost:3000` (or the port specified in your .env file).

### With Docker Compose

This method will start both the Node.js backend service and a MongoDB service.

1. Ensure Docker Desktop is running.

2. From the root of the backend project directory (where `docker-compose.yml` is located), run:

```bash
docker-compose up --build
```

Add the `-d` flag to run in detached mode:

```bash
docker-compose up --build -d
```

The backend service will be accessible at `http://localhost:3000`. The MongoDB service will be accessible on port `27017` (as mapped in `docker-compose.yml`).

To stop the Docker services:

```bash
docker-compose down
```

## Seeding the Database

A script is provided to populate the database with initial sample data for products, customers, and debt records.

1. Ensure your MongoDB instance (local or Dockerized) is running and accessible.
2. Update the `MONGO_URL` in your `.env` file if necessary.
3. Run the seeder script from the backend project's root directory

```bash
node seed.js
```

Or, if you have a script defined in `package.json`:

```bash
npm run seed
```

Caution: The seed script will typically delete existing data in the `products`, `customers`, and `debtrecords` collections before inserting new sample data.

## API Endpoints

All API endpoints are prefixed with `/api`.

### Products (`/api/products`)

- `GET /`: Get all products. Supports search via `?search=<term>`. Supports pagination via `?page=<num>&limit=<num>`.
- `POST /`: Create a new product.
- `GET /:id`: Get a singe product by ID.
- `PUT /:id`: Update an existing product by ID.
- `DELETE /:id`: Delete a product by ID.
- `POST /upload`: Upload an image for a product. Expects a `multipart/form-data` request with an `image` field. Returns `{ "imagePath": "/uploads/filename.ext" }`.

### Customers (`/api/customers`)

- `GET /`: Get all customers. Supports search via `?search=<term>`. Supports pagination via `?page=<num>&limit=<num>`.
- `POST /`: Create a new customer.
- `GET /:id`: Get a single customer by ID.
- `PUT /:id`: Update an existing customer by ID.
- `DELETE /:id`: Delete a customer by ID. (Note: Deletion might be restricted if the customer has outstanding debts).
- `GET /:customerId/debts`: Get all debt records for a specific customer. Supports pagination.

### Debt Records (`/api/debts`)

- `POST /`: Create a new debt record. Requires `customer` (ID), and an `items` array.
  - Each item in `items` should include `product` (ID), `productName`, `unitLabel`, `quantity`, and `priceAtTimeOfDebt`.
- `GET /`: Get all debt records. Supports filtering via query parameters:
  - `customerId`
  - `status=<UNPAID|PARTIALLY_PAID|PAID>`
  - `startDate=<YYYY-MM-DD>`
  - `endDate=<YYYY-MM-DD>`
  - Supports pagination via `?page=<num>&limit=<num>`.
- `GET /:id`: Get a single debt record by ID.
- `PUT /:id`: Update an existing debt record by ID. (e.g., to record a payment, change status, update notes).

### Static Files

- `GET /uploads/:filename`: Access uploaded images.

## Project Structure

```plaintext
.
├── config/               # Database connection, etc.
│   └── db.js
├── controllers/          # Route handler logic
│   ├── productController.js
│   ├── customerController.js
│   └── debtController.js
├── middleware/           # Custom middleware
│   ├── errorHandler.js
│   ├── multerConfig.js
│   └── validators/       # Input validation rules
│       ├── productValidator.js
│       ├── customerValidator.js
│       └── debtValidator.js
├── models/               # Mongoose schemas and models
│   ├── Product.js
│   ├── Customer.js
│   └── DebtRecord.js
├── routes/               # API route definitions
│   ├── productRoutes.js
│   ├── customerRoutes.js
│   └── debtRoutes.js
├── uploads/              # Directory for uploaded images (ensure this exists, .gitignored by default)
├── .env                  # Environment variables (ignored by Git)
├── .gitignore            # Specifies intentionally untracked files that Git should ignore
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile            # Docker configuration for the backend service
├── package.json          # Project metadata and dependencies
├── package-lock.json     # Records exact versions of dependencies
├── README.md             # This file
├── seed.js               # Database seeder script
└── server.js             # Main application entry point
```

## Technologies Used

- **Node.js**: JavaScript runtime for building the backend.
- **Express.js**: Web framework for Node.js, used to build the RESTful API.
- **MongoDB**: NoSQL database for storing data.
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB and Node.js.
- **Multer**: Middleware for handling `multipart/form-data`, used for file uploads.
- **Helmet**: Middleware for securing Express apps by setting various HTTP headers.
- **Morgan**: Middleware for logging HTTP requests.
- **express-validator**: Middleware for validating and sanitizing request data.
- **dotenv**: Module to load environment variables from a `.env` file.
- **Docker & Docker Compose**: For containerization and orchestration of the application and database.

## Furether Improvements & TODOs

- Implement authentication and authorization (e.g., using JWT).
- Enhance error handling and logging for production environments.
- Add comprehensive unit and integration tests.
- Implement password reset functionality (if user accounts are added).
- Consider more advanced reporting features.
- Implement soft deletes for sensitive data like customers or debt records instead of hard deletes.
