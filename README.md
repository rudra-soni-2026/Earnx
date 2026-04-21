# EarnX 360 Backend

This is the Node.js backend for EarnX 360.

## Features
- **OTP Authentication**: Secure login via phone number and JWT.
- **Dynamic Game Control**: Manage rewards and game status from the database.
- **Anti-Cheat**: Reward verification based on play duration.
- **Withdrawal Management**: Request and track UPI/Paytm payouts.
- **Task System**: Dynamic list of tasks (Videos, Installs).

## Setup
1. **Prerequisites**: Node.js and MongoDB.
2. **Environment**: Update the `MONGODB_URI` and `JWT_SECRET` in the `.env` file.
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Start Server**:
   ```bash
   npm start
   ```

## API Endpoints
- `POST /api/auth/send-otp`: Sends a simulation OTP (check console).
- `POST /api/auth/verify-otp`: Returns JWT token and user profile.
- `GET /api/games/configs`: Fetch latest rewards and game statuses.
- `POST /api/withdraw/request`: Submit a withdrawal request with balance check.
- `GET /api/tasks`: Get list of active earning tasks.

## Anti-Cheat Logic
The `POST /api/games/end` endpoint checks the duration between `startGame` and `endGame`. If it's less than `minTimeSeconds` (defined in GameConfig), the reward is rejected.
# Earnx
