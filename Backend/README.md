# Teacher Clearance System - Backend API

This is the backend API for the Teacher Clearance System, built with Node.js, Express, and MongoDB. It provides a complete system for managing teacher clearance requests and departmental approvals.

## Features

* **Express Server:** Fast and minimalist web framework for Node.js.
* **MongoDB Integration:** Uses Mongoose for object data modeling (ODM).
* **RESTful API:** Clean and predictable API design for clearance management.
* **JWT Authentication:** Secure authentication system with role-based access.
* **Clearance Management:** Complete workflow for teacher clearance requests.
* **Departmental Reviews:** Support for 27 different department approval steps.
* **Role-based Authorization:** Different access levels for staff, reviewers, and admins.
* **Security:** Helmet, CORS, and other security middleware included.

## Folder Structure

```
/Backend
  ├── config/              # Configuration files
  │   ├── database.js      # MongoDB connection setup
  │   └── jwt.js           # JWT utilities
  ├── controllers/         # Request handlers
  │   ├── authController.js    # Authentication logic
  │   └── clearanceController.js # Clearance request logic
  ├── middleware/          # Express middleware
  │   ├── auth.js         # JWT authentication & authorization
  │   ├── errorHandler.js # Error handling
  │   └── notFound.js     # 404 handler
  ├── models/             # MongoDB schemas
  │   ├── User.js         # User model with all roles
  │   ├── ClearanceRequest.js # Clearance request model
  │   └── ClearanceStep.js    # Department approval steps
  ├── routes/             # API endpoints
  │   ├── authRoutes.js   # Authentication routes
  │   └── clearanceRoutes.js # Clearance management routes
  ├── utils/              # Utility functions
  │   ├── AppError.js     # Custom error class
  │   ├── asyncHandler.js # Async error handler
  │   └── helpers.js      # Common utilities
  ├── .env.example        # Environment variables template
  ├── .gitignore          # Git ignore rules
  ├── package.json        # Dependencies and scripts
  ├── README.md           # Documentation
  └── server.js           # Main application entry point
```

## Getting Started

### Prerequisites

* Node.js (v14 or higher)
* MongoDB (local or remote instance)
* npm or yarn

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <your-repo-url>
    cd Backend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Create an `.env` file:**

    Copy the contents of `.env.example` to a new file named `.env`.

    ```bash
    cp .env.example .env
    ```

4.  **Configure your environment variables in `.env`:**

    *   `PORT`: The port your server will run on (e.g., 5000).
    *   `MONGODB_URI`: Your MongoDB connection string.
    *   `JWT_SECRET`: A secret key for signing JWT tokens.
    *   `FRONTEND_URL`: The URL of your frontend application (for CORS).

### Running the Application

*   **Development mode (with auto-reloading):**

    ```bash
    npm run dev
    ```

*   **Production mode:**

    ```bash
    npm start
    ```

*   **Running tests:**

    ```bash
    npm test
    ```

    To run tests in watch mode:

    ```bash
    npm run test:watch
    ```

## API Endpoints

### Authentication

*   `POST /api/auth/register` - Register a new user.
*   `POST /api/auth/login` - Login a user.
*   `GET /api/auth/me` - Get the current user's profile (requires auth).
*   `POST /api/auth/logout` - Logout the current user (requires auth).

### Clearance Requests

*   `POST /api/clearance/requests` - Create a new clearance request.
*   `GET /api/clearance/requests` - Get all clearance requests.
*   `GET /api/clearance/requests/:id` - Get a clearance request by ID.

### Clearance Reviews

*   `GET /api/clearance/review` - Get clearance steps for review.
*   `PUT /api/clearance/steps/:id` - Approve or reject a clearance step.

## Built With

*   [Node.js](https://nodejs.org/) - JavaScript runtime
*   [Express](https://expressjs.com/) - Web framework
*   [MongoDB](https://www.mongodb.com/) - NoSQL database
*   [Mongoose](https://mongoosejs.com/) - ODM for MongoDB
*   [JWT](https://jwt.io/) - JSON Web Tokens for authentication


