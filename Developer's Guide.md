# 🚀 YiZ Planner - Complete Developer Guide



*Last Updated: June 12th 2025*



---



## 📋 Table of Contents



- [🎯 Project Overview](#-project-overview)

- [🛠️ Tech Stack](#️-tech-stack)

- [🏗️ Architecture Overview](#️-architecture-overview)

- [📁 Codebase Structure](#-codebase-structure)

- [🔧 Backend Deep Dive](#-backend-deep-dive)

- [📱 Frontend Deep Dive](#-frontend-deep-dive)

- [🔌 API Documentation](#-api-documentation)

- [🗄️ Database Schema](#️-database-schema)

- [⚙️ Setup & Installation](#️-setup--installation)

- [🔄 Development Workflow](#-development-workflow)

- [✨ Key Features Implementation](#-key-features-implementation)

- [🚀 Deployment Guide](#-deployment-guide)

- [🔧 Troubleshooting](#-troubleshooting)

- [🔮 Future Improvements](#-future-improvements)



---



## 🎯 Project Overview



**YiZ Planner** is a revolutionary cross-platform application that transforms skill acquisition through AI-powered 30-day learning plans. It combines cutting-edge mobile development with artificial intelligence to deliver personalized, structured learning experiences.



### ✨ Core Functionality



| Feature | Description |

|---------|-------------|

| 🔐 **Secure Authentication** | JWT-based auth with 7-day expiry & auto-refresh |

| 🤖 **AI Plan Generation** | Personalized 30-day learning plans via OpenRouter AI |

| 📊 **Plan Management** | View, track, and manage daily learning tasks |

| 📱 **Cross-Platform** | iOS, Android (Expo Go), and Web (Vercel) support |



### 🎯 Target Audience



- **Students** seeking structured learning paths

- **Professionals** wanting to upskill systematically

- **Self-learners** desiring AI-guided skill development

- **Anyone** looking to master new skills with structure



---



## 🛠️ Tech Stack



### 📱 Frontend (Mobile & Web)

```

Framework │ React Native + Expo SDK 53

Language │ JavaScript (JSX) with TypeScript support

Navigation │ React Navigation (Stack + Tab)

State │ React Context + AsyncStorage

HTTP Client │ Axios

Icons │ Lucide React Native

Build/Host │ Vercel (web), Expo Go/EAS (mobile)

```



### 🖥️ Backend (API Server)

```

Framework │ Python 3.11 + Flask

Database  │ MongoDB Atlas/Local with PyMongo

Authentication│ PyJWT 2.10 + bcrypt 4.3

CORS │ Flask-CORS

Config │ python-dotenv (local) / Render env-vars

Server │ Gunicorn with app factory pattern

```



### 🤖 AI Services

```

Provider │ OpenRouter API

Model │ DeepSeek-Chat-v3 (free tier)

Purpose │ Generate structured 30-day learning plans

```



### 🛠️ Development Tools

```

Version Control │ Git / GitHub

Package Mgmt │ npm + pip

Testing │ Jest, React-Testing-Library, Pytest

Code Quality │ ESLint, Prettier, Black, Flake8

```



---



## 🏗️ Architecture Overview



```mermaid

graph TB

A[React Native App] <-->|HTTPS/JSON| B[Flask API]

B <--> C[MongoDB Atlas]

B <--> D[OpenRouter AI]


subgraph "Frontend"

A

A1[AuthContext]

A2[AsyncStorage]

A3[Navigation]

end


subgraph "Backend"

B

B1[JWT Auth]

B2[Plan Service]

B3[User Models]

end


subgraph "Data Layer"

C

C1[Users Collection]

C2[Plans Collection]

end

```



### 🔄 Data Flow Sequence



1. **App Launch**: AuthContext loads JWT from AsyncStorage → `/auth/verify`

2. **Authentication**: Backend verifies JWT signature & expiry → returns user

3. **Plan Generation**: `/generate-plan` → OpenRouter AI → structured response

4. **Persistence**: JWT & user data stored in AsyncStorage for offline access



---



## 📁 Codebase Structure



### 📱 Frontend Structure

```

frontend/

├── 📄 App.js # Navigation root with auth switch

├── 📄 .env # Environment configuration

├── 📁 src/

│ ├── 📁 api/

│ │ ├── 📄 apiConfig.js # ENV-driven base URL config

│ │ └── 📄 auth.js # Auth API helpers

│ ├── 📁 context/

│ │ └── 📄 AuthContext.js # JWT persistence & state

│ ├── 📁 components/

│ │ ├── 📄 Button.js # Reusable button component

│ │ └── 📄 Input.js # Reusable input component

│ ├── 📁 screens/

│ │ ├── 📄 Login.jsx # Login interface

│ │ ├── 📄 Register.jsx # Registration interface

│ │ ├── 📄 Home.jsx # Main dashboard

│ │ ├── 📄 PlanIndex.jsx # Plan overview

│ │ ├── 📄 DayDetail.jsx # Daily task details

│ │ └── 📄 Profile.jsx # User profile

│ └── 📁 constants/

│ └── 📄 colors.js # App color palette

└── 📁 assets/ # Static resources

```



### 🖥️ Backend Structure

```

backend/

├── 📄 app.py # Flask app factory (Gunicorn entry)

├── 📄 requirements.txt # Python dependencies

├── 📄 .env # Environment variables

├── 📁 auth/

│ ├── 📄 routes.py # Auth endpoints (/auth/*)

│ ├── 📄 models.py # User logic & DB operations

│ └── 📄 utils.py # Password hashing utilities

└── 📁 services/

└── 📄 plan_service.py # AI plan generation logic

```



---



## 🔧 Backend Deep Dive



### 🏗️ App Factory Pattern (`app.py`)



```python

def create_app():

"""Flask application factory with CORS configuration"""

app = Flask(__name__)


# CORS origins for cross-platform support

origins = [

FRONTEND_URL,

"http://localhost:8081", # Expo dev server

"exp://192.168.0.116:8081" # Expo Go

]


CORS(app, origins=origins)


# Module-level export for Gunicorn

app = create_app() # → gunicorn backend.app:app

```



### 🔐 Authentication System



#### 🔑 Security Features

- **bcrypt** hashing (12 rounds default)

- **JWT** payload: `{user_id, iat, exp(+7d)}`

- **Unique indexes** on username & email

- **Auto-created indexes** on first insert



#### 📊 User Model Operations

```python

class User:

@staticmethod

def create(username, email, password_hash):

"""Create new user with automatic timestamps"""


@staticmethod

def find_by_username_or_email(identifier):

"""Flexible login identifier lookup"""


@staticmethod

def update_last_login(user_id):

"""Track user activity"""

```



### 🤖 AI Plan Generation



```python

def generate_30_day_plan(skill):

"""

Generate structured 30-day learning plan


Returns:

list[dict]: [

{

"day": 1,

"tasks": ["Task 1", "Task 2", "Task 3"],

"resources": ["Resource 1", "Resource 2"]

}

# ... 30 days total

]

"""

```



#### 🎯 Plan Structure Validation

- ✅ Ensures exactly 30 days

- ✅ Validates JSON response format

- ✅ Handles API errors gracefully

- ✅ Cleans and formats output



---



## 📱 Frontend Deep Dive



### 🧭 Navigation Architecture



```

📱 App (AuthProvider)

├── 🔐 AuthStack

│ ├── LoginScreen

│ └── RegisterScreen

└── 🏠 MainTabNavigator

├── 📚 HomeStack (StackNavigator)

│ ├── HomeScreen

│ ├── PlanIndexScreen

│ └── DayDetailScreen

└── 👤 ProfileScreen

```



### 🔐 Authentication Context



```javascript

// Global authentication state management

const AuthContext = createContext();



// Key functions:

// • login(user, token) - Store in AsyncStorage + update state

// • logout() - Clear AsyncStorage + reset state

// • Auto-verification on app launch

// • Loading state management

```



### ⚙️ API Configuration



```javascript

// Environment-specific API endpoints

export const API_BASE_URL =

process.env.EXPO_PUBLIC_API_BASE_URL || // Mobile & web

process.env.REACT_APP_API_BASE_URL || // Web fallback

"http://192.168.0.116:8080"; // Development default

```



> 💡 **Pro Tip**: Metro shows `env: export ...` when environment variables are loaded



### 🎨 Screen Components



#### 🏠 HomeScreen Features

- Skill input interface with validation

- Plan generation with loading states

- Comprehensive error handling

- Sample plan loading for testing



#### 🔐 LoginScreen Features

- Form validation with real-time feedback

- AuthContext integration

- Smooth navigation transitions

- Error state management



---



## 🔌 API Documentation



### 🔐 Authentication Endpoints



#### Register User

```http

POST /auth/register

Content-Type: application/json



{

"username": "string",

"email": "string",

"password": "string"

}

```



**Response: 201 Created**

```json

{

"message": "User created successfully",

"token": "jwt_token_here",

"user": {

"_id": "user_id",

"username": "username",

"email": "email@example.com"

}

}

```



#### Login User

```http

POST /auth/login

Content-Type: application/json



{

"identifier": "username_or_email",

"password": "string"

}

```



**Response: 200 OK**

```json

{

"message": "Login successful",

"token": "jwt_token_here",

"user": {

"_id": "user_id",

"username": "username",

"email": "email@example.com"

}

}

```



#### Verify Token

```http

POST /auth/verify

Authorization: Bearer <token>

```



**Response: 200 OK**

```json

{

"valid": true,

"user": {

"_id": "user_id",

"username": "username",

"email": "email@example.com"

}

}

```



### 🤖 Plan Generation



#### Generate Learning Plan

```http

POST /generate-plan

Content-Type: application/json



{

"skill_name": "Python Programming"

}

```



**Response: 200 OK**

```json

{

"skill": "Python Programming",

"plan": [

{

"day": 1,

"tasks": [

"Set up Python development environment",

"Learn basic syntax and variables",

"Practice with simple print statements"

],

"resources": [

"Python.org official tutorial",

"Codecademy Python course"

]

}

// ... 29 more days

]

}

```



### 🔍 Health Check



#### System Health

```http

GET /health

```



**Response: 200 OK**

```json

{

"status": "healthy",

"message": "YiZ Planner API is running",

"timestamp": "2025-06-13T10:30:00Z"

}

```



### ❌ Error Responses



| Code | Description | Example |

|------|-------------|---------|

| `400` | Bad Request | Invalid input data |

| `401` | Unauthorized | Invalid credentials |

| `409` | Conflict | User already exists |

| `500` | Internal Server Error | Database connection issue |



---



## 🗄️ Database Schema



### 👥 Users Collection



```javascript

{

_id: ObjectId,

username: String, // unique index

email: String, // unique index

password_hash: String, // bcrypt hashed

created_at: ISODate, // auto-generated

updated_at: ISODate, // auto-updated

last_login: ISODate // tracked on login

}

```



### 📚 Plans Collection *(Future Implementation)*



```javascript

{

_id: ObjectId,

user_id: ObjectId, // reference to users

skill_name: String, // e.g., "Python Programming"

plan_data: Array, // 30-day structured plan

created_at: ISODate,

updated_at: ISODate,

status: String, // "active", "completed", "paused"

progress: {

completed_days: Number,

completion_percentage: Number,

last_accessed: ISODate

}

}

```



### 📊 Database Indexes



```javascript

// Automatically created on first insert

db.users.createIndex({ "username": 1 }, { unique: true })

db.users.createIndex({ "email": 1 }, { unique: true })



// Future indexes for plans

db.plans.createIndex({ "user_id": 1 })

db.plans.createIndex({ "user_id": 1, "status": 1 })

```



---



## ⚙️ Setup & Installation



### 📋 Prerequisites



- **Node.js** 16+

- **Python** 3.11+

- **MongoDB** (local or Atlas)

- **Expo CLI**

- **OpenRouter API** key



### 🖥️ Backend Setup



```bash

# 1. Navigate to backend directory

cd backend



# 2. Create virtual environment

python -m venv .venv



# 3. Activate virtual environment

# Windows:

.\.venv\Scripts\activate

# macOS/Linux:

source .venv/bin/activate



# 4. Install dependencies

pip install -r requirements.txt



# 5. Configure environment

cp .env.sample .env

# Edit .env with your configuration:

# MONGO_URI=mongodb://localhost:27017/skillplan_db

# OPENROUTER_API_KEY=your_api_key_here

# JWT_SECRET_KEY=your_jwt_secret

# BCRYPT_ROUNDS=12

# FRONTEND_URL=http://localhost:8081



# 6. Run the server

python app.py

# 🚀 Server running on http://localhost:8080

```



### 📱 Frontend Setup



```bash

# 1. Navigate to frontend directory

cd frontend



# 2. Install dependencies

npm install



# 3. Configure environment

cp .env.sample .env

# Edit .env:

# EXPO_PUBLIC_API_BASE_URL=http://localhost:8080



# 4. Start development server

npx expo start -c



# 5. Run on your preferred platform:

# 📱 Scan QR code with Expo Go app

# 🤖 Press 'a' for Android emulator

# 🍎 Press 'i' for iOS simulator

# 🌐 Press 'w' for web browser

```



### 🔧 Development Environment Verification



```bash

# Test backend health

curl http://localhost:8080/health



# Test frontend connection

# Check Metro bundler output for environment variables

# Look for: "env: export EXPO_PUBLIC_API_BASE_URL=..."

```



---



## 🔄 Development Workflow



### 🌿 Git Workflow



```bash

# 1. Create feature branch

git checkout -b feature/amazing-new-feature



# 2. Make changes with quality checks

npm run lint # Frontend linting

npm run format # Code formatting

black . # Backend formatting

flake8 . # Backend linting



# 3. Test thoroughly

npm test # Frontend tests

pytest # Backend tests



# 4. Commit with semantic messages

git commit -m "feat: add user profile customization"



# 5. Push and create PR

git push origin feature/amazing-new-feature

# Create PR: feature/amazing-new-feature → develop → main

```



### 🔧 Adding New Features



#### 📱 Frontend Feature Development



```javascript

// 1. Create new screen

// src/screens/NewFeatureScreen.jsx

import React, { useState } from 'react';

import { View, Text } from 'react-native';



const NewFeatureScreen = () => {

const [state, setState] = useState(null);


return (

<View>

<Text>New Feature</Text>

</View>

);

};



export default NewFeatureScreen;



// 2. Add to navigation (App.js)

import NewFeatureScreen from './src/screens/NewFeatureScreen';



<Stack.Screen

name="NewFeature"

component={NewFeatureScreen}

options={{ title: 'New Feature' }}

/>



// 3. Create API integration

// src/api/newFeature.js

import axios from 'axios';

import { API_BASE_URL } from './apiConfig';



export const newFeatureAPI = async (data) => {

const response = await axios.post(`${API_BASE_URL}/new-feature`, data);

return response.data;

};

```



#### 🖥️ Backend Feature Development



```python

# 1. Add route (app.py or new blueprint)

@app.route('/new-feature', methods=['POST'])

def new_feature():

try:

data = request.get_json()

result = process_new_feature(data)

return jsonify({"status": "success", "data": result})

except Exception as e:

return jsonify({"error": str(e)}), 500



# 2. Add business logic (services/new_feature_service.py)

def process_new_feature(data):

# Validate input

if not data or 'required_field' not in data:

raise ValueError("Missing required field")


# Process data

result = perform_complex_operation(data)


return result



# 3. Add database operations (if needed)

class NewFeatureModel:

@staticmethod

def create(data):

result = current_app.db.new_feature.insert_one(data)

return result.inserted_id


@staticmethod

def find_by_id(feature_id):

return current_app.db.new_feature.find_one({"_id": ObjectId(feature_id)})

```



### 🧪 Testing Strategy



#### 📱 Frontend Testing

```bash

# Unit tests

npm test



# Component testing

npm run test:components



# E2E testing (if configured)

npm run test:e2e

```



#### 🖥️ Backend Testing

```bash

# Unit tests

pytest tests/



# API testing

python -m unittest test_api.py



# Coverage report

pytest --cov=. --cov-report=html

```



---



## ✨ Key Features Implementation



### 🔐 Authentication Flow



```mermaid

sequenceDiagram

participant U as User

participant F as Frontend

participant A as AuthContext

participant B as Backend

participant DB as Database


U->>F: Enter credentials

F->>B: POST /auth/login

B->>DB: Query user

DB->>B: User data

B->>B: Verify password

B->>F: {token, user}

F->>A: login(user, token)

A->>A: Store in AsyncStorage

A->>F: Update global state

F->>U: Navigate to main app

```



### 🤖 Plan Generation Process



```mermaid

sequenceDiagram

participant U as User

participant F as Frontend

participant B as Backend

participant AI as OpenRouter AI


U->>F: Enter skill name

F->>F: Show loading state

F->>B: POST /generate-plan

B->>AI: Generate plan request

AI->>B: AI-generated plan

B->>B: Validate & format

B->>F: Structured 30-day plan

F->>F: Hide loading state

F->>U: Display interactive plan

```



### 💾 State Persistence



```javascript

// AuthContext.js - JWT & User Data Persistence

const AuthContext = createContext();



export const AuthProvider = ({ children }) => {

const [user, setUser] = useState(null);

const [loading, setLoading] = useState(true);



// Load persisted data on app launch

useEffect(() => {

loadPersistedAuth();

}, []);



const loadPersistedAuth = async () => {

try {

const token = await AsyncStorage.getItem('authToken');

const userData = await AsyncStorage.getItem('userData');


if (token && userData) {

// Verify token is still valid

const isValid = await authAPI.verifyToken(token);

if (isValid) {

setUser(JSON.parse(userData));

} else {

await clearAuthData();

}

}

} catch (error) {

console.error('Error loading auth data:', error);

} finally {

setLoading(false);

}

};



const login = async (userData, token) => {

try {

await AsyncStorage.setItem('authToken', token);

await AsyncStorage.setItem('userData', JSON.stringify(userData));

setUser(userData);

} catch (error) {

console.error('Error saving auth data:', error);

}

};



const logout = async () => {

await clearAuthData();

setUser(null);

};



return (

<AuthContext.Provider value={{ user, login, logout, loading }}>

{children}

</AuthContext.Provider>

);

};

```



### 🔧 Error Handling Strategy



#### 📱 Frontend Error Handling

```javascript

const handleAPIError = (error) => {

if (error.response) {

// Server responded with error status

const message = error.response.data?.message || 'Server error occurred';

setError(message);


// Handle specific status codes

if (error.response.status === 401) {

// Token expired, redirect to login

logout();

}

} else if (error.request) {

// Network error

setError('Network error. Please check your connection.');

} else {

// Other error

setError('An unexpected error occurred.');

}


// Log error for debugging

console.error('API Error:', error);

};

```



#### 🖥️ Backend Error Handling

```python

from flask import jsonify

import logging



# Configure logging

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)



@app.errorhandler(Exception)

def handle_error(error):

logger.error(f"Unhandled error: {str(error)}")


# Don't expose internal errors in production

if app.debug:

error_message = str(error)

else:

error_message = "An internal server error occurred"


return jsonify({

"error": "Internal server error",

"message": error_message

}), 500



@app.errorhandler(400)

def handle_bad_request(error):

return jsonify({

"error": "Bad request",

"message": "Invalid request data"

}), 400

```



---



## 🚀 Deployment Guide



### 🌐 Frontend Deployment (Vercel)



#### 📋 Configuration



```json

// vercel.json

{

"builds": [

{

"src": "package.json",

"use": "@vercel/static-build",

"config": {

"distDir": "web-build"

}

}

],

"routes": [

{

"src": "/(.*)",

"dest": "/index.html"

}

]

}

```



#### 🚀 Deployment Steps



```bash

# 1. Install Vercel CLI

npm i -g vercel



# 2. Build for web

expo export:web



# 3. Deploy to Vercel

vercel --prod



# 4. Set environment variables in Vercel dashboard:

# EXPO_PUBLIC_API_BASE_URL=https://your-backend-url.onrender.com

```



### 🖥️ Backend Deployment (Render)



#### 📋 Configuration



```python

# Procfile

web: gunicorn backend.app:app --bind 0.0.0.0:$PORT --timeout 120

```



#### ⚙️ Environment Variables



```bash

# Set in Render dashboard:

MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/skillplan_db

OPENROUTER_API_KEY=your_openrouter_key

JWT_SECRET_KEY=your_super_secret_jwt_key

FRONTEND_URL=https://your-frontend-url.vercel.app

BCRYPT_ROUNDS=12

FLASK_ENV=production

```



#### 🚀 Deployment Steps



1. **Connect Repository**: Link GitHub repo to Render

2. **Configure Build**:

- Build Command: `pip install -r requirements.txt`

- Start Command: `gunicorn backend.app:app --bind 0.0.0.0:$PORT`

3. **Set Environment Variables**: Add all required env vars

4. **Deploy**: Automatic deployment on git push



### 📱 Mobile App Distribution



#### 🍎 iOS (App Store)



```bash

# 1. Configure app.json for iOS

{

"expo": {

"ios": {

"bundleIdentifier": "com.yourcompany.yizplanner",

"buildNumber": "1.0.0"

}

}

}



# 2. Build for iOS

eas build --platform ios



# 3. Submit to App Store

eas submit --platform ios

```



#### 🤖 Android (Play Store)



```bash

# 1. Configure app.json for Android

{

"expo": {

"android": {

"package": "com.yourcompany.yizplanner",

"versionCode": 1

}

}

}



# 2. Build APK/AAB

eas build --platform android



# 3. Submit to Play Store

eas submit --platform android

```



---



## 🔧 Troubleshooting



### 📱 Common Frontend Issues



#### 🔄 Metro Bundler Issues

```bash

# Clear Metro cache

npx expo start --clear



# Reset npm cache

npm start -- --reset-cache



# Delete node_modules and reinstall

rm -rf node_modules package-lock.json

npm install

```



#### 🧭 Navigation Errors

```javascript

// Ensure proper navigation setup

import { NavigationContainer } from '@react-navigation/native';

import { createStackNavigator } from '@react-navigation/stack';



// Check screen imports

import HomeScreen from './src/screens/HomeScreen';



// Verify navigation usage

const navigation = useNavigation();

navigation.navigate('ScreenName', { param: 'value' });

```



#### 🌐 API Connection Issues

```javascript

// Debug API configuration

console.log('API Base URL:', API_BASE_URL);



// Test network connectivity

const testConnection = async () => {

try {

const response = await axios.get(`${API_BASE_URL}/health`);

console.log('✅ Backend connected:', response.data);

} catch (error) {

console.error('❌ Backend connection failed:', error.message);

}

};



// Check network permissions (app.json)

{

"expo": {

"permissions": ["INTERNET"]

}

}

```



### 🖥️ Common Backend Issues



#### 🗄️ MongoDB Connection

```python

# Test MongoDB connection

from pymongo import MongoClient

import os



try:

client = MongoClient(os.getenv('MONGO_URI'))

# Test connection

client.admin.command('ping')

print("✅ MongoDB connected successfully")

except Exception as e:

print(f"❌ MongoDB connection failed: {e}")

```



#### 🔗 CORS Issues

```python

# Ensure CORS is properly configured

from flask_cors import CORS



# Allow specific origins

CORS(app, origins=[

"http://localhost:8081", # Expo dev server

"https://yourapp.vercel.app", # Production frontend

"exp://192.168.0.116:8081" # Expo Go

])



# Debug CORS headers

@app.after_request

def after_request(response):

print(f"CORS headers: {response.headers}")

return response

```



#### 🤖 OpenRouter API Issues

```python

# Test OpenRouter API connection

import requests

import os



def test_openrouter_connection():

try:

response = requests.get(

"https://openrouter.ai/api/v1/models",

headers={"Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}"}

)

if response.status_code == 200:

print("✅ OpenRouter API connected")

else:

print(f"❌ OpenRouter API error: {response.status_code}")

except Exception as e:

print(f"❌ OpenRouter API connection failed: {e}")

```



### 🚀 Performance Issues



#### ⏱️ Plan Generation Timeout

```python

# Increase timeout in plan_service.py

response = requests.post(

url,

json=payload,

timeout=60, # Increased from 30 seconds

headers=headers

)

```



#### 📱 Frontend Rendering Performance

```javascript

// Optimize expensive components with React.memo

const ExpensiveComponent = React.memo(({ data }) => {

return <ComplexVisualization data={data} />;

});



// Optimize FlatList for large datasets

<FlatList

data={planDays}

renderItem={renderDayItem}

keyExtractor={(item) => item.day.toString()}

getItemLayout={(data, index) => ({

length: 80,

offset: 80 * index,

index

})}

removeClippedSubviews={true}

maxToRenderPerBatch={10}

windowSize={5}

/>

```



---



## 🔮 Future Improvements



### 🎯 Planned Features



| Priority | Feature              | Description                                                       | Timeline |
|----------|----------------------|-------------------------------------------------------------------|----------|
| 🔴 High  | **Progress Tracking**| Mark daily tasks as complete                                      | June  |
| 🟠 Medium| **Plan Persistence** | Save generated plans to a new `plans` collection and add `/plans/*` endpoints | June  |
| 🟡 Medium| **Push Notifications**| Daily learning-reminder notifications via Expo                   | June  |
| 🟢 Low   | **Gamification**     | Achievements & learning streak badges                             | June     |

## ✨ Recently Implemented (June 2025)

| 🎉 Feature | Description |
|------------|-------------|
| **JWT Auth Persistence** | • App factory pattern in Flask (`app = create_app()`) <br>• JWT tokens (7-day expiry) signed with `HS256` <br>• `AuthContext` saves token/user in AsyncStorage and auto-verifies on app boot |
| **Secure Password Flow** | bcrypt (12 rounds) hashing, configurable via `BCRYPT_ROUNDS` |
| **CORS by Env** | `FRONTEND_URL` env-var controls allowed origin; dev URLs hard-coded for Expo  |
| **Cloud-Ready Config** | All secrets & URLs pulled from env (Render/Vercel); local `.env` loaded with `python-dotenv` |
| **Gunicorn Compatibility** | Top-level `app` export lets Render run `gunicorn backend.app:app` |

---

## 📑 Environment-Variable Reference

| Key | Where Used | Local Example | Prod Example |
|-----|-----------|---------------|--------------|
| `MONGO_URI` | Backend | `mongodb://localhost:27017/skillplan_db` | Atlas SRV string |
| `JWT_SECRET_KEY` | Backend | `dev-secret-change` | 64-char hex |
| `OPENROUTER_API_KEY` | Backend | `sk-…` | Same |
| `FRONTEND_URL` | Backend CORS | `http://localhost:8081` | `https://<vercel-url>` |
| `BCRYPT_ROUNDS` | Backend | `12` | `12` |
| `EXPO_PUBLIC_API_BASE_URL` | Frontend | `http://192.168.0.116:8080` | `https://<render-url>` |

---

## 🧪 Testing Cheat-Sheet

```bash
# 👉 Backend
cd backend && .venv\Scripts\activate
pytest -q                # unit tests
curl http://localhost:8080/health
http POST :8080/auth/register username=a email=a@b.c password=secret  # httpie example

# 👉 Frontend
cd frontend
npm test                 # jest / RTL
npx expo start -c        # clear Metro cache + env load

# Verify persistence:
# 1. Register & login in Expo Go
# 2. Close Expo Go (swipe-away)
# 3. Re-open → app should enter MainTab without prompting
```

---

## 📞 Support & Resources

### Documentation Links
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [OpenRouter API Docs](https://openrouter.ai/docs)

### Development Communities
- [React Native Community](https://github.com/react-native-community)
- [Expo Forums](https://forums.expo.dev/)
- [Flask Discord](https://discord.gg/flask)

### Debugging Tools
- **Frontend**: React Native Debugger, Flipper
- **Backend**: Flask Debug Mode, MongoDB Compass
- **API Testing**: Postman, Insomnia

---

## 📄 License & Contributing

### Development Guidelines
1. Follow established code style and patterns
2. Write comprehensive tests for new features
3. Update documentation for API changes
4. Use semantic commit messages
5. Create feature branches for new development

### Code Review Process
1. Create feature branch from main
2. Implement feature with tests
3. Submit pull request with description
4. Address review feedback
5. Merge after approval

---

> **Keep this guide living!**  When you merge a feature branch that affects the API, database, or deployment flow, append a note here.
> *This guide serves as a living document and should be updated as the project evolves. For questions or clarifications, please reach out to the development team.*