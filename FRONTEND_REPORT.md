# FitForge Frontend Report

## Project Overview

This project is a fitness management web application named **FitForge**. The frontend is built using **HTML, CSS, and Vanilla JavaScript**, while the backend is built with **Node.js, Express, and MongoDB**. The main purpose of the frontend is to provide different interfaces for **users, trainers, and admin** so that each role can access only its related features.

This report focuses mainly on the **frontend part** of the project and briefly explains how the frontend communicates with the backend through API calling and real-time updates.

## 1. Landing Page (`index.html`)

The frontend starts from `index.html`, which works as the public landing page of the system. It introduces the FitForge platform with sections like:

- Home
- Features
- About
- Contact

This page gives a quick overview of the system and provides two main entry points:

- `Login`
- `Sign Up`

So, `index.html` acts as the first page for users before authentication.

## 2. Authentication Pages

### Login Page (`login.html`)

The login page allows existing users to sign in using:

- Email
- Password

When the user clicks the login button, the frontend calls the `login()` function from `frontend/js/auth.js`. This function sends the entered data to the backend login API. After successful login:

- JWT token is saved in `localStorage`
- User role is saved in `localStorage`
- User basic details are also stored

Based on the role returned by the backend, the frontend redirects the user to:

- `dashboard-user.html` for normal users
- `dashboard-trainer.html` for trainers
- `dashboard-admin.html` for admin

### Signup Page (`signup.html`)

The signup page is used for new user registration. It collects:

- Name
- Email
- Password
- Height
- Weight
- Goal weight

The frontend validates that all values are filled and positive, then sends them to the backend register API. After successful registration, the user is redirected to the login page.

## 3. Frontend Configuration

The file `frontend/js/config.js` contains the backend base URL:

- `API_BASE = "https://fitforge-aprz.onrender.com"`

This makes all frontend API calls centralized and easier to manage. Instead of writing the full backend URL again and again, the application uses `API_BASE` in every JavaScript file.

## 4. User Dashboard (`dashboard-user.html`)

The user dashboard is designed for fitness clients or normal users. It shows their complete fitness progress in a simple and attractive way.

### Main frontend features in user dashboard

- Displays user profile data such as name and email
- Shows height, current weight, goal weight, and streak
- Calculates and shows BMI
- Displays BMI category like underweight, normal, overweight, or obese
- Shows goal insight, meaning how far the user is from the target weight
- Shows assigned diet plan
- Shows assigned workout plan
- Allows the user to request weight update
- Provides chat with trainer

### Working of `user.js`

The file `frontend/js/user.js` handles all user dashboard logic. It:

- Checks whether token exists in `localStorage`
- Fetches latest user data from `/api/user/me`
- Updates dashboard values dynamically
- Calculates BMI on the frontend
- Sends weight update request through `/api/user/request-update`
- Loads trainer details from `/api/chat/trainers`
- Loads old chat messages from `/api/chat/:receiverId`
- Sends and receives live chat messages using Socket.IO

This makes the user dashboard both dynamic and interactive.

## 5. Trainer Dashboard (`dashboard-trainer.html`)

The trainer dashboard is built for trainers who manage multiple fitness clients. It gives them a clear view of user progress and pending requests.

### Main frontend features in trainer dashboard

- Shows trainer profile information
- Displays total assigned clients
- Shows team success percentage
- Lists all assigned clients in a table
- Displays each client’s current weight and goal weight
- Shows BMI status of clients
- Displays pending weight update requests
- Allows trainer to approve or reject requests
- Allows trainer to assign diet plan and workout plan
- Enables direct chat with clients

### Working of `trainer.js`

The file `frontend/js/trainer.js` handles trainer-side operations. It:

- Loads assigned users using `/api/trainer/users`
- Renders pending update cards
- Sends approval request to `/api/trainer/approve/:id`
- Sends reject request to `/api/trainer/reject/:id`
- Sends diet/workout plan data to `/api/trainer/assign-plan/:userId`
- Loads chat history from `/api/chat/:userId`
- Uses Socket.IO for real-time trainer-client communication

This dashboard is important because it connects the trainer with the users and helps manage progress efficiently.

## 6. Admin Dashboard (`dashboard-admin.html`)

The admin dashboard is used for system-level management. Admin has authority to manage users and trainers.

### Main frontend features in admin dashboard

- View total registered users
- View total active trainers
- See list of all users
- See list of all trainers
- Assign trainer to a user
- Create a new trainer account
- Delete user
- Delete trainer

### Working of `admin.js`

The file `frontend/js/admin.js` handles the admin area. It:

- Loads all users from `/api/admin/users`
- Loads all trainers from `/api/admin/trainers`
- Sends trainer assignment request to `/api/admin/assign`
- Sends new trainer creation request to `/api/admin/create-trainer`
- Sends delete user request to `/api/admin/delete-user/:id`
- Sends delete trainer request to `/api/admin/delete-trainer/:id`

The admin dashboard helps in maintaining overall control of the application and user-trainer allocation.

## 7. API Calling in Frontend

API calling is one of the most important parts of this project. The frontend uses the `fetch()` method to communicate with backend APIs.

### How API calling works here

1. Frontend collects input from forms or buttons.
2. JavaScript sends request to backend using `fetch()`.
3. Backend processes the request and sends JSON response.
4. Frontend reads the response and updates the UI.

### Common API calling pattern

In most files, the frontend sends requests like:

- `GET` for loading data
- `POST` for login, signup, assigning plan, approval, etc.
- `DELETE` for removing users or trainers

### Authentication in API calls

After login, the backend returns a JWT token. The frontend stores this token in `localStorage`. For protected routes, the token is sent in headers like:

`Authorization: Bearer <token>`

Because of this, only authenticated users can access their dashboard and protected backend routes.

## 8. Real-Time Communication

Another important feature of this project is real-time communication. The frontend uses **Socket.IO** for chat and instant updates.

### Real-time features used

- User can send message to trainer
- Trainer can reply instantly
- User receives plan updates without manually refreshing
- Trainer gets new weight request notification
- User receives approved weight update event

This improves the user experience and makes the project more modern than a normal static web app.

## 9. Frontend Design and User Experience

The frontend design uses a modern dark theme with glassmorphism style. Some important UI points are:

- Responsive layout
- Clean dashboard sections
- Attractive cards and tables
- Role-based navigation
- Interactive forms and buttons
- Easy readability with highlighted accent color

Different dashboards are designed separately, which makes the system organized and user friendly.

## 10. Conclusion

The frontend of FitForge is well-structured and divided according to user roles. The project begins with a landing page, then moves to login and signup pages, and finally redirects users to their specific dashboards. Each dashboard performs different tasks:

- User dashboard focuses on personal fitness tracking
- Trainer dashboard focuses on client management and plan assignment
- Admin dashboard focuses on system management

Along with frontend design, API calling plays an important role in making the application functional. The frontend sends requests to the backend, receives JSON responses, stores authentication tokens, and updates the interface dynamically. Real-time features using Socket.IO further improve communication between users and trainers.

Overall, the frontend part of this project successfully provides a complete and interactive fitness management experience.
