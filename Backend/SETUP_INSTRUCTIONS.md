# Teacher Clearance System Setup Instructions

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (local or remote instance)
3. **npm** or **yarn**

## Step 1: Start MongoDB

### Option A: Local MongoDB Installation
If you have MongoDB installed locally:
```bash
mongod
```

### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string
4. Update the `MONGODB_URI` in your `.env` file:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clearance-system
```

### Option C: Docker MongoDB
If you have Docker installed:
```bash
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

## Step 2: Install Dependencies

Navigate to the Backend directory and install dependencies:
```bash
cd Backend
npm install
```

## Step 3: Seed the Database

Run the seeder script to populate the database with all user accounts:
```bash
npm run seed
```

You should see output like:
```
MongoDB connected successfully.
Existing users cleared.
Mock users have been inserted.
Database seeded successfully!
MongoDB connection closed.
```

## Step 4: Start the Backend Server

```bash
npm run dev
```

You should see:
```
🚀 Teacher Clearance System Backend
🌐 Server running on port 5000
📊 Environment: development
🔗 API Health: http://localhost:5000/health
```

## Step 5: Test the API

You can test the API health endpoint:
```bash
curl http://localhost:5000/health
```

Or visit it in your browser: http://localhost:5000/health

## Step 6: Test Login

You can test login with any of the credentials from `LOGIN_CREDENTIALS.md`. For example:

### Using curl:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "staff@woldia.edu.et",
    "password": "password123"
  }'
```

### Expected Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "email": "staff@woldia.edu",
      "name": "Dr. Almaz Ayana",
      "role": "AcademicStaff",
      "department": "Computer Science",
      "contactInfo": "almaz.ayana@woldia.edu",
      "avatar": "https://randomuser.me/api/portraits/women/68.jpg"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Step 7: Start Your Frontend

In a separate terminal, navigate to your frontend directory and start it:
```bash
# Navigate back to the root project directory
cd ..
npm run dev
```

## Ready to Use!

Your Teacher Clearance System is now ready! You can:

1. **Login** with any of the seeded user credentials
2. **Create clearance requests** (as Academic Staff)
3. **Review and approve requests** (as departmental reviewers)
4. **Monitor the complete clearance workflow**

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running on port 27017
- Check your `MONGODB_URI` in the `.env` file
- For Windows users, make sure MongoDB service is started

### Port Already in Use
If port 5000 is already in use, change the `PORT` in your `.env` file:
```
PORT=5001
```

### Frontend Connection Issues
Make sure your frontend is configured to connect to the correct backend URL (http://localhost:5000).

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout user

### Clearance Management
- `POST /api/clearance/requests` - Create new clearance request
- `GET /api/clearance/requests` - Get clearance requests
- `GET /api/clearance/requests/:id` - Get specific request
- `GET /api/clearance/review` - Get requests for review (by role)
- `PUT /api/clearance/steps/:id` - Approve/reject clearance step
