# Quick Setup Guide

## Step 1: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## Step 2: Set up Environment Variables

Create a `.env` file in the root directory:

```
MONGODB_URI=mongodb://localhost:27017/expense-tracker
PORT=5000
GOOGLE_CREDENTIALS_PATH=./backend/config/credentials.json
```

## Step 3: Start MongoDB

Make sure MongoDB is running on your system. You can:
- Use MongoDB Compass to connect to `mongodb://localhost:27017`
- Or use MongoDB Atlas (cloud) and update the connection string in `.env`

## Step 4: Run the Application

**Option 1: Run separately (recommended for development)**

Terminal 1 (Backend):
```bash
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run client
```

**Option 2: Run together**
```bash
npm run dev-all
```

## Step 5: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Google Drive Backup Setup (Optional)

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable Google Drive API
4. Create Service Account credentials
5. Download JSON key file
6. Save as `backend/config/credentials.json`
7. Update `GOOGLE_CREDENTIALS_PATH` in `.env`

## Troubleshooting

- **MongoDB connection error**: Make sure MongoDB is running
- **Port already in use**: Change PORT in `.env` file
- **Module not found**: Run `npm install` in both root and frontend directories
- **Google Drive backup fails**: Check credentials file path and permissions





