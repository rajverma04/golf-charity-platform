# 🚀 Complete Project API Guide

Now that we've enabled **Cookies**, you **NO LONGER NEED** to copy and paste tokens manually! Postman will handle the token automatically in the background across all your requests.

---

## 🛠️ Setup: How to use auto-login in Postman

Because the backend now sets an HTTP-only cookie, you must ensure Postman is allowed to accept it.

1. **Delete any leftover Tokens:** If you previously pasted a Bearer Token in Postman's "Authorization" tab, change the type back to **"No Auth"** so it doesn't conflict. 
2. **Cookies do the work:** Once you hit the `Login` or `Signup` API, the backend will send a `Set-Cookie` header. Postman will automatically save this cookie and send it with every future request (like `/scores` or `/profile`). No more manual copying!

*(Note: For Postman to accept localhost cookies, ensure `CORS_ORIGIN` in `.env` matches the origin you are testing from, or use the Postman desktop app).*

---

## 🔐 1. Authentication APIs

These APIs do not require authentication. They grant you the cookie!

### 🟢 Signup
Register a new user and automatically log them in (sets the auth cookie).

- **Method:** `POST`
- **URL:** `http://localhost:5001/auth/signup`
- **Body (JSON):**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "StrongPassword123"
  }
  ```

### 🟢 Login
Log in an existing user and set the auth cookie.

- **Method:** `POST`
- **URL:** `http://localhost:5001/auth/login`
- **Body (JSON):**
  ```json
  {
    "email": "jane@example.com",
    "password": "StrongPassword123"
  }
  ```

---

## 👤 2. User & Profile APIs

These APIs **require you to be logged in** (via the cookie). Ensure Postman Authorization is set to **No Auth** if the cookie handles it.

### 🟢 Get My Profile
Retrieve details of the currently logged-in user.

- **Method:** `GET`
- **URL:** `http://localhost:5001/profile`
- **Body:** *(none)*

### 🟢 Change Password
Change the logged-in user's password.

- **Method:** `PUT`
- **URL:** `http://localhost:5001/change-password`
- **Body (JSON):**
  ```json
  {
    "oldPassword": "StrongPassword123",
    "newPassword": "EvenStrongerPassword456"
  }
  ```

### 🟢 Forgot Password *(No auth required)*
Generate a simulated reset link.

- **Method:** `POST`
- **URL:** `http://localhost:5001/forgot-password`
- **Body (JSON):**
  ```json
  {
    "email": "jane@example.com"
  }
  ```

---

## 💳 3. Subscription APIs

You must have an **Active Subscription** to use the features below (like Scores). 

### 🟢 Create Subscription
"Buy" a required subscription to unlock the app.

- **Method:** `POST`
- **URL:** `http://localhost:5001/subscription/create`
- **Body (JSON):**
  *(Plan must be either "monthly" or "yearly")*
  ```json
  {
    "plan": "monthly"
  }
  ```

### 🟢 Check Subscription Status
See if your subscription is active and when it expires.

- **Method:** `GET`
- **URL:** `http://localhost:5001/subscription/status`
- **Body:** *(none)*

---

## 🎮 4. Scores APIs

Because of the `checkSubscription` middleware, you must **call the Create Subscription API first** before you can use these Score APIs. Otherwise, you will get a `403 Active subscription required` error.

### 🟢 Submit a New Score
Save a new game score for the logged-in user.

- **Method:** `POST`
- **URL:** `http://localhost:5001/scores`
- **Body (JSON):**
  ```json
  {
    "score": 1500,
    "game_mode": "Arcade" 
  }
  ```

### 🟢 Get My Historical Scores
Fetch all scores you've previously submitted.

- **Method:** `GET`
- **URL:** `http://localhost:5001/scores`
- **Body:** *(none)*

### 🟢 Get Global Leaderboard
Fetch the highest scores across all users on the platform.

- **Method:** `GET`
- **URL:** `http://localhost:5001/scores/leaderboard`
- **Body:** *(none)*

---

## ❤️ 5. Charities & Donations APIs

### 🟢 Get All Charities
Fetch a list of all charities available to choose from.
*(Note: You will need to insert rows into your Supabase `charities` table manually first!)*

- **Method:** `GET`
- **URL:** `http://localhost:5001/charities`
- **Body:** *(none)*

### 🟢 Select Preferred Charity
Select which charity receives a percentage of your winnings.

- **Method:** `POST`
- **URL:** `http://localhost:5001/user/charity`
- **Body (JSON):**
  ```json
  {
    "charityId": "uuid-from-get-charities",
    "percentage": 50
  }
  ```

---

## 🎯 6. Draw Engine APIs (Admin & User)

### 🔴 Run a New Draw (Admin Only)
Generates 5 random numbers for the current month in `draft` mode.

- **Method:** `POST`
- **URL:** `http://localhost:5001/admin/draw/run`
- **Body (JSON):**
  ```json
  {
    "type": "random"
  }
  ```

### 🔴 Publish Draw (Admin Only)
Moves the draw from `draft` to `published` so users can see it.

- **Method:** `POST`
- **URL:** `http://localhost:5001/admin/draw/publish`
- **Body (JSON):**
  ```json
  {
    "drawId": "uuid-of-the-draw"
  }
  ```

### 🟢 Get Latest Draw & Winners
Fetches the most recently published draw and its winner list.
*(Requires an active subscription)*

- **Method:** `GET`
- **URL:** `http://localhost:5001/draw/latest`
- **Body:** *(none)*

---

## 🏆 7. Winner Verification APIs

### 🟢 Upload Proof of Identity
For users who won a draw to upload their ID proof URL.
*(Requires an active subscription and actual winning record)*

- **Method:** `POST`
- **URL:** `http://localhost:5001/winner/upload-proof`
- **Body (JSON):**
  ```json
  {
    "drawId": "uuid-of-the-draw",
    "fileUrl": "https://imgur.com/your-id-image.jpg"
  }
  ```

### 🔴 Verify Winner (Admin Only)
Admin approves, rejects, or marks the payout as paid.

- **Method:** `POST`
- **URL:** `http://localhost:5001/admin/winner/verify`
- **Body (JSON):**
  ```json
  {
    "winnerId": "uuid-of-the-winner-record",
    "status": "approved"
  }
  ```

---

## 🎯 Quick Testing Flow

To test the entire funnel from scratch, run these in order:

1. `POST /auth/signup` *(Registers you & sets the cookie)*
2. `POST /subscription/create` *(Bypasses the subscription lock)*
3. `POST /scores` *(Adds data to the database)*
4. `GET /scores` *(Retrieves the data you just added!)*
